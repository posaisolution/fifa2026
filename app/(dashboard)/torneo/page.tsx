import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getRecentMatches, getUpcomingMatches, getTopScorers } from '@/server/queries/tournament'
import { db } from '@/lib/db'
import { Skeleton } from '@/components/ui/skeleton'

function MatchCard({
  match,
}: {
  match: {
    id: string
    homeGoals: number | null
    awayGoals: number | null
    status: string
    playedAt: Date | null
    stage: string
    group: string | null
    homeTeam: { name: string; flagUrl: string }
    awayTeam: { name: string; flagUrl: string }
  }
  showResult?: boolean
}) {
  const isFinished = match.status === 'FINISHED'
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm dark:bg-gray-800">
      <div className="flex flex-1 items-center justify-end gap-2">
        <span className="max-w-[80px] truncate text-right text-sm leading-tight font-semibold">
          {match.homeTeam.name}
        </span>
        <div className="relative size-8 shrink-0 overflow-hidden rounded">
          <Image src={match.homeTeam.flagUrl} alt="" fill className="object-cover" sizes="32px" />
        </div>
      </div>
      <div className="shrink-0 text-center">
        {isFinished ? (
          <span className="rounded-lg bg-gray-900 px-3 py-1 text-sm font-bold text-white">
            {match.homeGoals} – {match.awayGoals}
          </span>
        ) : (
          <span className="text-xs text-gray-400">
            {match.playedAt
              ? new Date(match.playedAt).toLocaleDateString('es-MX', {
                  month: 'short',
                  day: 'numeric',
                })
              : 'Por definir'}
          </span>
        )}
      </div>
      <div className="flex flex-1 items-center gap-2">
        <div className="relative size-8 shrink-0 overflow-hidden rounded">
          <Image src={match.awayTeam.flagUrl} alt="" fill className="object-cover" sizes="32px" />
        </div>
        <span className="max-w-[80px] truncate text-sm leading-tight font-semibold">
          {match.awayTeam.name}
        </span>
      </div>
    </div>
  )
}

async function TorneoContent() {
  const [recent, upcoming, topScorers, totalMatches, finishedMatches] = await Promise.all([
    getRecentMatches(6),
    getUpcomingMatches(6),
    getTopScorers(5),
    db.match.count({ where: { stage: 'GROUP' } }),
    db.match.count({ where: { stage: 'GROUP', status: 'FINISHED' } }),
  ])

  const progress = totalMatches > 0 ? Math.round((finishedMatches / totalMatches) * 100) : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl bg-linear-to-r from-[#1a472a] to-[#0d2b1a] p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Torneo FIFA 2026</h1>
            <p className="text-sm text-green-200">USA · México · Canadá</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[#d4af37]">{finishedMatches}</p>
            <p className="text-xs text-green-200">de {totalMatches} partidos jugados</p>
          </div>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-[#d4af37] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Quick navigation */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { href: '/torneo/grupos', label: 'Tabla de posiciones', icon: '📊', desc: 'Grupos A–L' },
          {
            href: '/torneo/bracket',
            label: 'Fase eliminatoria',
            icon: '🏆',
            desc: 'Octavos al Final',
          },
          { href: '#goleadores', label: 'Goleadores', icon: '⚽', desc: 'Top anotadores' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md dark:bg-gray-800"
          >
            <span className="text-2xl">{item.icon}</span>
            <div>
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent results */}
        <section>
          <h2 className="mb-3 font-bold text-gray-800 dark:text-gray-200">Últimos resultados</h2>
          {recent.length === 0 ? (
            <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-400 dark:bg-gray-800">
              Aún no hay partidos jugados.
            </p>
          ) : (
            <div className="space-y-2">
              {recent.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          )}
        </section>

        {/* Upcoming */}
        <section>
          <h2 className="mb-3 font-bold text-gray-800 dark:text-gray-200">Próximos partidos</h2>
          {upcoming.length === 0 ? (
            <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-400 dark:bg-gray-800">
              No hay partidos programados.
            </p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Top scorers */}
      <section id="goleadores">
        <h2 className="mb-3 font-bold text-gray-800 dark:text-gray-200">Goleadores del torneo</h2>
        {topScorers.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-400 dark:bg-gray-800">
            Los goleadores aparecerán cuando se registren los primeros goles.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
            {topScorers.map(
              ({ player, goals }, i) =>
                player && (
                  <div
                    key={player.id}
                    className={`flex items-center gap-3 px-4 py-3 ${i < topScorers.length - 1 ? 'border-b dark:border-gray-700' : ''}`}
                  >
                    <span className="w-5 text-center text-sm font-bold text-gray-400">{i + 1}</span>
                    <div className="relative size-7 overflow-hidden rounded">
                      <Image
                        src={player.team.flagUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="28px"
                      />
                    </div>
                    <span className="flex-1 text-sm font-medium">{player.name}</span>
                    <span className="text-xs text-gray-500">{player.team.name}</span>
                    <span className="flex size-7 items-center justify-center rounded-full bg-[#1a472a] text-xs font-bold text-white">
                      {goals}
                    </span>
                  </div>
                )
            )}
          </div>
        )}
      </section>
    </div>
  )
}

export default function TorneoPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      }
    >
      <TorneoContent />
    </Suspense>
  )
}
