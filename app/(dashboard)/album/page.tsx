import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getTeamsWithProgress } from '@/server/queries/album'
import { TeamCard } from '@/components/album/team-card'
import { Progress } from '@/components/ui/progress'
import { db } from '@/lib/db'
import { AlbumPageSkeleton } from '@/components/album/skeletons'

async function AlbumContent() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [teams, album] = await Promise.all([
    getTeamsWithProgress(),
    db.album.findUnique({
      where: { userId: session.user.id },
      select: { completionPercentage: true },
    }),
  ])

  const progress = album?.completionPercentage ?? 0

  // Group teams by group (A–L)
  const grouped = teams.reduce<Record<string, typeof teams>>((acc, team) => {
    if (!acc[team.group]) acc[team.group] = []
    acc[team.group].push(team)
    return acc
  }, {})

  const groups = Object.keys(grouped).sort()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-xl bg-linear-to-r from-[#1a472a] to-[#0d2b1a] p-6 text-white shadow">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mi Álbum 2026</h1>
            <p className="mt-1 text-sm text-green-200">FIFA World Cup · USA · México · Canadá</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <p className="text-3xl font-bold text-[#d4af37]">{progress.toFixed(1)}%</p>
              <p className="text-xs text-green-200">completado</p>
            </div>
            <a
              href="/api/album/export"
              download
              className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-green-100 transition hover:bg-white/20"
            >
              ↓ Exportar JSON
            </a>
          </div>
        </div>
        <Progress value={progress} className="mt-4 h-2 bg-white/20 [&>div]:bg-[#d4af37]" />
      </div>

      {/* Groups grid */}
      {groups.map((group) => (
        <section key={group}>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-800">
            <span className="flex size-7 items-center justify-center rounded-full bg-[#1a472a] text-sm font-bold text-white">
              {group}
            </span>
            Grupo {group}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {grouped[group].map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export default function AlbumPage() {
  return (
    <Suspense fallback={<AlbumPageSkeleton />}>
      <AlbumContent />
    </Suspense>
  )
}
