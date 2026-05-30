import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { StatsClient } from './stats-client'
import { StatsPageSkeleton } from '@/components/album/skeletons'

async function StatsContent() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const album = await db.album.findUnique({
    where: { userId: session.user.id },
    select: { id: true, completionPercentage: true },
  })
  if (!album) redirect('/login')

  const stickers = await db.sticker.findMany({
    where: { albumId: album.id },
    include: {
      player: {
        include: {
          team: { select: { name: true, confederation: true, group: true } },
        },
      },
    },
  })

  const total = stickers.length
  const owned = stickers.filter((s) => s.status !== 'MISSING').length
  const duplicates = stickers.filter((s) => s.status === 'DUPLICATE').length

  // By confederation
  const confMap: Record<string, { total: number; owned: number }> = {}
  for (const s of stickers) {
    const conf = s.player.team.confederation
    if (!confMap[conf]) confMap[conf] = { total: 0, owned: 0 }
    confMap[conf].total++
    if (s.status !== 'MISSING') confMap[conf].owned++
  }

  // By position
  const posMap: Record<string, { total: number; owned: number }> = {}
  for (const s of stickers) {
    const pos = s.player.position
    if (!posMap[pos]) posMap[pos] = { total: 0, owned: 0 }
    posMap[pos].total++
    if (s.status !== 'MISSING') posMap[pos].owned++
  }

  const stats = {
    total,
    owned,
    duplicates,
    completionPercentage: album.completionPercentage,
    byConfederation: Object.entries(confMap).map(([name, data]) => ({ name, ...data })),
    byPosition: Object.entries(posMap).map(([name, data]) => ({ name, ...data })),
  }

  return <StatsClient stats={stats} />
}

export default function StatsPage() {
  return (
    <Suspense fallback={<StatsPageSkeleton />}>
      <StatsContent />
    </Suspense>
  )
}
