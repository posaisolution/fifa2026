'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { ProposeTradeWizard } from './propose-trade'
import { cn } from '@/lib/utils'
import { respondTrade } from '@/server/actions/trades'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Sticker = {
  id: string
  status: string
  player: {
    id: string
    name: string
    number: number
    position: string
    rarity: string
    team: { name: string; flagUrl: string; group?: string }
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

type Tab = 'proponer' | 'recibidas' | 'enviadas' | 'repetidas'

interface TradesClientProps {
  duplicates: Sticker[]
  missing: Sticker[]
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

export function TradesClient({ duplicates, missing, incoming, outgoing }: TradesClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('proponer')

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'proponer', label: '+ Proponer' },
    { id: 'recibidas', label: 'Recibidas', count: incoming.length },
    { id: 'enviadas', label: 'Enviadas', count: outgoing.length },
    { id: 'repetidas', label: 'Mis repetidas', count: duplicates.length },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Intercambios</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition',
              activeTab === tab.id
                ? 'bg-[#1a472a] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                  activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
        {activeTab === 'proponer' && (
          <ProposeTradeWizard
            missingStickers={missing.map((s) => ({
              id: s.id,
              player: {
                id: s.player.id,
                name: s.player.name,
                number: s.player.number,
                position: s.player.position,
                rarity: s.player.rarity,
                team: {
                  name: s.player.team.name,
                  flagUrl: s.player.team.flagUrl,
                  group: s.player.team.group ?? '',
                },
              },
            }))}
            duplicateStickers={duplicates.map((s) => ({
              id: s.id,
              player: {
                id: s.player.id,
                name: s.player.name,
                number: s.player.number,
                position: s.player.position,
                rarity: s.player.rarity,
                team: { name: s.player.team.name, flagUrl: s.player.team.flagUrl },
              },
            }))}
          />
        )}

        {activeTab === 'recibidas' && (
          <div className="space-y-3">
            {incoming.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                No tienes solicitudes pendientes.
              </p>
            ) : (
              incoming.map((t) => <TradeRow key={t.id} trade={t} isIncoming />)
            )}
          </div>
        )}

        {activeTab === 'enviadas' && (
          <div className="space-y-3">
            {outgoing.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">No has enviado solicitudes.</p>
            ) : (
              outgoing.map((t) => <TradeRow key={t.id} trade={t} isIncoming={false} />)
            )}
          </div>
        )}

        {activeTab === 'repetidas' && (
          <div className="space-y-2">
            {duplicates.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                No tienes figuritas repetidas.
              </p>
            ) : (
              duplicates.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-700"
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
                  <Badge className="ml-auto bg-orange-100 text-xs text-orange-700">Repetida</Badge>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
