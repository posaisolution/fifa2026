import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// My missing stickers (what I can request)
export async function getMyMissingStickers() {
  const session = await auth()
  if (!session?.user?.id) return []

  const album = await db.album.findUnique({ where: { userId: session.user.id } })
  if (!album) return []

  return db.sticker.findMany({
    where: { albumId: album.id, status: 'MISSING' },
    include: {
      player: {
        include: { team: { select: { name: true, flagUrl: true, group: true } } },
      },
    },
    orderBy: [{ player: { team: { group: 'asc' } } }, { player: { name: 'asc' } }],
  })
}

// My duplicate stickers (what I can offer)
export async function getMyDuplicateStickers() {
  const session = await auth()
  if (!session?.user?.id) return []

  const album = await db.album.findUnique({ where: { userId: session.user.id } })
  if (!album) return []

  return db.sticker.findMany({
    where: { albumId: album.id, status: 'DUPLICATE' },
    include: {
      player: {
        include: { team: { select: { name: true, flagUrl: true } } },
      },
    },
    orderBy: [{ player: { team: { name: 'asc' } } }, { player: { name: 'asc' } }],
  })
}

// Users who have a specific player (to propose a trade to them)
export async function getUsersWithPlayer(playerId: string) {
  const session = await auth()
  if (!session?.user?.id) return []

  return db.sticker.findMany({
    where: {
      playerId,
      status: { in: ['OWNED', 'DUPLICATE'] },
      album: { userId: { not: session.user.id } },
    },
    include: {
      album: {
        include: { user: { select: { id: true, name: true } } },
      },
    },
  })
}
