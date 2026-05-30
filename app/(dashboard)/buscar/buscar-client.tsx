'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type PlayerResult = {
  id: string
  name: string
  position: string
  number: number
  rarity: string
  team: { id: string; name: string; flagUrl: string; group: string; confederation: string }
  status: string
}

const STATUS_STYLE: Record<string, string> = {
  OWNED: 'bg-green-100 text-green-700',
  DUPLICATE: 'bg-orange-100 text-orange-700',
  MISSING: 'bg-gray-100 text-gray-500',
}

const STATUS_LABEL: Record<string, string> = {
  OWNED: 'Tengo',
  DUPLICATE: 'Repetida',
  MISSING: 'Me falta',
}

const POSITION_LABEL: Record<string, string> = {
  GK: 'Portero',
  DEF: 'Defensa',
  MID: 'Mediocampista',
  FWD: 'Delantero',
}

const FILTERS = ['Todos', 'Tengo', 'Me falta', 'Repetidas'] as const

export function BuscarClient({ players }: { players: PlayerResult[] }) {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>('Todos')
  const [posFilter, setPosFilter] = useState('Todas')

  const filtered = useMemo(() => {
    return players.filter((p) => {
      const matchQuery =
        query.trim() === '' ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.team.name.toLowerCase().includes(query.toLowerCase())

      const matchStatus =
        activeFilter === 'Todos' ||
        (activeFilter === 'Tengo' && p.status === 'OWNED') ||
        (activeFilter === 'Me falta' && p.status === 'MISSING') ||
        (activeFilter === 'Repetidas' && p.status === 'DUPLICATE')

      const matchPos = posFilter === 'Todas' || p.position === posFilter

      return matchQuery && matchStatus && matchPos
    })
  }, [players, query, activeFilter, posFilter])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Buscar jugadores</h1>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Buscar por nombre o equipo..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <select
          value={posFilter}
          onChange={(e) => setPosFilter(e.target.value)}
          className="border-input rounded-md border bg-white px-3 py-2 text-sm"
        >
          <option value="Todas">Todas las posiciones</option>
          <option value="GK">Portero</option>
          <option value="DEF">Defensa</option>
          <option value="MID">Mediocampista</option>
          <option value="FWD">Delantero</option>
        </select>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition',
              activeFilter === f
                ? 'bg-[#1a472a] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500">{filtered.length} jugadores</p>

      {/* Results */}
      <div className="space-y-2">
        {filtered.map((player) => (
          <Link
            key={player.id}
            href={`/album/${player.team.id}`}
            className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md"
          >
            <div className="relative size-8 shrink-0 overflow-hidden rounded">
              <Image
                src={player.team.flagUrl}
                alt={player.team.name}
                fill
                className="object-cover"
                sizes="32px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{player.name}</p>
              <p className="text-xs text-gray-500">
                {player.team.name} · {POSITION_LABEL[player.position]} · #{player.number}
              </p>
            </div>
            <Badge
              variant="secondary"
              className={cn('shrink-0 text-xs', STATUS_STYLE[player.status])}
            >
              {STATUS_LABEL[player.status]}
            </Badge>
          </Link>
        ))}

        {filtered.length === 0 && (
          <p className="py-12 text-center text-gray-400">No se encontraron jugadores.</p>
        )}
      </div>
    </div>
  )
}
