'use server'

import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { registerSchema } from '@/lib/validations/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { headers } from 'next/headers'

export async function registerUser(input: unknown) {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') ?? 'unknown'

  const limited = checkRateLimit(`register:${ip}`, { max: 5, windowMs: 60_000 })
  if (limited) throw new Error('Demasiados intentos. Esperá un minuto.')

  const parsed = registerSchema.safeParse(input)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    throw new Error(first.message)
  }

  const { name, email, password } = parsed.data

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) throw new Error('Ya existe una cuenta con ese email.')

  const passwordHash = await bcrypt.hash(password, 12)

  // Create user + album in a transaction
  await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email, passwordHash, role: 'USER' },
    })
    await tx.album.create({ data: { userId: user.id } })
  })
}
