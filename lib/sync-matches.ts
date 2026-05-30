import { db } from '@/lib/db'
import { getWorldCupMatches, mapStatus, mapStage } from '@/lib/football-data'
import { TLA_TO_FIFACODE } from '@/lib/team-map'
import type { MatchStage, MatchStatus } from '@prisma/client'

export type SyncResult = {
  updated: number
  created: number
  errors: string[]
  skipped: number
}

export async function syncWorldCupMatches(): Promise<SyncResult> {
  const result: SyncResult = { updated: 0, created: 0, errors: [], skipped: 0 }

  // Load all teams from our DB indexed by fifaCode
  const dbTeams = await db.team.findMany({ select: { id: true, fifaCode: true } })
  const teamByFifaCode = Object.fromEntries(dbTeams.map((t) => [t.fifaCode, t.id]))

  // Load our existing matches indexed by homeTeamId+awayTeamId+matchDay for dedup
  const dbMatches = await db.match.findMany({
    select: {
      id: true,
      homeTeamId: true,
      awayTeamId: true,
      matchDay: true,
      stage: true,
      status: true,
      homeGoals: true,
      awayGoals: true,
    },
  })

  function matchKey(homeId: string, awayId: string, day: number | null) {
    return `${homeId}-${awayId}-${day ?? 0}`
  }

  const dbMatchMap = new Map(
    dbMatches.map((m) => [matchKey(m.homeTeamId, m.awayTeamId, m.matchDay), m])
  )

  // Fetch from football-data.org
  let fdMatches
  try {
    fdMatches = await getWorldCupMatches()
  } catch (e) {
    result.errors.push(e instanceof Error ? e.message : 'Error al llamar la API')
    return result
  }

  for (const fdMatch of fdMatches) {
    try {
      const homeFifaCode = TLA_TO_FIFACODE[fdMatch.homeTeam.tla]
      const awayFifaCode = TLA_TO_FIFACODE[fdMatch.awayTeam.tla]

      if (!homeFifaCode || !awayFifaCode) {
        result.skipped++
        continue
      }

      const homeTeamId = teamByFifaCode[homeFifaCode]
      const awayTeamId = teamByFifaCode[awayFifaCode]

      if (!homeTeamId || !awayTeamId) {
        result.skipped++
        continue
      }

      const stage = mapStage(fdMatch.stage) as MatchStage
      const status = mapStatus(fdMatch.status) as MatchStatus
      const homeGoals = fdMatch.score.fullTime.home
      const awayGoals = fdMatch.score.fullTime.away
      const playedAt = new Date(fdMatch.utcDate)

      const key = matchKey(homeTeamId, awayTeamId, fdMatch.matchday)
      const existing = dbMatchMap.get(key)

      if (existing) {
        // Only update if something changed
        const hasChanged =
          existing.status !== status ||
          existing.homeGoals !== homeGoals ||
          existing.awayGoals !== awayGoals

        if (!hasChanged) {
          result.skipped++
          continue
        }

        await db.match.update({
          where: { id: existing.id },
          data: { status, homeGoals, awayGoals, playedAt },
        })

        // Sync goals for finished matches
        if (status === 'FINISHED' && fdMatch.goals.length > 0) {
          // Delete existing goals and re-insert to avoid duplicates
          await db.matchGoal.deleteMany({ where: { matchId: existing.id } })

          for (const goal of fdMatch.goals) {
            if (goal.minute === null) continue
            const goalTeamFifaCode =
              TLA_TO_FIFACODE[fdMatch.homeTeam.tla] === homeFifaCode
                ? goal.team.id === fdMatch.homeTeam.id
                  ? homeTeamId
                  : awayTeamId
                : goal.team.id === fdMatch.homeTeam.id
                  ? homeTeamId
                  : awayTeamId

            // Try to find the player in our DB by name
            const player = goal.scorer
              ? await db.player.findFirst({
                  where: {
                    name: {
                      contains: goal.scorer.name.split(' ').pop() ?? '',
                      mode: 'insensitive',
                    },
                    teamId: goalTeamFifaCode,
                  },
                })
              : null

            await db.matchGoal.create({
              data: {
                matchId: existing.id,
                teamId: goalTeamFifaCode,
                playerId: player?.id ?? null,
                minute: goal.minute,
                isOwnGoal: goal.type === 'OWN',
                isPenalty: goal.type === 'PENALTY',
              },
            })
          }
        }

        result.updated++
      } else {
        // Create new match
        await db.match.create({
          data: {
            homeTeamId,
            awayTeamId,
            stage,
            group: fdMatch.group,
            matchDay: fdMatch.matchday ?? 1,
            status,
            homeGoals,
            awayGoals,
            playedAt,
          },
        })
        result.created++
      }
    } catch (e) {
      result.errors.push(`Partido ${fdMatch.id}: ${e instanceof Error ? e.message : 'Error'}`)
    }
  }

  return result
}
