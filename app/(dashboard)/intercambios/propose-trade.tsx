'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { fetchUsersWithPlayer, requestTrade } from '@/server/actions/trades'
import { cn } from '@/lib/utils'

type MissingSticker = {
  id: string
  player: {
    id: string
    name: string
    number: number
    position: string
    rarity: string
    team: { name: string; flagUrl: string; group: string }
  }
}

type DuplicateSticker = {
  id: string
  player: {
    id: string
    name: string
    number: number
    position: string
    rarity: string
    team: { name: string; flagUrl: string }
  }
}

type UserWithSticker = {
  album: { user: { id: string; name: string } }
}

const RARITY_BADGE: Record<string, string> = {
  COMMON: 'bg-slate-100 text-slate-600',
  RARE: 'bg-blue-100 text-blue-700',
  LEGEND: 'bg-yellow-100 text-yellow-700',
}

interface ProposeTradePros {
  missingStickers: MissingSticker[]
  duplicateStickers: DuplicateSticker[]
}

export function ProposeTradeWizard({ missingStickers, duplicateStickers }: ProposeTradePros) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [search, setSearch] = useState('')
  const [wantedSticker, setWantedSticker] = useState<MissingSticker | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserWithSticker | null>(null)
  const [offeredSticker, setOfferedSticker] = useState<DuplicateSticker | null>(null)
  const [usersWithPlayer, setUsersWithPlayer] = useState<UserWithSticker[]>([])
  const [isPending, startTransition] = useTransition()

  function reset() {
    setStep(1)
    setSearch('')
    setWantedSticker(null)
    setSelectedUser(null)
    setOfferedSticker(null)
    setUsersWithPlayer([])
  }

  function handleSelectWanted(sticker: MissingSticker) {
    setWantedSticker(sticker)
    startTransition(async () => {
      const users = await fetchUsersWithPlayer(sticker.player.id)
      setUsersWithPlayer(users as UserWithSticker[])
      setStep(2)
    })
  }

  function handleSelectUser(user: UserWithSticker) {
    setSelectedUser(user)
    setStep(3)
  }

  function handleSendTrade() {
    if (!wantedSticker || !selectedUser || !offeredSticker) return
    startTransition(async () => {
      try {
        await requestTrade(
          selectedUser.album.user.id,
          offeredSticker.player.id,
          wantedSticker.player.id
        )
        toast.success(`¡Solicitud enviada a ${selectedUser.album.user.name}!`)
        reset()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al enviar la solicitud')
      }
    })
  }

  const filteredMissing = missingStickers.filter(
    (s) =>
      s.player.name.toLowerCase().includes(search.toLowerCase()) ||
      s.player.team.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {([1, 2, 3] as const).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                'flex size-7 items-center justify-center rounded-full text-xs font-bold',
                step === s
                  ? 'bg-[#1a472a] text-white'
                  : step > s
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
              )}
            >
              {step > s ? '✓' : s}
            </div>
            {s < 3 && <div className={cn('h-px w-8', step > s ? 'bg-green-500' : 'bg-gray-200')} />}
          </div>
        ))}
        <span className="ml-2 text-sm text-gray-500">
          {step === 1 && '¿Qué figurita quieres?'}
          {step === 2 && '¿A quién se la pides?'}
          {step === 3 && '¿Qué ofreces a cambio?'}
        </span>
      </div>

      {/* STEP 1 — Pick wanted sticker */}
      {step === 1 && (
        <div className="space-y-3">
          {missingStickers.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              ¡No te falta ninguna figurita! Álbum completo 🎉
            </p>
          ) : (
            <>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar jugador o equipo..."
                className="border-input w-full rounded-lg border bg-white px-3 py-2 text-sm dark:bg-gray-800"
              />
              <p className="text-xs text-gray-400">{filteredMissing.length} figuritas faltantes</p>
              <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
                {filteredMissing.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectWanted(s)}
                    disabled={isPending}
                    className="flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left shadow-sm transition hover:shadow-md disabled:opacity-50 dark:bg-gray-800"
                  >
                    <div className="relative size-8 shrink-0 overflow-hidden rounded">
                      <Image
                        src={s.player.team.flagUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{s.player.name}</p>
                      <p className="text-xs text-gray-500">
                        {s.player.team.name} · #{s.player.number} · Grupo {s.player.team.group}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold',
                        RARITY_BADGE[s.player.rarity]
                      )}
                    >
                      {s.player.rarity === 'LEGEND'
                        ? '⭐ Leyenda'
                        : s.player.rarity === 'RARE'
                          ? 'Raro'
                          : 'Común'}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* STEP 2 — Pick user */}
      {step === 2 && wantedSticker && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-green-50 p-3 dark:bg-green-900/20">
            <div className="relative size-8 shrink-0 overflow-hidden rounded">
              <Image
                src={wantedSticker.player.team.flagUrl}
                alt=""
                fill
                className="object-cover"
                sizes="32px"
              />
            </div>
            <div>
              <p className="text-sm font-semibold">{wantedSticker.player.name}</p>
              <p className="text-xs text-gray-500">{wantedSticker.player.team.name}</p>
            </div>
            <button onClick={reset} className="ml-auto text-xs text-gray-400 hover:text-gray-600">
              Cambiar
            </button>
          </div>

          {usersWithPlayer.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              Ningún usuario tiene esta figurita disponible para intercambiar.
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">{usersWithPlayer.length} usuario(s) la tienen</p>
              {usersWithPlayer.map((u, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectUser(u)}
                  className="flex w-full items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md dark:bg-gray-800"
                >
                  <div className="flex size-9 items-center justify-center rounded-full bg-[#1a472a] text-sm font-bold text-white">
                    {u.album.user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-medium">{u.album.user.name}</span>
                  <span className="ml-auto text-xs text-[#1a472a]">Pedir →</span>
                </button>
              ))}
            </div>
          )}

          <button onClick={() => setStep(1)} className="text-sm text-gray-400 hover:text-gray-600">
            ← Volver
          </button>
        </div>
      )}

      {/* STEP 3 — Pick offer */}
      {step === 3 && selectedUser && wantedSticker && (
        <div className="space-y-3">
          {/* Summary */}
          <div className="rounded-xl bg-gray-50 p-3 text-sm dark:bg-gray-800">
            <p className="text-gray-500">
              Pedirle a <strong>{selectedUser.album.user.name}</strong>:
            </p>
            <p className="mt-0.5 font-semibold text-[#1a472a]">
              {wantedSticker.player.name} ({wantedSticker.player.team.name})
            </p>
          </div>

          <p className="text-sm font-medium">Selecciona qué ofreces a cambio:</p>

          {duplicateStickers.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">
              No tienes figuritas repetidas para ofrecer.
            </p>
          ) : (
            <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
              {duplicateStickers.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setOfferedSticker(s)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition',
                    offeredSticker?.id === s.id
                      ? 'border-[#1a472a] bg-green-50 dark:bg-green-900/20'
                      : 'border-transparent bg-white shadow-sm hover:shadow-md dark:bg-gray-800'
                  )}
                >
                  <div className="relative size-8 shrink-0 overflow-hidden rounded">
                    <Image
                      src={s.player.team.flagUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{s.player.name}</p>
                    <p className="text-xs text-gray-500">
                      {s.player.team.name} · #{s.player.number}
                    </p>
                  </div>
                  {offeredSticker?.id === s.id && <span className="text-[#1a472a]">✓</span>}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setStep(2)}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              ← Volver
            </button>
            <button
              onClick={handleSendTrade}
              disabled={!offeredSticker || isPending}
              className="ml-auto rounded-xl bg-[#1a472a] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#1a472a]/80 disabled:opacity-50"
            >
              {isPending ? 'Enviando...' : 'Enviar solicitud ✓'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
