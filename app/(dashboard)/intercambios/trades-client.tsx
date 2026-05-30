'use client'

import { useTransition } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { respondTrade } from '@/server/actions/trades'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Sticker = {
  id: string
  status: string
  player: {
    name: string
    number: number
    position: string
    team: { name: string; flagUrl: string }
  }
}

type Trade = {
  id: string
  status: string
  fromUser?: { name: string }
  toUser?: { name: string }
  stickerOffered: Sticker
  stickerWanted: Sticker
}

interface TradesClientProps {
  duplicates: Sticker[]
  incoming: Trade[]
  outgoing: Trade[]
}

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente',
  ACCEPTED: 'Aceptado',
  REJECTED: 'Rechazado',
  CANCELLED: 'Cancelado',
}

function StickerMini({ sticker }: { sticker: Sticker }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative size-8 shrink-0 overflow-hidden rounded">
        <Image
          src={sticker.player.team.flagUrl}
          alt=""
          fill
          className="object-cover"
          sizes="32px"
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{sticker.player.name}</p>
        <p className="text-xs text-gray-500">
          {sticker.player.team.name} · #{sticker.player.number}
        </p>
      </div>
    </div>
  )
}

function TradeRow({ trade, isIncoming }: { trade: Trade; isIncoming: boolean }) {
  const [isPending, startTransition] = useTransition()

  function handle(accept: boolean) {
    startTransition(async () => {
      try {
        await respondTrade(trade.id, accept)
        toast.success(accept ? 'Intercambio aceptado' : 'Intercambio rechazado')
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error')
      }
    })
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1 space-y-2">
          <p className="text-xs text-gray-500">
            {isIncoming ? `De: ${trade.fromUser?.name}` : `Para: ${trade.toUser?.name}`}
          </p>
          <div className="flex items-center gap-3">
            <StickerMini sticker={trade.stickerOffered} />
            <span className="shrink-0 text-gray-400">⇄</span>
            <StickerMini sticker={trade.stickerWanted} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={STATUS_STYLE[trade.status]}>{STATUS_LABEL[trade.status]}</Badge>
          {isIncoming && trade.status === 'PENDING' && (
            <>
              <Button size="sm" onClick={() => handle(true)} disabled={isPending}>
                Aceptar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handle(false)}
                disabled={isPending}
              >
                Rechazar
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export function TradesClient({ duplicates, incoming, outgoing }: TradesClientProps) {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Intercambios</h1>

      {/* Duplicates */}
      <section>
        <h2 className="mb-3 font-semibold text-gray-700 dark:text-gray-300">
          Mis figuritas repetidas ({duplicates.length})
        </h2>
        {duplicates.length === 0 ? (
          <p className="text-sm text-gray-400">No tienes figuritas repetidas todavía.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {duplicates.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm dark:bg-gray-800"
              >
                <div className="relative size-8 overflow-hidden rounded">
                  <Image
                    src={s.player.team.flagUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">{s.player.name}</p>
                  <p className="text-xs text-gray-500">
                    {s.player.team.name} · #{s.player.number}
                  </p>
                </div>
                <Badge className="ml-auto bg-orange-100 text-orange-700">Repetida</Badge>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Incoming */}
      <section>
        <h2 className="mb-3 font-semibold text-gray-700 dark:text-gray-300">
          Solicitudes recibidas ({incoming.length})
        </h2>
        {incoming.length === 0 ? (
          <p className="text-sm text-gray-400">No tienes solicitudes pendientes.</p>
        ) : (
          <div className="space-y-2">
            {incoming.map((t) => (
              <TradeRow key={t.id} trade={t} isIncoming />
            ))}
          </div>
        )}
      </section>

      {/* Outgoing */}
      <section>
        <h2 className="mb-3 font-semibold text-gray-700 dark:text-gray-300">
          Mis solicitudes enviadas
        </h2>
        {outgoing.length === 0 ? (
          <p className="text-sm text-gray-400">No has enviado solicitudes.</p>
        ) : (
          <div className="space-y-2">
            {outgoing.map((t) => (
              <TradeRow key={t.id} trade={t} isIncoming={false} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
