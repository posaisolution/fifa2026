'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') throw new Error('No autorizado')
  return session
}

export async function updateMatchResult(matchId: string, homeGoals: number, awayGoals: number) {
  await requireAdmin()

  await db.match.update({
    where: { id: matchId },
    data: { homeGoals, awayGoals, status: 'FINISHED' },
  })

  revalidatePath('/torneo')
  revalidatePath('/torneo/grupos')
  revalidatePath('/torneo/bracket')
  revalidatePath('/admin')
}

export async function addMatchGoal(
  matchId: string,
  teamId: string,
  playerId: string | null,
  minute: number,
  isOwnGoal: boolean,
  isPenalty: boolean
) {
  await requireAdmin()

  await db.matchGoal.create({
    data: { matchId, teamId, playerId: playerId || null, minute, isOwnGoal, isPenalty },
  })

  revalidatePath('/torneo')
}

export async function deleteMatchGoal(goalId: string) {
  await requireAdmin()
  await db.matchGoal.delete({ where: { id: goalId } })
  revalidatePath('/torneo')
}

export async function setMatchStatus(matchId: string, status: 'SCHEDULED' | 'LIVE' | 'FINISHED') {
  await requireAdmin()
  await db.match.update({ where: { id: matchId }, data: { status } })
  revalidatePath('/torneo')
  revalidatePath('/torneo/grupos')
}

export async function assignKnockoutTeams(matchId: string, homeTeamId: string, awayTeamId: string) {
  await requireAdmin()
  await db.match.update({ where: { id: matchId }, data: { homeTeamId, awayTeamId } })
  revalidatePath('/torneo/bracket')
}
