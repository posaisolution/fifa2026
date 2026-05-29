'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { toggleStickerSchema } from '@/lib/validations/album'
import { revalidatePath } from 'next/cache'

export async function toggleSticker(input: unknown) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autorizado')

  const parsed = toggleStickerSchema.safeParse(input)
  if (!parsed.success) throw new Error('Input inválido')

  const { stickerId, status } = parsed.data

  // Verify the sticker belongs to this user's album
  const sticker = await db.sticker.findFirst({
    where: {
      id: stickerId,
      album: { userId: session.user.id },
    },
  })

  if (!sticker) throw new Error('Figurita no encontrada')

  await db.sticker.update({
    where: { id: stickerId },
    data: {
      status,
      acquiredAt: status === 'OWNED' || status === 'DUPLICATE' ? new Date() : null,
    },
  })

  revalidatePath('/album')
}
