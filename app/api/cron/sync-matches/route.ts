import { NextResponse } from 'next/server'
import { syncWorldCupMatches } from '@/lib/sync-matches'
import { revalidatePath } from 'next/cache'

// This endpoint is called by Vercel Cron and also manually from /admin/torneo
// Protected by CRON_SECRET to prevent unauthorized calls
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // In production, require the secret. In development, allow without it.
  if (process.env.NODE_ENV === 'production' && cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
  }

  const start = Date.now()

  try {
    const result = await syncWorldCupMatches()

    // Revalidate tournament pages
    revalidatePath('/torneo')
    revalidatePath('/torneo/grupos')
    revalidatePath('/torneo/bracket')

    const duration = Date.now() - start
    console.log(
      `[sync-matches] ${result.updated} updated, ${result.created} created, ${result.skipped} skipped in ${duration}ms`
    )

    return NextResponse.json({
      ok: true,
      duration: `${duration}ms`,
      ...result,
    })
  } catch (error) {
    console.error('[sync-matches] Error:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
