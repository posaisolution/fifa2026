import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { Navbar } from '@/components/album/navbar'
import { TournamentAdmin } from './tournament-admin'
import { Skeleton } from '@/components/ui/skeleton'

async function TournamentAdminContent() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/album')

  const [matches, teams] = await Promise.all([
    db.match.findMany({
      where: { stage: 'GROUP' },
      include: {
        homeTeam: { select: { id: true, name: true, flagUrl: true, group: true } },
        awayTeam: { select: { id: true, name: true, flagUrl: true, group: true } },
        goals: {
          include: { player: { select: { id: true, name: true } } },
          orderBy: { minute: 'asc' },
        },
      },
      orderBy: [{ group: 'asc' }, { matchDay: 'asc' }],
    }),
    db.team.findMany({
      orderBy: [{ group: 'asc' }, { name: 'asc' }],
      include: { players: { select: { id: true, name: true }, orderBy: { name: 'asc' } } },
    }),
  ])

  return <TournamentAdmin matches={matches} teams={teams} />
}

export default function TournamentAdminPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Suspense fallback={<Skeleton className="h-64 rounded-xl" />}>
          <TournamentAdminContent />
        </Suspense>
      </main>
    </div>
  )
}
