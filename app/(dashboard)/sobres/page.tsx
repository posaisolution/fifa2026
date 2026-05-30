import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { PackOpener } from './pack-opener'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'

const FREE_PACK_HOURS = 24

async function PacksContent() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const album = await db.album.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      coins: true,
      lastFreePackAt: true,
      packOpenings: {
        orderBy: { openedAt: 'desc' },
        take: 10,
        include: {
          stickers: {
            include: {
              player: {
                include: { team: { select: { flagUrl: true, name: true } } },
              },
            },
          },
        },
      },
    },
  })

  if (!album) redirect('/login')

  const now = new Date()
  const hoursLeft = album.lastFreePackAt
    ? Math.max(0, FREE_PACK_HOURS - (now.getTime() - album.lastFreePackAt.getTime()) / 3_600_000)
    : 0

  const canFreePack = hoursLeft === 0

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Sobres de figuritas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Cada sobre trae 5 figuritas · 70% Común · 25% Raro · 5% Leyenda
        </p>
      </div>

      <PackOpener coins={album.coins} canFreePack={canFreePack} freePackIn={Math.ceil(hoursLeft)} />

      {/* History */}
      {album.packOpenings.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold">Historial de sobres</h2>
          <div className="space-y-3">
            {album.packOpenings.map((opening) => {
              const newCount = opening.stickers.filter((s) => s.wasNew).length
              const dupCount = opening.stickers.length - newCount
              return (
                <div
                  key={opening.id}
                  className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">
                        {opening.isFree ? '🎁 Sobre gratis' : '🪙 Sobre comprado'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(opening.openedAt).toLocaleString('es-MX')}
                      </p>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <p className="font-medium text-green-600">{newCount} nuevas</p>
                      {dupCount > 0 && (
                        <p className="text-orange-500">
                          {dupCount} repetidas (+{opening.coinsEarned}🪙)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Sticker thumbnails */}
                  <div className="mt-3 flex gap-2">
                    {opening.stickers.map((s) => (
                      <div key={s.id} className="relative">
                        <div className="relative size-9 overflow-hidden rounded-md">
                          <Image
                            src={s.player.team.flagUrl}
                            alt={s.player.team.name}
                            fill
                            className="object-cover"
                            sizes="36px"
                          />
                        </div>
                        {!s.wasNew && (
                          <span className="absolute -top-0.5 -right-0.5 rounded-full bg-orange-500 px-0.5 text-[8px] font-bold text-white">
                            2
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

export default function SobresPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl space-y-4">
          <Skeleton className="mx-auto h-10 w-64" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      }
    >
      <PacksContent />
    </Suspense>
  )
}
