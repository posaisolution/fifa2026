import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es requerida'),
  NEXTAUTH_URL: z.url('NEXTAUTH_URL debe ser una URL válida').optional(),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET debe tener al menos 32 caracteres'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.url('NEXT_PUBLIC_APP_URL debe ser una URL válida').optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  // Durante el build de Next.js/Vercel, process.env puede estar incompleto.
  // Solo validamos en runtime (cuando NODE_ENV ya está definido y no es build).
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'
  if (isBuildPhase) {
    return process.env as unknown as Env
  }

  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error('❌ Variables de entorno inválidas:')
    parsed.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
    })
    throw new Error('Variables de entorno inválidas. Revisá tu .env.local')
  }

  return parsed.data
}

export const env = validateEnv()
