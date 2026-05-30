import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getTeamPlayers } from '@/server/queries/album'
import { StickerCard } from '@/components/album/sticker-card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

const CONFEDERATION_COLORS: Record<string, string> = {
  UEFA: 'bg-blue-100 text-blue-700',
  CONMEBOL: 'bg-yellow-100 text-yellow-700',
  CONCACAF: 'bg-red-100 text-red-700',
  CAF: 'bg-orange-100 text-orange-700',
  AFC: 'bg-purple-100 text-purple-700',
  OFC: 'bg-teal-100 text-teal-700',
}

async function TeamContent({ teamId }: { teamId: string }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [team, players] = await Promise.all([
    db.team.findUnique({ where: { id: teamId } }),
    getTeamPlayers(teamId),
  ])

  if (!team) notFound()

  const owned = players.filter((p) => p.stickerStatus !== 'MISSING').length
  const pct = players.length > 0 ? (owned / players.length) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/album"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        ← Volver al álbum
      </Link>

      {/* Team header */}
      <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg shadow">
          <Image
            src={team.flagUrl}
            alt={`Bandera de ${team.name}`}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold">{team.name}</h1>
            <Badge
              variant="secondary"
              className={cn('text-xs', CONFEDERATION_COLORS[team.confederation])}
            >
              {team.confederation}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Grupo {team.group}
            </Badge>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <Progress value={pct} className="h-2 flex-1 bg-gray-100 [&>div]:bg-[#1a472a]" />
            <span className="shrink-0 text-sm font-semibold text-gray-600">
              {owned}/{players.length}
            </span>
          </div>
        </div>
      </div>

      {/* Stickers grid */}
      {players.length === 0 ? (
        <p className="py-12 text-center text-gray-400">No hay jugadores registrados.</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {players.map((player) => (
            <StickerCard key={player.id} player={player} />
          ))}
        </div>
      )}
    </div>
  )
}

export default async function TeamAlbumPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params
  return (
    <Suspense fallback={<div className="py-12 text-center text-gray-400">Cargando equipo...</div>}>
      <TeamContent teamId={teamId} />
    </Suspense>
  )
}
