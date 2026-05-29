import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { cache } from 'react'

export const getAlbumByUser = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) return null

  return db.album.findUnique({
    where: { userId: session.user.id },
    include: {
      stickers: {
        include: { player: { include: { team: true } } },
      },
    },
  })
})

export const getTeamsWithProgress = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) return []

  const teams = await db.team.findMany({
    orderBy: [{ group: 'asc' }, { name: 'asc' }],
    include: {
      players: {
        include: {
          stickers: {
            where: {
              album: { userId: session.user.id },
            },
          },
        },
      },
    },
  })

  return teams.map((team) => ({
    id: team.id,
    fifaCode: team.fifaCode,
    name: team.name,
    group: team.group,
    confederation: team.confederation,
    flagUrl: team.flagUrl,
    coverImageUrl: team.coverImageUrl,
    totalPlayers: team.players.length,
    ownedPlayers: team.players.filter((p) =>
      p.stickers.some((s) => s.status === 'OWNED' || s.status === 'DUPLICATE')
    ).length,
  }))
})

export const getTeamPlayers = cache(async (teamId: string) => {
  const session = await auth()
  if (!session?.user?.id) return []

  const album = await db.album.findUnique({
    where: { userId: session.user.id },
  })
  if (!album) return []

  const players = await db.player.findMany({
    where: { teamId },
    orderBy: { number: 'asc' },
    include: {
      stickers: {
        where: { albumId: album.id },
      },
    },
  })

  return players.map((player) => {
    const sticker = player.stickers[0]
    return {
      id: player.id,
      name: player.name,
      position: player.position,
      number: player.number,
      imageUrl: player.imageUrl,
      rarity: player.rarity,
      stickerStatus: sticker?.status ?? 'MISSING',
      stickerId: sticker?.id,
    }
  })
})
