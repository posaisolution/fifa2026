import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getKnockoutMatches } from '@/server/queries/tournament'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { MatchStage } from '@prisma/client'

const STAGE_LABELS: Record<MatchStage, string> = {
  GROUP: 'Fase de grupos',
  ROUND_OF_16: 'Octavos de final',
  QUARTER_FINAL: 'Cuartos de final',
  SEMI_FINAL: 'Semifinales',
  THIRD_PLACE: 'Tercer lugar',
  FINAL: 'Gran Final',
}

const STAGE_ORDER: MatchStage[] = [
  'ROUND_OF_16',
  'QUARTER_FINAL',
  'SEMI_FINAL',
  'THIRD_PLACE',
  'FINAL',
]

function MatchBracketCard({
  match,
}: {
  match: {
    id: string
    homeGoals: number | null
    awayGoals: number | null
    status: string
    playedAt: Date | null
    homeTeam: { name: string; flagUrl: string; id: string }
    awayTeam: { name: string; flagUrl: string; id: string }
  }
}) {
  const isFinished = match.status === 'FINISHED'
  const isPlaceholder = match.homeTeam.id === match.awayTeam.id

  if (isPlaceholder) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-xs text-gray-400">Por definir</p>
      </div>
    )
  }

  const homeWon = isFinished && match.homeGoals! > match.awayGoals!
  const awayWon = isFinished && match.awayGoals! > match.homeGoals!

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border bg-white shadow-sm dark:bg-gray-800',
        isFinished
          ? 'border-gray-200 dark:border-gray-700'
          : 'border-dashed border-gray-200 dark:border-gray-600'
      )}
    >
      {/* Home team */}
      <div
        className={cn(
          'flex items-center gap-2 border-b px-3 py-2 dark:border-gray-700',
          homeWon && 'bg-green-50 dark:bg-green-900/20'
        )}
      >
        <div className="relative size-5 shrink-0 overflow-hidden rounded">
          <Image src={match.homeTeam.flagUrl} alt="" fill className="object-cover" sizes="20px" />
        </div>
        <span
          className={cn(
            'flex-1 truncate text-xs',
            homeWon ? 'font-bold' : 'text-gray-600 dark:text-gray-400'
          )}
        >
          {match.homeTeam.name}
        </span>
        {isFinished && (
          <span className={cn('text-sm font-bold', homeWon ? 'text-[#1a472a]' : 'text-gray-400')}>
            {match.homeGoals}
          </span>
        )}
      </div>
      {/* Away team */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2',
          awayWon && 'bg-green-50 dark:bg-green-900/20'
        )}
      >
        <div className="relative size-5 shrink-0 overflow-hidden rounded">
          <Image src={match.awayTeam.flagUrl} alt="" fill className="object-cover" sizes="20px" />
        </div>
        <span
          className={cn(
            'flex-1 truncate text-xs',
            awayWon ? 'font-bold' : 'text-gray-600 dark:text-gray-400'
          )}
        >
          {match.awayTeam.name}
        </span>
        {isFinished && (
          <span className={cn('text-sm font-bold', awayWon ? 'text-[#1a472a]' : 'text-gray-400')}>
            {match.awayGoals}
          </span>
        )}
      </div>
      {/* Date */}
      {!isFinished && match.playedAt && (
        <div className="border-t px-3 py-1 dark:border-gray-700">
          <p className="text-[10px] text-gray-400">
            {new Date(match.playedAt).toLocaleDateString('es-MX', {
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
      )}
    </div>
  )
}

async function BracketContent() {
  const matches = await getKnockoutMatches()

  const byStage = STAGE_ORDER.reduce<Record<string, typeof matches>>(
    (acc, stage) => {
      acc[stage] = matches.filter((m) => m.stage === stage)
      return acc
    },
    {} as Record<string, typeof matches>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fase eliminatoria</h1>
        <Link href="/torneo" className="text-sm text-gray-500 hover:text-gray-800">
          ← Torneo
        </Link>
      </div>

      {STAGE_ORDER.map((stage) => {
        const stageMatches = byStage[stage] ?? []
        if (stage === 'GROUP') return null

        return (
          <section key={stage}>
            <h2 className="mb-3 flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200">
              {stage === 'FINAL' ? '🏆' : stage === 'SEMI_FINAL' ? '🥈' : '⚽'}
              {STAGE_LABELS[stage]}
              <span className="text-xs font-normal text-gray-400">
                ({stageMatches.length} partidos)
              </span>
            </h2>
            <div
              className={cn(
                'grid gap-3',
                stage === 'ROUND_OF_16' && 'grid-cols-2 sm:grid-cols-4',
                stage === 'QUARTER_FINAL' && 'grid-cols-2 sm:grid-cols-4',
                stage === 'SEMI_FINAL' && 'grid-cols-1 sm:grid-cols-2',
                (stage === 'THIRD_PLACE' || stage === 'FINAL') &&
                  'max-w-md grid-cols-1 sm:grid-cols-2'
              )}
            >
              {stageMatches.map((match) => (
                <MatchBracketCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default function BracketPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
      <BracketContent />
    </Suspense>
  )
}
