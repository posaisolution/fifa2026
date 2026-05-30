import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { TradesClient } from './trades-client'
import { Skeleton } from '@/components/ui/skeleton'

async function TradesContent() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const album = await db.album.findUnique({ where: { userId: session.user.id } })
  if (!album) redirect('/login')

  const [duplicates, missing, incoming, outgoing] = await Promise.all([
    db.sticker.findMany({
      where: { albumId: album.id, status: 'DUPLICATE' },
      include: { player: { include: { team: true } } },
      orderBy: [{ player: { team: { name: 'asc' } } }, { player: { name: 'asc' } }],
    }),
    db.sticker.findMany({
      where: { albumId: album.id, status: 'MISSING' },
      include: {
        player: { include: { team: { select: { name: true, flagUrl: true, group: true } } } },
      },
      orderBy: [{ player: { team: { group: 'asc' } } }, { player: { name: 'asc' } }],
    }),
    db.trade.findMany({
      where: { toUserId: session.user.id, status: 'PENDING' },
      include: {
        fromUser: { select: { name: true } },
        stickerOffered: { include: { player: { include: { team: true } } } },
        stickerWanted: { include: { player: { include: { team: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    db.trade.findMany({
      where: { fromUserId: session.user.id },
      include: {
        toUser: { select: { name: true } },
        stickerOffered: { include: { player: { include: { team: true } } } },
        stickerWanted: { include: { player: { include: { team: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  return (
    <TradesClient
      duplicates={duplicates}
      missing={missing}
      incoming={incoming}
      outgoing={outgoing}
    />
  )
}

export default function IntercambiosPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      }
    >
      <TradesContent />
    </Suspense>
  )
}
