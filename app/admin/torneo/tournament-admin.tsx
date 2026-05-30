'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import {
  updateMatchResult,
  addMatchGoal,
  deleteMatchGoal,
  setMatchStatus,
} from '@/server/actions/tournament'
import { cn } from '@/lib/utils'

type Player = { id: string; name: string }
type Team = { id: string; name: string; flagUrl: string; group: string; players: Player[] }
type Goal = {
  id: string
  minute: number
  isOwnGoal: boolean
  isPenalty: boolean
  player: Player | null
  teamId: string
}
type Match = {
  id: string
  homeGoals: number | null
  awayGoals: number | null
  status: string
  matchDay: number
  group: string | null
  homeTeam: { id: string; name: string; flagUrl: string; group: string }
  awayTeam: { id: string; name: string; flagUrl: string; group: string }
  goals: Goal[]
}

function MatchEditor({ match, teams }: { match: Match; teams: Team[] }) {
  const [expanded, setExpanded] = useState(false)
  const [homeGoals, setHomeGoals] = useState(match.homeGoals ?? 0)
  const [awayGoals, setAwayGoals] = useState(match.awayGoals ?? 0)
  const [isPending, startTransition] = useTransition()

  // Goal form state
  const [goalTeamId, setGoalTeamId] = useState(match.homeTeam.id)
  const [goalPlayerId, setGoalPlayerId] = useState('')
  const [goalMinute, setGoalMinute] = useState(1)
  const [isOwnGoal, setIsOwnGoal] = useState(false)
  const [isPenalty, setIsPenalty] = useState(false)

  const goalTeam = teams.find((t) => t.id === goalTeamId)

  function handleSaveResult() {
    startTransition(async () => {
      try {
        await updateMatchResult(match.id, homeGoals, awayGoals)
        toast.success('Resultado guardado')
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error')
      }
    })
  }

  function handleAddGoal() {
    startTransition(async () => {
      try {
        await addMatchGoal(
          match.id,
          goalTeamId,
          goalPlayerId || null,
          goalMinute,
          isOwnGoal,
          isPenalty
        )
        toast.success('Gol registrado')
        setGoalMinute(1)
        setGoalPlayerId('')
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error')
      }
    })
  }

  function handleDeleteGoal(goalId: string) {
    startTransition(async () => {
      try {
        await deleteMatchGoal(goalId)
        toast.success('Gol eliminado')
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error')
      }
    })
  }

  function handleSetLive() {
    startTransition(async () => {
      await setMatchStatus(match.id, match.status === 'LIVE' ? 'FINISHED' : 'LIVE')
      toast.success(match.status === 'LIVE' ? 'Partido terminado' : 'Partido en vivo')
    })
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Match header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <div className="flex flex-1 items-center justify-end gap-2">
          <div className="relative size-6 overflow-hidden rounded">
            <Image src={match.homeTeam.flagUrl} alt="" fill className="object-cover" sizes="24px" />
          </div>
          <span className="text-sm font-medium">{match.homeTeam.name}</span>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-lg px-3 py-1 text-sm font-bold',
            match.status === 'FINISHED'
              ? 'bg-gray-900 text-white'
              : match.status === 'LIVE'
                ? 'animate-pulse bg-red-500 text-white'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-700'
          )}
        >
          {match.status === 'FINISHED'
            ? `${match.homeGoals}–${match.awayGoals}`
            : match.status === 'LIVE'
              ? '⚡ EN VIVO'
              : 'vs'}
        </span>
        <div className="flex flex-1 items-center gap-2">
          <div className="relative size-6 overflow-hidden rounded">
            <Image src={match.awayTeam.flagUrl} alt="" fill className="object-cover" sizes="24px" />
          </div>
          <span className="text-sm font-medium">{match.awayTeam.name}</span>
        </div>
        <span className="ml-auto text-xs text-gray-400">
          J{match.matchDay} {expanded ? '▲' : '▼'}
        </span>
      </button>

      {expanded && (
        <div className="space-y-4 border-t p-4 dark:border-gray-700">
          {/* Score editor */}
          <div className="flex items-center gap-4">
            <div className="flex flex-1 items-center justify-end gap-2">
              <span className="text-sm">{match.homeTeam.name}</span>
              <input
                type="number"
                min={0}
                max={20}
                value={homeGoals}
                onChange={(e) => setHomeGoals(Number(e.target.value))}
                className="border-input w-14 rounded-lg border px-2 py-1 text-center text-lg font-bold dark:bg-gray-700"
              />
            </div>
            <span className="text-gray-400">–</span>
            <div className="flex flex-1 items-center gap-2">
              <input
                type="number"
                min={0}
                max={20}
                value={awayGoals}
                onChange={(e) => setAwayGoals(Number(e.target.value))}
                className="border-input w-14 rounded-lg border px-2 py-1 text-center text-lg font-bold dark:bg-gray-700"
              />
              <span className="text-sm">{match.awayTeam.name}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveResult}
              disabled={isPending}
              className="flex-1 rounded-lg bg-[#1a472a] py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              Guardar resultado
            </button>
            <button
              onClick={handleSetLive}
              disabled={isPending}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-50',
                match.status === 'LIVE'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              )}
            >
              {match.status === 'LIVE' ? '⏹ Terminar' : '⚡ En vivo'}
            </button>
          </div>

          {/* Goals list */}
          {match.goals.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500">Goles registrados:</p>
              {match.goals.map((g) => (
                <div key={g.id} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">⚽ {g.minute}&apos;</span>
                  <span className="font-medium">{g.player?.name ?? 'Desconocido'}</span>
                  {g.isOwnGoal && <span className="text-xs text-red-500">(en propia)</span>}
                  {g.isPenalty && <span className="text-xs text-blue-500">(pen.)</span>}
                  <button
                    onClick={() => handleDeleteGoal(g.id)}
                    disabled={isPending}
                    className="ml-auto text-xs text-red-400 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add goal */}
          <div className="space-y-2 border-t pt-3 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-500">Registrar gol:</p>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={goalTeamId}
                onChange={(e) => setGoalTeamId(e.target.value)}
                className="border-input rounded-lg border bg-white px-2 py-1.5 text-sm dark:bg-gray-700"
              >
                <option value={match.homeTeam.id}>{match.homeTeam.name}</option>
                <option value={match.awayTeam.id}>{match.awayTeam.name}</option>
              </select>
              <select
                value={goalPlayerId}
                onChange={(e) => setGoalPlayerId(e.target.value)}
                className="border-input rounded-lg border bg-white px-2 py-1.5 text-sm dark:bg-gray-700"
              >
                <option value="">Jugador desconocido</option>
                {goalTeam?.players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">Minuto:</label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={goalMinute}
                  onChange={(e) => setGoalMinute(Number(e.target.value))}
                  className="border-input w-16 rounded-lg border px-2 py-1 text-sm dark:bg-gray-700"
                />
              </div>
              <div className="flex items-center gap-3 text-sm">
                <label className="flex cursor-pointer items-center gap-1">
                  <input
                    type="checkbox"
                    checked={isOwnGoal}
                    onChange={(e) => setIsOwnGoal(e.target.checked)}
                  />
                  En propia
                </label>
                <label className="flex cursor-pointer items-center gap-1">
                  <input
                    type="checkbox"
                    checked={isPenalty}
                    onChange={(e) => setIsPenalty(e.target.checked)}
                  />
                  Penalti
                </label>
              </div>
            </div>
            <button
              onClick={handleAddGoal}
              disabled={isPending}
              className="w-full rounded-lg border border-[#1a472a] py-1.5 text-sm font-medium text-[#1a472a] transition hover:bg-[#1a472a]/5 disabled:opacity-50 dark:text-green-400"
            >
              + Agregar gol
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface TournamentAdminProps {
  matches: Match[]
  teams: Team[]
}

export function TournamentAdmin({ matches, teams }: TournamentAdminProps) {
  const [groupFilter, setGroupFilter] = useState('all')
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)
  const groups = [...new Set(matches.map((m) => m.group).filter(Boolean))].sort()

  const filtered = matches.filter((m) => groupFilter === 'all' || m.group === groupFilter)

  const finished = matches.filter((m) => m.status === 'FINISHED').length
  const live = matches.filter((m) => m.status === 'LIVE').length

  async function handleManualSync() {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch('/api/cron/sync-matches')
      const data = await res.json()
      if (data.ok) {
        setSyncResult(
          `✅ Sincronizado: ${data.updated} actualizados, ${data.created} nuevos, ${data.skipped} sin cambios (${data.duration})`
        )
      } else {
        setSyncResult(`❌ Error: ${data.error}`)
      }
    } catch {
      setSyncResult('❌ Error al conectar con la API')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión del torneo</h1>
          <p className="text-sm text-gray-500">
            {finished} terminados · {live > 0 ? `${live} en vivo · ` : ''}
            {matches.length - finished - live} pendientes
          </p>
        </div>

        {/* Sync button */}
        <div className="space-y-1">
          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {syncing ? (
              <>
                <span className="animate-spin">⟳</span> Sincronizando...
              </>
            ) : (
              <>
                <span>🔄</span> Sync football-data.org
              </>
            )}
          </button>
          {syncResult && <p className="max-w-sm text-xs text-gray-500">{syncResult}</p>}
          <p className="text-[10px] text-gray-400">
            Auto: cada hora · Requiere FOOTBALL_DATA_API_KEY
          </p>
        </div>
      </div>

      {/* Group filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setGroupFilter('all')}
          className={cn(
            'rounded-full px-3 py-1 text-sm font-medium transition',
            groupFilter === 'all'
              ? 'bg-[#1a472a] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
          )}
        >
          Todos
        </button>
        {groups.map((g) => (
          <button
            key={g}
            onClick={() => setGroupFilter(g!)}
            className={cn(
              'rounded-full px-3 py-1 text-sm font-medium transition',
              groupFilter === g
                ? 'bg-[#1a472a] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            )}
          >
            Grupo {g}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((match) => (
          <MatchEditor key={match.id} match={match} teams={teams} />
        ))}
      </div>
    </div>
  )
}
