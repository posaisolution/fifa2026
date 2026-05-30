'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { claimOffer, cancelOffer, respondClaim, publishOffer } from '@/server/actions/offers'
import { cn } from '@/lib/utils'
import type { PlayerRarity } from '@prisma/client'

type Player = {
  id: string
  name: string
  number: number
  rarity: string
  team: { name: string; flagUrl: string }
}
type Offer = {
  id: string
  status: string
  userId: string
  offeredPlayer: Player
  wantedPlayer: Player | null
  wantedRarity: string | null
  user: { name: string }
  claims: {
    id: string
    status: string
    claimerUserId: string
    offeredPlayer: Player
    claimer: { name: string }
  }[]
}
type DuplicateSticker = { id: string; player: Player }

const RARITY_LABEL: Record<string, string> = { COMMON: 'Común', RARE: 'Raro', LEGEND: '⭐ Leyenda' }
const RARITY_COLOR: Record<string, string> = {
  COMMON: 'bg-slate-100 text-slate-700',
  RARE: 'bg-blue-100 text-blue-700',
  LEGEND: 'bg-yellow-100 text-yellow-700',
}

function OfferCard({
  offer,
  currentUserId,
  myDuplicates,
}: {
  offer: Offer
  currentUserId: string
  myDuplicates: DuplicateSticker[]
}) {
  const [showClaim, setShowClaim] = useState(false)
  const [selectedDup, setSelectedDup] = useState<DuplicateSticker | null>(null)
  const [isPending, startTransition] = useTransition()
  const isOwn = offer.userId === currentUserId

  const eligibleDups = myDuplicates.filter((d) =>
    offer.wantedPlayer
      ? d.player.id === offer.wantedPlayer.id
      : offer.wantedRarity
        ? d.player.rarity === offer.wantedRarity
        : true
  )

  function handleClaim() {
    if (!selectedDup) return
    startTransition(async () => {
      try {
        await claimOffer(offer.id, selectedDup.player.id)
        toast.success('¡Solicitud enviada!')
        setShowClaim(false)
        setSelectedDup(null)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error')
      }
    })
  }

  function handleCancel() {
    startTransition(async () => {
      try {
        await cancelOffer(offer.id)
        toast.success('Oferta cancelada')
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error')
      }
    })
  }

  return (
    <div
      className={cn(
        'rounded-xl border-2 bg-white p-4 shadow-sm dark:bg-gray-800',
        isOwn && 'border-[#1a472a]/20'
      )}
    >
      {/* Offer header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative size-9 shrink-0 overflow-hidden rounded-md">
            <Image
              src={offer.offeredPlayer.team.flagUrl}
              alt=""
              fill
              className="object-cover"
              sizes="36px"
            />
          </div>
          <div>
            <p className="text-xs text-gray-500">{isOwn ? 'Tu oferta' : offer.user.name} ofrece:</p>
            <p className="font-semibold">{offer.offeredPlayer.name}</p>
            <p className="text-xs text-gray-500">
              {offer.offeredPlayer.team.name} · #{offer.offeredPlayer.number}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500">Busca:</p>
          {offer.wantedPlayer ? (
            <div className="flex items-center gap-1.5">
              <div className="relative size-5 overflow-hidden rounded">
                <Image
                  src={offer.wantedPlayer.team.flagUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="20px"
                />
              </div>
              <span className="text-sm font-medium">{offer.wantedPlayer.name}</span>
            </div>
          ) : offer.wantedRarity ? (
            <span
              className={cn(
                'inline-block rounded-full px-2 py-0.5 text-xs font-bold',
                RARITY_COLOR[offer.wantedRarity]
              )}
            >
              Cualquier {RARITY_LABEL[offer.wantedRarity]}
            </span>
          ) : (
            <span className="text-sm text-gray-400">Cualquier figurita</span>
          )}
        </div>
      </div>

      {/* Actions */}
      {!isOwn && !showClaim && (
        <button
          onClick={() => setShowClaim(true)}
          className="mt-3 w-full rounded-lg bg-[#1a472a] py-2 text-sm font-bold text-white transition hover:bg-[#1a472a]/80"
        >
          Reclamar →
        </button>
      )}

      {isOwn && (
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="mt-3 w-full rounded-lg border border-red-200 py-1.5 text-xs text-red-500 transition hover:bg-red-50 disabled:opacity-50"
        >
          Cancelar oferta
        </button>
      )}

      {/* Claim panel */}
      {showClaim && !isOwn && (
        <div className="mt-3 space-y-2 border-t pt-3">
          <p className="text-sm font-medium">Selecciona qué ofreces:</p>
          {eligibleDups.length === 0 ? (
            <p className="text-sm text-gray-400">
              No tienes figuritas que cumplan los requisitos de esta oferta.
            </p>
          ) : (
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {eligibleDups.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDup(d)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg border-2 p-2 text-left transition',
                    selectedDup?.id === d.id
                      ? 'border-[#1a472a] bg-green-50 dark:bg-green-900/20'
                      : 'border-transparent bg-gray-50 hover:bg-gray-100 dark:bg-gray-700'
                  )}
                >
                  <div className="relative size-6 overflow-hidden rounded">
                    <Image
                      src={d.player.team.flagUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="24px"
                    />
                  </div>
                  <span className="text-sm">{d.player.name}</span>
                  <span
                    className={cn(
                      'ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                      RARITY_COLOR[d.player.rarity]
                    )}
                  >
                    {RARITY_LABEL[d.player.rarity]}
                  </span>
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setShowClaim(false)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Cancelar
            </button>
            <button
              onClick={handleClaim}
              disabled={!selectedDup || isPending}
              className="ml-auto rounded-lg bg-[#1a472a] px-4 py-1.5 text-sm font-bold text-white disabled:opacity-50"
            >
              {isPending ? 'Enviando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MyOfferClaims({ claims, offerId }: { claims: Offer['claims']; offerId: string }) {
  const [isPending, startTransition] = useTransition()
  const pending = claims.filter((c) => c.status === 'PENDING')

  if (pending.length === 0)
    return <p className="mt-2 text-xs text-gray-400">Sin solicitudes aún.</p>

  return (
    <div className="mt-2 space-y-2">
      {pending.map((claim) => (
        <div
          key={claim.id}
          className="flex items-center gap-3 rounded-lg bg-gray-50 p-2 dark:bg-gray-700"
        >
          <div className="relative size-6 overflow-hidden rounded">
            <Image
              src={claim.offeredPlayer.team.flagUrl}
              alt=""
              fill
              className="object-cover"
              sizes="24px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium">
              {claim.claimer.name} ofrece: {claim.offeredPlayer.name}
            </p>
          </div>
          <div className="flex gap-1">
            <button
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await respondClaim(claim.id, true)
                    toast.success('¡Intercambio realizado!')
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : 'Error')
                  }
                })
              }
              className="rounded bg-green-500 px-2 py-1 text-[10px] font-bold text-white disabled:opacity-50"
            >
              ✓
            </button>
            <button
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await respondClaim(claim.id, false)
                    toast.success('Solicitud rechazada')
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : 'Error')
                  }
                })
              }
              className="rounded bg-red-400 px-2 py-1 text-[10px] font-bold text-white disabled:opacity-50"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function PublishOfferForm({ duplicates }: { duplicates: DuplicateSticker[] }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [offered, setOffered] = useState<DuplicateSticker | null>(null)
  const [wantedType, setWantedType] = useState<'specific' | 'rarity' | 'any'>('any')
  const [wantedSearch, setWantedSearch] = useState('')
  const [wantedRarity, setWantedRarity] = useState<PlayerRarity>('RARE')
  const [isPending, startTransition] = useTransition()

  function handlePublish() {
    if (!offered) return
    startTransition(async () => {
      try {
        await publishOffer(offered.player.id, null, wantedType === 'rarity' ? wantedRarity : null)
        toast.success('¡Oferta publicada en el tablero!')
        setOpen(false)
        setStep(1)
        setOffered(null)
        setWantedType('any')
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error')
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border-2 border-dashed border-[#1a472a]/30 py-3 text-sm font-medium text-[#1a472a] transition hover:bg-[#1a472a]/5 dark:text-green-400"
      >
        + Publicar nueva oferta
      </button>
    )
  }

  return (
    <div className="rounded-xl border-2 border-[#1a472a]/20 bg-white p-4 dark:bg-gray-800">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-semibold">Nueva oferta</p>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>

      {step === 1 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">¿Qué figurita ofreces?</p>
          {duplicates.length === 0 ? (
            <p className="text-sm text-gray-400">No tienes figuritas repetidas para ofrecer.</p>
          ) : (
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {duplicates.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setOffered(d)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg border-2 p-2 text-left transition',
                    offered?.id === d.id
                      ? 'border-[#1a472a] bg-green-50 dark:bg-green-900/20'
                      : 'border-transparent bg-gray-50 hover:bg-gray-100 dark:bg-gray-700'
                  )}
                >
                  <div className="relative size-6 overflow-hidden rounded">
                    <Image
                      src={d.player.team.flagUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="24px"
                    />
                  </div>
                  <span className="text-sm">{d.player.name}</span>
                  <span
                    className={cn(
                      'ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                      RARITY_COLOR[d.player.rarity]
                    )}
                  >
                    {RARITY_LABEL[d.player.rarity]}
                  </span>
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setStep(2)}
            disabled={!offered}
            className="w-full rounded-lg bg-[#1a472a] py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            Siguiente →
          </button>
        </div>
      )}

      {step === 2 && offered && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-2 dark:bg-green-900/20">
            <div className="relative size-6 overflow-hidden rounded">
              <Image
                src={offered.player.team.flagUrl}
                alt=""
                fill
                className="object-cover"
                sizes="24px"
              />
            </div>
            <span className="text-sm font-medium">{offered.player.name}</span>
            <button onClick={() => setStep(1)} className="ml-auto text-xs text-gray-400">
              Cambiar
            </button>
          </div>

          <p className="text-sm text-gray-500">¿Qué pides a cambio?</p>
          <div className="flex gap-2">
            {(['any', 'rarity'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setWantedType(t)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition',
                  wantedType === t
                    ? 'bg-[#1a472a] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {t === 'any' ? 'Cualquier repetida' : 'Por rareza'}
              </button>
            ))}
          </div>

          {wantedType === 'rarity' && (
            <select
              value={wantedRarity}
              onChange={(e) => setWantedRarity(e.target.value as PlayerRarity)}
              className="border-input w-full rounded-lg border bg-white px-3 py-2 text-sm dark:bg-gray-700"
            >
              <option value="COMMON">Común</option>
              <option value="RARE">Raro</option>
              <option value="LEGEND">⭐ Leyenda</option>
            </select>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              ← Volver
            </button>
            <button
              onClick={handlePublish}
              disabled={isPending}
              className="ml-auto rounded-lg bg-[#1a472a] px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {isPending ? 'Publicando...' : 'Publicar oferta'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface TablerpProps {
  offers: Offer[]
  myOffers: Offer[]
  duplicates: DuplicateSticker[]
  currentUserId: string
}

export function Tablero({ offers, myOffers, duplicates, currentUserId }: TablerpProps) {
  const [view, setView] = useState<'board' | 'mine'>('board')
  const [rarityFilter, setRarityFilter] = useState<string>('all')

  const filtered = offers.filter(
    (o) => rarityFilter === 'all' || o.offeredPlayer.rarity === rarityFilter
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(['board', 'mine'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition',
                view === v
                  ? 'bg-[#1a472a] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              )}
            >
              {v === 'board' ? `Tablero (${offers.length})` : `Mis ofertas (${myOffers.length})`}
            </button>
          ))}
        </div>
        {view === 'board' && (
          <select
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value)}
            className="border-input rounded-lg border bg-white px-3 py-1.5 text-sm dark:bg-gray-800"
          >
            <option value="all">Todas las rarezas</option>
            <option value="COMMON">Común</option>
            <option value="RARE">Raro</option>
            <option value="LEGEND">⭐ Leyenda</option>
          </select>
        )}
      </div>

      {view === 'board' && (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400">
              No hay ofertas disponibles. ¡Sé el primero en publicar una!
            </p>
          ) : (
            filtered.map((o) => (
              <OfferCard
                key={o.id}
                offer={o}
                currentUserId={currentUserId}
                myDuplicates={duplicates}
              />
            ))
          )}
        </div>
      )}

      {view === 'mine' && (
        <div className="space-y-4">
          <PublishOfferForm duplicates={duplicates} />
          {myOffers.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">
              No has publicado ninguna oferta.
            </p>
          ) : (
            myOffers.map((o) => (
              <div key={o.id} className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="relative size-8 overflow-hidden rounded">
                    <Image
                      src={o.offeredPlayer.team.flagUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{o.offeredPlayer.name}</p>
                    <p className="text-xs text-gray-500">
                      Busca:{' '}
                      {o.wantedPlayer?.name ??
                        (o.wantedRarity
                          ? `Cualquier ${RARITY_LABEL[o.wantedRarity]}`
                          : 'Cualquier figurita')}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-bold',
                      o.status === 'OPEN'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    )}
                  >
                    {o.status === 'OPEN'
                      ? 'Activa'
                      : o.status === 'CLAIMED'
                        ? 'Reclamada'
                        : 'Cancelada'}
                  </span>
                </div>
                {o.status === 'OPEN' && <MyOfferClaims claims={o.claims} offerId={o.id} />}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
