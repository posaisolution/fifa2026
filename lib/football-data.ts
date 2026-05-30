// football-data.org API client
// Free tier: 10 requests/min, covers FIFA World Cup
// Docs: https://www.football-data.org/documentation/quickstart

const BASE_URL = 'https://api.football-data.org/v4'
const WC_CODE = 'WC' // FIFA World Cup competition code

export interface FDMatch {
  id: number
  status: 'SCHEDULED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'SUSPENDED' | 'POSTPONED'
  stage: string
  group: string | null
  matchday: number | null
  utcDate: string
  homeTeam: { id: number; name: string; tla: string }
  awayTeam: { id: number; name: string; tla: string }
  score: {
    fullTime: { home: number | null; away: number | null }
  }
  goals: FDGoal[]
}

export interface FDGoal {
  minute: number | null
  type: 'NORMAL' | 'OWN' | 'PENALTY'
  team: { id: number; name: string }
  scorer: { id: number; name: string } | null
}

async function fdFetch<T>(path: string): Promise<T> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY
  if (!apiKey) throw new Error('FOOTBALL_DATA_API_KEY no está configurada')

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'X-Auth-Token': apiKey },
    next: { revalidate: 60 }, // Cache 60 seconds
  })

  if (res.status === 429) throw new Error('Rate limit de football-data.org alcanzado')
  if (res.status === 403) throw new Error('API key inválida o sin acceso a este recurso')
  if (!res.ok) throw new Error(`football-data.org error ${res.status}: ${res.statusText}`)

  return res.json() as T
}

export async function getWorldCupMatches(): Promise<FDMatch[]> {
  const data = await fdFetch<{ matches: FDMatch[] }>(`/competitions/${WC_CODE}/matches`)
  return data.matches
}

export async function getMatchDetail(matchId: number): Promise<FDMatch> {
  return fdFetch<FDMatch>(`/matches/${matchId}`)
}

// Map football-data.org status to our MatchStatus enum
export function mapStatus(fdStatus: FDMatch['status']): 'SCHEDULED' | 'LIVE' | 'FINISHED' {
  if (fdStatus === 'FINISHED') return 'FINISHED'
  if (fdStatus === 'IN_PLAY' || fdStatus === 'PAUSED') return 'LIVE'
  return 'SCHEDULED'
}

// Map football-data.org stage to our MatchStage enum
export function mapStage(fdStage: string): string {
  const map: Record<string, string> = {
    GROUP_STAGE: 'GROUP',
    LAST_16: 'ROUND_OF_16',
    QUARTER_FINALS: 'QUARTER_FINAL',
    SEMI_FINALS: 'SEMI_FINAL',
    THIRD_PLACE: 'THIRD_PLACE',
    FINAL: 'FINAL',
  }
  return map[fdStage] ?? 'GROUP'
}
