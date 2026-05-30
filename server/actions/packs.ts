'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import type { PlayerRarity } from '@prisma/client'

const PACK_COST = 20
const PACK_SIZE = 5
const FREE_PACK_HOURS = 24

const DUPLICATE_COINS: Record<PlayerRarity, number> = { COMMON: 2, RARE: 5, LEGEND: 15 }

export type PackStickerResult = {
  playerId: string
  playerName: string
  playerNumber: number
  playerPosition: string
  teamName: string
  teamFlagUrl: string
  rarity: PlayerRarity
  wasNew: boolean
}

export type PackResult = {
  packOpeningId: string
  coinsSpent: number
  coinsEarned: number
  newCoinsBalance: number
  stickers: PackStickerResult[]
}

function pickRarity(): PlayerRarity {
  const rand = Math.random() * 100
  if (rand < 5) return 'LEGEND'
  if (rand < 30) return 'RARE'
  return 'COMMON'
}

async function buildPack(
  albumId: string,
  isFree: boolean,
  coinsSpent: number
): Promise<PackResult> {
  const allPlayers = await db.player.findMany({
    include: {
      team: { select: { name: true, flagUrl: true } },
      stickers: { where: { albumId }, select: { status: true } },
    },
  })

  const byRarity = (rarity: PlayerRarity, onlyMissing: boolean) =>
    allPlayers.filter((p) => {
      if (p.rarity !== rarity) return false
      if (!onlyMissing) return true
      return !p.stickers[0] || p.stickers[0].status === 'MISSING'
    })

  const pickedIds = new Set<string>()
  const picked: typeof allPlayers = []

  for (let i = 0; i < PACK_SIZE; i++) {
    const rarity = pickRarity()
    const missing = byRarity(rarity, true).filter((p) => !pickedIds.has(p.id))
    const all = byRarity(rarity, false).filter((p) => !pickedIds.has(p.id))
    const fallback = allPlayers.filter((p) => !pickedIds.has(p.id))

    const pool =
      missing.length > 0 && Math.random() < 0.9 ? missing : all.length > 0 ? all : fallback

    if (pool.length === 0) continue
    const player = pool[Math.floor(Math.random() * pool.length)]
    pickedIds.add(player.id)
    picked.push(player)
  }

  const stickerResults: PackStickerResult[] = picked.map((p) => ({
    playerId: p.id,
    playerName: p.name,
    playerNumber: p.number,
    playerPosition: p.position,
    teamName: p.team.name,
    teamFlagUrl: p.team.flagUrl,
    rarity: p.rarity,
    wasNew: !p.stickers[0] || p.stickers[0].status === 'MISSING',
  }))

  const coinsEarned = stickerResults
    .filter((s) => !s.wasNew)
    .reduce((sum, s) => sum + DUPLICATE_COINS[s.rarity], 0)

  const { packOpeningId, newCoins } = await db.$transaction(async (tx) => {
    // Update sticker statuses
    for (const s of stickerResults) {
      if (s.wasNew) {
        await tx.sticker.upsert({
          where: { playerId_albumId: { playerId: s.playerId, albumId } },
          update: { status: 'OWNED', acquiredAt: new Date() },
          create: { playerId: s.playerId, albumId, status: 'OWNED', acquiredAt: new Date() },
        })
      } else {
        const current = picked.find((p) => p.id === s.playerId)?.stickers[0]
        if (current?.status === 'OWNED') {
          await tx.sticker.update({
            where: { playerId_albumId: { playerId: s.playerId, albumId } },
            data: { status: 'DUPLICATE' },
          })
        }
      }
    }

    // Create pack opening record
    const opening = await tx.packOpening.create({
      data: {
        albumId,
        isFree,
        coinsSpent,
        coinsEarned,
        stickers: {
          create: stickerResults.map((s) => ({ playerId: s.playerId, wasNew: s.wasNew })),
        },
      },
    })

    // Recalculate completion % and update coins
    const [total, owned] = await Promise.all([
      tx.sticker.count({ where: { albumId } }),
      tx.sticker.count({ where: { albumId, status: { in: ['OWNED', 'DUPLICATE'] } } }),
    ])

    const updated = await tx.album.update({
      where: { id: albumId },
      data: {
        coins: { increment: coinsEarned - coinsSpent },
        completionPercentage: total > 0 ? (owned / total) * 100 : 0,
        ...(isFree ? { lastFreePackAt: new Date() } : {}),
      },
      select: { coins: true },
    })

    return { packOpeningId: opening.id, newCoins: updated.coins }
  })

  return {
    packOpeningId,
    coinsSpent,
    coinsEarned,
    newCoinsBalance: newCoins,
    stickers: stickerResults,
  }
}

export async function openFreePack(): Promise<PackResult> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autorizado')

  const album = await db.album.findUnique({
    where: { userId: session.user.id },
    select: { id: true, lastFreePackAt: true },
  })
  if (!album) throw new Error('Álbum no encontrado')

  if (album.lastFreePackAt) {
    const hours = (Date.now() - album.lastFreePackAt.getTime()) / 3_600_000
    if (hours < FREE_PACK_HOURS) {
      const remaining = Math.ceil(FREE_PACK_HOURS - hours)
      throw new Error(`Tu próximo sobre gratis estará disponible en ${remaining}h`)
    }
  }

  const result = await buildPack(album.id, true, 0)
  revalidatePath('/sobres')
  revalidatePath('/album')
  return result
}

export async function openPaidPack(): Promise<PackResult> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autorizado')

  const album = await db.album.findUnique({
    where: { userId: session.user.id },
    select: { id: true, coins: true },
  })
  if (!album) throw new Error('Álbum no encontrado')
  if (album.coins < PACK_COST) {
    throw new Error(`Monedas insuficientes. Necesitas ${PACK_COST} monedas.`)
  }

  const result = await buildPack(album.id, false, PACK_COST)
  revalidatePath('/sobres')
  revalidatePath('/album')
  return result
}
