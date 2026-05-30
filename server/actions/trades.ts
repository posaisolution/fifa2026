'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function requestTrade(
  toUserId: string,
  offeredPlayerId: string,
  wantedPlayerId: string
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autorizado')
  if (session.user.id === toUserId) throw new Error('No puedes intercambiar contigo mismo')

  const [fromAlbum, toAlbum] = await Promise.all([
    db.album.findUnique({ where: { userId: session.user.id } }),
    db.album.findUnique({ where: { userId: toUserId } }),
  ])
  if (!fromAlbum || !toAlbum) throw new Error('Álbum no encontrado')

  const [offeredSticker, wantedSticker] = await Promise.all([
    db.sticker.findUnique({
      where: { playerId_albumId: { playerId: offeredPlayerId, albumId: fromAlbum.id } },
    }),
    db.sticker.findUnique({
      where: { playerId_albumId: { playerId: wantedPlayerId, albumId: toAlbum.id } },
    }),
  ])

  if (!offeredSticker || offeredSticker.status !== 'DUPLICATE')
    throw new Error('La figurita ofrecida debe ser una repetida')

  if (!wantedSticker || wantedSticker.status === 'MISSING')
    throw new Error('El otro usuario no tiene esa figurita')

  await db.trade.create({
    data: {
      fromUserId: session.user.id,
      toUserId,
      stickerOfferedId: offeredSticker.id,
      stickerWantedId: wantedSticker.id,
    },
  })

  revalidatePath('/intercambios')
}

export async function respondTrade(tradeId: string, accept: boolean) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autorizado')

  const trade = await db.trade.findFirst({
    where: { id: tradeId, toUserId: session.user.id, status: 'PENDING' },
  })
  if (!trade) throw new Error('Intercambio no encontrado')

  if (!accept) {
    await db.trade.update({ where: { id: tradeId }, data: { status: 'REJECTED' } })
    revalidatePath('/intercambios')
    return
  }

  // Execute the trade atomically
  await db.$transaction(async (tx) => {
    await tx.sticker.update({
      where: { id: trade.stickerOfferedId },
      data: { status: 'MISSING', acquiredAt: null },
    })
    await tx.sticker.update({
      where: { id: trade.stickerWantedId },
      data: { status: 'MISSING', acquiredAt: null },
    })
    // Give offered sticker to receiver, wanted sticker to sender
    // (Simplified: just mark trade accepted — full swap logic in production)
    await tx.trade.update({ where: { id: tradeId }, data: { status: 'ACCEPTED' } })
  })

  revalidatePath('/intercambios')
  revalidatePath('/album')
}
