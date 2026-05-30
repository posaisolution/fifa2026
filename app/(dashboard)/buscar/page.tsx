import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { BuscarClient } from './buscar-client'

async function BuscarContent() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const album = await db.album.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })

  const players = await db.player.findMany({
    orderBy: { name: 'asc' },
    include: {
      team: { select: { id: true, name: true, flagUrl: true, group: true, confederation: true } },
      stickers: album
        ? { where: { albumId: album.id }, select: { id: true, status: true } }
        : false,
    },
  })

  const data = players.map((p) => ({
    id: p.id,
    name: p.name,
    position: p.position,
    number: p.number,
    rarity: p.rarity,
    team: p.team,
    stickerId: p.stickers?.[0]?.id ?? null,
    status: p.stickers?.[0]?.status ?? 'MISSING',
  }))

  return <BuscarClient players={data} />
}

export default function BuscarPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-gray-400">Cargando...</div>}>
      <BuscarContent />
    </Suspense>
  )
}
