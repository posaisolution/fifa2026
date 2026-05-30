'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import type { StickerStatus } from '@prisma/client'

export async function toggleSticker(playerId: string, newStatus: StickerStatus) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autorizado')

  const album = await db.album.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!album) throw new Error('Álbum no encontrado')

  await db.sticker.upsert({
    where: { playerId_albumId: { playerId, albumId: album.id } },
    update: {
      status: newStatus,
      acquiredAt: newStatus !== 'MISSING' ? new Date() : null,
    },
    create: {
      playerId,
      albumId: album.id,
      status: newStatus,
      acquiredAt: newStatus !== 'MISSING' ? new Date() : null,
    },
  })

  // Recalculate completion percentage
  const [total, owned] = await Promise.all([
    db.sticker.count({ where: { albumId: album.id } }),
    db.sticker.count({
      where: { albumId: album.id, status: { in: ['OWNED', 'DUPLICATE'] } },
    }),
  ])

  await db.album.update({
    where: { id: album.id },
    data: { completionPercentage: total > 0 ? (owned / total) * 100 : 0 },
  })

  revalidatePath('/album')
}
