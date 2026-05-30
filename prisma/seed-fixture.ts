import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString })
const db = new PrismaClient({ adapter })

// FIFA World Cup 2026 venues
const VENUES = [
  'SoFi Stadium, Los Ángeles',
  'MetLife Stadium, Nueva York',
  'AT&T Stadium, Dallas',
  'NRG Stadium, Houston',
  "Levi's Stadium, San Francisco",
  'Estadio Azteca, Ciudad de México',
  'Estadio BBVA, Monterrey',
  'BC Place, Vancouver',
  'BMO Field, Toronto',
]

function randomVenue() {
  return VENUES[Math.floor(Math.random() * VENUES.length)]
}

// Generate group stage match dates (June 11 – July 2, 2026)
function groupDate(matchDay: number, groupIndex: number): Date {
  // matchDay 1: June 11-14, matchDay 2: June 17-21, matchDay 3: June 26-30
  const baseDays = [0, 6, 15]
  const base = new Date('2026-06-11T18:00:00Z')
  base.setDate(base.getDate() + baseDays[matchDay - 1] + (groupIndex % 4))
  return base
}

async function main() {
  console.log('⚽ Seeding tournament fixture...')

  // Clear existing matches
  await db.matchGoal.deleteMany()
  await db.match.deleteMany()

  // Load all teams grouped
  const teams = await db.team.findMany({ orderBy: { group: 'asc' } })

  // Group them by group letter
  const grouped: Record<string, typeof teams> = {}
  for (const team of teams) {
    if (!grouped[team.group]) grouped[team.group] = []
    grouped[team.group].push(team)
  }

  let matchCount = 0
  let groupIndex = 0

  for (const [group, groupTeams] of Object.entries(grouped)) {
    if (groupTeams.length < 2) continue

    // Round robin: 6 matches per group (4 teams × 3 matchdays)
    const matchups = [
      [0, 1], // matchDay 1
      [2, 3], // matchDay 1
      [0, 2], // matchDay 2
      [1, 3], // matchDay 2
      [0, 3], // matchDay 3
      [1, 2], // matchDay 3
    ]

    const matchDays = [1, 1, 2, 2, 3, 3]

    for (let i = 0; i < matchups.length; i++) {
      const [a, b] = matchups[i]
      if (!groupTeams[a] || !groupTeams[b]) continue

      await db.match.create({
        data: {
          homeTeamId: groupTeams[a].id,
          awayTeamId: groupTeams[b].id,
          stage: 'GROUP',
          group,
          matchDay: matchDays[i],
          venue: randomVenue(),
          playedAt: groupDate(matchDays[i], groupIndex),
          status: 'SCHEDULED',
        },
      })
      matchCount++
    }

    groupIndex++
  }

  // Create placeholder matches for knockout stage (without teams yet)
  const knockoutStages = [
    { stage: 'ROUND_OF_16' as const, count: 16, baseDate: '2026-07-04' },
    { stage: 'QUARTER_FINAL' as const, count: 8, baseDate: '2026-07-11' },
    { stage: 'SEMI_FINAL' as const, count: 4, baseDate: '2026-07-15' },
    { stage: 'THIRD_PLACE' as const, count: 1, baseDate: '2026-07-19' },
    { stage: 'FINAL' as const, count: 1, baseDate: '2026-07-19' },
  ]

  // Use a dummy placeholder team for knockout TBD slots
  // We'll use the first team as placeholder and mark them SCHEDULED with no real teams
  // In production the admin assigns teams as they advance
  const firstTeam = teams[0]
  if (firstTeam) {
    for (const { stage, count, baseDate } of knockoutStages) {
      for (let i = 0; i < count; i++) {
        const date = new Date(baseDate)
        date.setDate(date.getDate() + Math.floor(i / 2))
        await db.match.create({
          data: {
            homeTeamId: firstTeam.id,
            awayTeamId: firstTeam.id,
            stage,
            venue: randomVenue(),
            playedAt: date,
            status: 'SCHEDULED',
          },
        })
        matchCount++
      }
    }
  }

  console.log(`✅ Fixture creado: ${matchCount} partidos`)
  console.log(`   Fase de grupos: 72 partidos (6 por grupo × 12 grupos)`)
  console.log(`   Fase eliminatoria: 30 partidos (placeholders)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
