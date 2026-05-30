import { db } from '@/lib/db'
import { cache } from 'react'
import type { MatchStage } from '@prisma/client'

const teamSelect = {
  id: true,
  name: true,
  fifaCode: true,
  flagUrl: true,
  group: true,
  confederation: true,
}

export const getGroupMatches = cache(async (group?: string) => {
  return db.match.findMany({
    where: { stage: 'GROUP', ...(group ? { group } : {}) },
    include: {
      homeTeam: { select: teamSelect },
      awayTeam: { select: teamSelect },
      goals: { include: { player: { select: { name: true } }, team: { select: { name: true } } } },
    },
    orderBy: [{ group: 'asc' }, { matchDay: 'asc' }, { playedAt: 'asc' }],
  })
})

export const getKnockoutMatches = cache(async (stage?: MatchStage) => {
  return db.match.findMany({
    where: {
      stage: stage ?? {
        in: ['ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'THIRD_PLACE', 'FINAL'],
      },
    },
    include: {
      homeTeam: { select: teamSelect },
      awayTeam: { select: teamSelect },
      goals: { include: { player: { select: { name: true } }, team: { select: { name: true } } } },
    },
    orderBy: { playedAt: 'asc' },
  })
})

export const getRecentMatches = cache(async (limit = 5) => {
  return db.match.findMany({
    where: { status: 'FINISHED' },
    include: {
      homeTeam: { select: teamSelect },
      awayTeam: { select: teamSelect },
    },
    orderBy: { playedAt: 'desc' },
    take: limit,
  })
})

export const getUpcomingMatches = cache(async (limit = 5) => {
  return db.match.findMany({
    where: { status: 'SCHEDULED', stage: 'GROUP' },
    include: {
      homeTeam: { select: teamSelect },
      awayTeam: { select: teamSelect },
    },
    orderBy: { playedAt: 'asc' },
    take: limit,
  })
})

export const getTopScorers = cache(async (limit = 10) => {
  const goals = await db.matchGoal.groupBy({
    by: ['playerId'],
    where: { isOwnGoal: false, playerId: { not: null } },
    _count: { playerId: true },
    orderBy: { _count: { playerId: 'desc' } },
    take: limit,
  })

  const playerIds = goals.map((g) => g.playerId!).filter(Boolean)
  const players = await db.player.findMany({
    where: { id: { in: playerIds } },
    include: { team: { select: { name: true, flagUrl: true } } },
  })

  return goals
    .map((g) => ({
      player: players.find((p) => p.id === g.playerId),
      goals: g._count.playerId,
    }))
    .filter((g) => g.player)
})

// Calculate group standings from match results
export function calculateStandings(matches: Awaited<ReturnType<typeof getGroupMatches>>) {
  const standings: Record<
    string,
    {
      teamId: string
      teamName: string
      flagUrl: string
      group: string
      played: number
      won: number
      drawn: number
      lost: number
      goalsFor: number
      goalsAgainst: number
      points: number
    }
  > = {}

  function ensureTeam(team: { id: string; name: string; flagUrl: string; group: string }) {
    if (!standings[team.id]) {
      standings[team.id] = {
        teamId: team.id,
        teamName: team.name,
        flagUrl: team.flagUrl,
        group: team.group,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      }
    }
  }

  for (const match of matches) {
    if (match.status !== 'FINISHED' || match.homeGoals === null || match.awayGoals === null)
      continue

    ensureTeam(match.homeTeam)
    ensureTeam(match.awayTeam)

    const h = standings[match.homeTeamId]
    const a = standings[match.awayTeamId]

    h.played++
    a.played++
    h.goalsFor += match.homeGoals
    h.goalsAgainst += match.awayGoals
    a.goalsFor += match.awayGoals
    a.goalsAgainst += match.homeGoals

    if (match.homeGoals > match.awayGoals) {
      h.won++
      h.points += 3
      a.lost++
    } else if (match.homeGoals === match.awayGoals) {
      h.drawn++
      h.points++
      a.drawn++
      a.points++
    } else {
      a.won++
      a.points += 3
      h.lost++
    }
  }

  // Add teams with 0 played (from fixture but no results yet)
  return standings
}
