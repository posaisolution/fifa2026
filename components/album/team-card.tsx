import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { TeamWithProgress } from '@/types'

const CONFEDERATION_COLORS: Record<string, string> = {
  UEFA: 'bg-blue-100 text-blue-700',
  CONMEBOL: 'bg-yellow-100 text-yellow-700',
  CONCACAF: 'bg-red-100 text-red-700',
  CAF: 'bg-orange-100 text-orange-700',
  AFC: 'bg-purple-100 text-purple-700',
  OFC: 'bg-teal-100 text-teal-700',
}

interface TeamCardProps {
  team: TeamWithProgress
}

export function TeamCard({ team }: TeamCardProps) {
  const pct = team.totalPlayers > 0 ? (team.ownedPlayers / team.totalPlayers) * 100 : 0
  const isComplete = team.ownedPlayers === team.totalPlayers && team.totalPlayers > 0

  return (
    <Link href={`/album/${team.id}`}>
      <div
        className={cn(
          'group relative flex flex-col items-center gap-2 rounded-xl border bg-white p-4 shadow-sm transition-all duration-200',
          'hover:-translate-y-0.5 hover:shadow-md',
          isComplete && 'border-[#d4af37] ring-1 ring-[#d4af37]/30'
        )}
      >
        {isComplete && <span className="absolute top-2 right-2 text-sm">⭐</span>}

        {/* Flag */}
        <div className="relative size-12 overflow-hidden rounded-md shadow-sm">
          <Image
            src={team.flagUrl}
            alt={`Bandera de ${team.name}`}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>

        {/* Name */}
        <p className="text-center text-sm leading-tight font-semibold">{team.name}</p>

        {/* Confederation badge */}
        <Badge
          variant="secondary"
          className={cn('text-xs', CONFEDERATION_COLORS[team.confederation])}
        >
          {team.confederation}
        </Badge>

        {/* Progress */}
        <div className="w-full">
          <div className="mb-1 flex justify-between text-xs text-gray-500">
            <span>
              {team.ownedPlayers}/{team.totalPlayers}
            </span>
            <span>{Math.round(pct)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                isComplete ? 'bg-[#d4af37]' : 'bg-[#1a472a]'
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}
