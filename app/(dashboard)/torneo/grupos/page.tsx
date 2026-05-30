import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getGroupMatches, calculateStandings } from '@/server/queries/tournament'
import { db } from '@/lib/db'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

function StandingsTable({
  group,
  teams,
  standings,
}: {
  group: string
  teams: { id: string; name: string; flagUrl: string }[]
  standings: ReturnType<typeof calculateStandings>
}) {
  const rows = teams
    .map(
      (t) =>
        standings[t.id] ?? {
          teamId: t.id,
          teamName: t.name,
          flagUrl: t.flagUrl,
          group,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
        }
    )
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      const gdA = a.goalsFor - a.goalsAgainst
      const gdB = b.goalsFor - b.goalsAgainst
      if (gdB !== gdA) return gdB - gdA
      return b.goalsFor - a.goalsFor
    })

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
      <div className="flex items-center gap-2 bg-[#1a472a] px-4 py-2.5">
        <span className="flex size-6 items-center justify-center rounded-full bg-white text-xs font-bold text-[#1a472a]">
          {group}
        </span>
        <span className="text-sm font-bold text-white">Grupo {group}</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-xs text-gray-400 dark:border-gray-700">
            <th className="px-3 py-2 text-left">Equipo</th>
            <th className="px-2 py-2 text-center">PJ</th>
            <th className="px-2 py-2 text-center">G</th>
            <th className="px-2 py-2 text-center">E</th>
            <th className="px-2 py-2 text-center">P</th>
            <th className="px-2 py-2 text-center">GF</th>
            <th className="px-2 py-2 text-center">GC</th>
            <th className="px-2 py-2 text-center">DG</th>
            <th className="px-2 py-2 text-center font-bold text-[#1a472a] dark:text-green-400">
              Pts
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.teamId}
              className={cn(
                'border-b last:border-0 dark:border-gray-700',
                i < 2 && 'bg-green-50/50 dark:bg-green-900/10'
              )}
            >
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'w-4 text-xs font-bold',
                      i < 2 ? 'text-green-600 dark:text-green-400' : 'text-gray-300'
                    )}
                  >
                    {i + 1}
                  </span>
                  <div className="relative size-5 overflow-hidden rounded">
                    <Image src={row.flagUrl} alt="" fill className="object-cover" sizes="20px" />
                  </div>
                  <span className="max-w-[90px] truncate font-medium">{row.teamName}</span>
                  {i < 2 && (
                    <span className="hidden text-[9px] text-green-600 sm:inline dark:text-green-400">
                      → Oct.
                    </span>
                  )}
                </div>
              </td>
              <td className="px-2 py-2 text-center text-gray-500">{row.played}</td>
              <td className="px-2 py-2 text-center text-gray-500">{row.won}</td>
              <td className="px-2 py-2 text-center text-gray-500">{row.drawn}</td>
              <td className="px-2 py-2 text-center text-gray-500">{row.lost}</td>
              <td className="px-2 py-2 text-center text-gray-500">{row.goalsFor}</td>
              <td className="px-2 py-2 text-center text-gray-500">{row.goalsAgainst}</td>
              <td className="px-2 py-2 text-center text-gray-500">
                {row.goalsFor - row.goalsAgainst}
              </td>
              <td className="px-2 py-2 text-center font-bold text-[#1a472a] dark:text-green-400">
                {row.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

async function GroupsContent() {
  const [allMatches, allTeams] = await Promise.all([
    getGroupMatches(),
    db.team.findMany({ orderBy: [{ group: 'asc' }, { name: 'asc' }] }),
  ])

  const standings = calculateStandings(allMatches)

  const teamsByGroup: Record<string, typeof allTeams> = {}
  for (const team of allTeams) {
    if (!teamsByGroup[team.group]) teamsByGroup[team.group] = []
    teamsByGroup[team.group].push(team)
  }

  const matchesByGroup: Record<string, typeof allMatches> = {}
  for (const match of allMatches) {
    if (!match.group) continue
    if (!matchesByGroup[match.group]) matchesByGroup[match.group] = []
    matchesByGroup[match.group].push(match)
  }

  const groups = Object.keys(teamsByGroup).sort()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tabla de posiciones</h1>
        <Link href="/torneo" className="text-sm text-gray-500 hover:text-gray-800">
          ← Torneo
        </Link>
      </div>

      <p className="text-xs text-gray-500">
        🟢 Los primeros 2 de cada grupo avanzan a octavos de final.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {groups.map((group) => (
          <div key={group} className="space-y-3">
            <StandingsTable group={group} teams={teamsByGroup[group] ?? []} standings={standings} />

            {/* Group matches */}
            <div className="space-y-1">
              {(matchesByGroup[group] ?? []).map((match) => (
                <div
                  key={match.id}
                  className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 text-xs dark:bg-gray-800"
                >
                  <span className="text-gray-400">J{match.matchDay}</span>
                  <div className="relative size-4 overflow-hidden rounded">
                    <Image
                      src={match.homeTeam.flagUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="16px"
                    />
                  </div>
                  <span className="max-w-[55px] truncate">{match.homeTeam.name}</span>
                  <span className="shrink-0 font-mono font-bold text-gray-700 dark:text-gray-300">
                    {match.status === 'FINISHED' ? `${match.homeGoals}–${match.awayGoals}` : 'vs'}
                  </span>
                  <span className="max-w-[55px] truncate">{match.awayTeam.name}</span>
                  <div className="relative size-4 overflow-hidden rounded">
                    <Image
                      src={match.awayTeam.flagUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="16px"
                    />
                  </div>
                  {match.status === 'FINISHED' && <span className="ml-auto text-green-500">✓</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function GruposPage() {
  return (
    <Suspense
      fallback={
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      }
    >
      <GroupsContent />
    </Suspense>
  )
}
