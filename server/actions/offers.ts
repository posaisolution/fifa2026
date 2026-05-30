'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import type { PlayerRarity } from '@prisma/client'

export async function publishOffer(
  offeredPlayerId: string,
  wantedPlayerId: string | null,
  wantedRarity: PlayerRarity | null
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autorizado')

  // Verify the offered player is a DUPLICATE in the user's album
  const album = await db.album.findUnique({ where: { userId: session.user.id } })
  if (!album) throw new Error('Álbum no encontrado')

  const sticker = await db.sticker.findFirst({
    where: { playerId: offeredPlayerId, albumId: album.id, status: 'DUPLICATE' },
  })
  if (!sticker) throw new Error('Solo puedes ofrecer figuritas repetidas')

  // Check no open offer already exists for this player
  const existing = await db.tradeOffer.findFirst({
    where: { userId: session.user.id, offeredPlayerId, status: 'OPEN' },
  })
  if (existing) throw new Error('Ya tienes una oferta activa con esa figurita')

  await db.tradeOffer.create({
    data: {
      userId: session.user.id,
      offeredPlayerId,
      wantedPlayerId: wantedPlayerId ?? null,
      wantedRarity: wantedRarity ?? null,
    },
  })

  revalidatePath('/intercambios')
}

export async function claimOffer(offerId: string, myOfferedPlayerId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autorizado')

  const offer = await db.tradeOffer.findFirst({
    where: { id: offerId, status: 'OPEN' },
    include: { offeredPlayer: true, wantedPlayer: true },
  })
  if (!offer) throw new Error('Oferta no encontrada o ya no está disponible')
  if (offer.userId === session.user.id) throw new Error('No puedes reclamar tu propia oferta')

  const album = await db.album.findUnique({ where: { userId: session.user.id } })
  if (!album) throw new Error('Álbum no encontrado')

  // Verify the claimer has the wanted player (if specific)
  if (offer.wantedPlayerId) {
    const wantedSticker = await db.sticker.findFirst({
      where: {
        playerId: offer.wantedPlayerId,
        albumId: album.id,
        status: { in: ['OWNED', 'DUPLICATE'] },
      },
    })
    if (!wantedSticker) throw new Error('No tienes la figurita que piden')
  }

  // Verify what the claimer offers is a DUPLICATE
  const mySticker = await db.sticker.findFirst({
    where: { playerId: myOfferedPlayerId, albumId: album.id, status: 'DUPLICATE' },
  })
  if (!mySticker) throw new Error('Solo puedes ofrecer figuritas repetidas')

  // Verify rarity matches if offer has rarity requirement
  if (offer.wantedRarity) {
    const player = await db.player.findUnique({ where: { id: myOfferedPlayerId } })
    if (player?.rarity !== offer.wantedRarity) {
      throw new Error(`Esta oferta pide una figurita ${offer.wantedRarity}`)
    }
  }

  // Check no pending claim already from this user
  const existingClaim = await db.offerClaim.findFirst({
    where: { offerId, claimerUserId: session.user.id, status: 'PENDING' },
  })
  if (existingClaim) throw new Error('Ya tienes una solicitud pendiente para esta oferta')

  await db.offerClaim.create({
    data: { offerId, claimerUserId: session.user.id, offeredPlayerId: myOfferedPlayerId },
  })

  revalidatePath('/intercambios')
}

export async function respondClaim(claimId: string, accept: boolean) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autorizado')

  const claim = await db.offerClaim.findFirst({
    where: { id: claimId, offer: { userId: session.user.id } },
    include: {
      offer: true,
      offeredPlayer: true,
    },
  })
  if (!claim) throw new Error('Solicitud no encontrada')

  if (!accept) {
    await db.offerClaim.update({ where: { id: claimId }, data: { status: 'REJECTED' } })
    revalidatePath('/intercambios')
    return
  }

  // Execute the swap
  await db.$transaction(async (tx) => {
    const ownerAlbum = await tx.album.findUnique({ where: { userId: session.user.id } })
    const claimerAlbum = await tx.album.findUnique({ where: { userId: claim.claimerUserId } })
    if (!ownerAlbum || !claimerAlbum) throw new Error('Álbum no encontrado')

    // Owner loses their DUPLICATE, claimer gets it as OWNED
    await tx.sticker.updateMany({
      where: { playerId: claim.offer.offeredPlayerId, albumId: ownerAlbum.id, status: 'DUPLICATE' },
      data: { status: 'MISSING', acquiredAt: null },
    })
    await tx.sticker.upsert({
      where: {
        playerId_albumId: { playerId: claim.offer.offeredPlayerId, albumId: claimerAlbum.id },
      },
      update: { status: 'OWNED', acquiredAt: new Date() },
      create: {
        playerId: claim.offer.offeredPlayerId,
        albumId: claimerAlbum.id,
        status: 'OWNED',
        acquiredAt: new Date(),
      },
    })

    // Claimer loses their DUPLICATE, owner gets it as OWNED
    await tx.sticker.updateMany({
      where: { playerId: claim.offeredPlayerId, albumId: claimerAlbum.id, status: 'DUPLICATE' },
      data: { status: 'MISSING', acquiredAt: null },
    })
    await tx.sticker.upsert({
      where: { playerId_albumId: { playerId: claim.offeredPlayerId, albumId: ownerAlbum.id } },
      update: { status: 'OWNED', acquiredAt: new Date() },
      create: {
        playerId: claim.offeredPlayerId,
        albumId: ownerAlbum.id,
        status: 'OWNED',
        acquiredAt: new Date(),
      },
    })

    // Close the offer and claim
    await tx.offerClaim.update({ where: { id: claimId }, data: { status: 'ACCEPTED' } })
    await tx.tradeOffer.update({ where: { id: claim.offerId }, data: { status: 'CLAIMED' } })

    // Reject other pending claims
    await tx.offerClaim.updateMany({
      where: { offerId: claim.offerId, status: 'PENDING', id: { not: claimId } },
      data: { status: 'REJECTED' },
    })
  })

  revalidatePath('/intercambios')
  revalidatePath('/album')
}

export async function cancelOffer(offerId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autorizado')

  const offer = await db.tradeOffer.findFirst({
    where: { id: offerId, userId: session.user.id, status: 'OPEN' },
  })
  if (!offer) throw new Error('Oferta no encontrada')

  await db.$transaction([
    db.offerClaim.updateMany({
      where: { offerId, status: 'PENDING' },
      data: { status: 'REJECTED' },
    }),
    db.tradeOffer.update({
      where: { id: offerId },
      data: { status: 'CANCELLED' },
    }),
  ])

  revalidatePath('/intercambios')
}
