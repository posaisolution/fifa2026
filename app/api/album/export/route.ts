import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const album = await db.album.findUnique({
    where: { userId: session.user.id },
    include: {
      stickers: {
        include: {
          player: {
            include: {
              team: { select: { name: true, fifaCode: true, group: true, confederation: true } },
            },
          },
        },
      },
    },
  })

  if (!album) return NextResponse.json({ error: 'Álbum no encontrado' }, { status: 404 })

  const exportData = {
    exportedAt: new Date().toISOString(),
    completionPercentage: album.completionPercentage,
    stickers: album.stickers.map((s) => ({
      player: s.player.name,
      number: s.player.number,
      position: s.player.position,
      team: s.player.team.name,
      group: s.player.team.group,
      confederation: s.player.team.confederation,
      status: s.status,
      acquiredAt: s.acquiredAt,
    })),
  }

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="album-2026-${Date.now()}.json"`,
    },
  })
}
