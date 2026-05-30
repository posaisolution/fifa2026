'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { toast } from 'sonner'
import {
  openFreePack,
  openPaidPack,
  type PackResult,
  type PackStickerResult,
} from '@/server/actions/packs'
import { cn } from '@/lib/utils'

const RARITY_GRADIENT: Record<string, string> = {
  COMMON: 'from-slate-500 to-slate-700',
  RARE: 'from-blue-500 to-blue-800',
  LEGEND: 'from-yellow-400 to-amber-600',
}

const RARITY_GLOW: Record<string, string> = {
  COMMON: 'shadow-slate-400/50',
  RARE: 'shadow-blue-500/60',
  LEGEND: 'shadow-yellow-400/80',
}

const RARITY_LABEL: Record<string, string> = {
  COMMON: 'Común',
  RARE: 'Raro',
  LEGEND: '⭐ Leyenda',
}

type Phase = 'idle' | 'shaking' | 'revealing' | 'done'

function RevealCard({
  sticker,
  index,
  isRevealing,
}: {
  sticker: PackStickerResult
  index: number
  isRevealing: boolean
}) {
  const [flipped, setFlipped] = useState(false)

  return (
    // Outer: defines the size + perspective
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.12, duration: 0.35, type: 'spring', stiffness: 220 }}
      className="relative w-full cursor-pointer"
      style={{ perspective: '800px', aspectRatio: '3/4' }}
      onClick={() => isRevealing && setFlipped(true)}
    >
      {/* Inner: rotates */}
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.45, type: 'spring', stiffness: 140 }}
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* BACK face */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-1 overflow-hidden rounded-xl bg-linear-to-b from-[#1a472a] to-[#0d2b1a] shadow-lg"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <span className="text-3xl">⚽</span>
          <span className="text-[10px] font-bold text-green-300">Toca</span>
        </div>

        {/* FRONT face */}
        <div
          className={cn(
            'absolute inset-0 flex flex-col overflow-hidden rounded-xl bg-linear-to-b shadow-xl',
            RARITY_GRADIENT[sticker.rarity],
            flipped && `shadow-2xl ${RARITY_GLOW[sticker.rarity]}`
          )}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Flag strip */}
          <div className="relative h-7 w-full shrink-0 overflow-hidden">
            <Image
              src={sticker.teamFlagUrl}
              alt={sticker.teamName}
              fill
              className="object-cover opacity-50"
              sizes="160px"
            />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow">
              {sticker.teamName}
            </span>
          </div>

          {/* Avatar */}
          <div className="flex flex-1 items-center justify-center bg-black/20">
            <span className="text-4xl">👤</span>
          </div>

          {/* Info */}
          <div className="shrink-0 p-1.5 text-white">
            <div className="flex justify-between text-[9px] opacity-75">
              <span>{sticker.playerPosition}</span>
              <span>#{sticker.playerNumber}</span>
            </div>
            <p className="truncate text-[10px] leading-tight font-bold">{sticker.playerName}</p>
            <p className="text-[8px] opacity-60">{RARITY_LABEL[sticker.rarity]}</p>
          </div>

          {/* Badge — debajo de la bandera para no tapar el nombre */}
          <div
            className={cn(
              'absolute top-8 right-1 rounded-full px-1.5 py-0.5 text-[8px] leading-none font-bold',
              sticker.wasNew ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
            )}
          >
            {sticker.wasNew ? '¡NUEVA!' : 'REPETIDA'}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

interface PackOpenerProps {
  coins: number
  canFreePack: boolean
  freePackIn?: number // hours remaining
}

export function PackOpener({ coins: initialCoins, canFreePack, freePackIn }: PackOpenerProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [result, setResult] = useState<PackResult | null>(null)
  const [coins, setCoins] = useState(initialCoins)
  const [isPending, startTransition] = useTransition()
  const [revealAll, setRevealAll] = useState(false)

  async function handleOpen(free: boolean) {
    setPhase('shaking')
    await new Promise((r) => setTimeout(r, 600))
    setPhase('revealing')

    startTransition(async () => {
      try {
        const res = free ? await openFreePack() : await openPaidPack()
        setResult(res)
        setCoins(res.newCoinsBalance)
        setPhase('done')
      } catch (err) {
        setPhase('idle')
        toast.error(err instanceof Error ? err.message : 'Error al abrir el sobre')
      }
    })
  }

  function reset() {
    setPhase('idle')
    setResult(null)
    setRevealAll(false)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Coins display */}
      <div className="flex items-center gap-2 rounded-full bg-[#d4af37]/10 px-5 py-2.5 text-[#d4af37]">
        <span className="text-xl">🪙</span>
        <span className="text-lg font-bold">{coins}</span>
        <span className="text-sm opacity-70">monedas</span>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            {/* Pack visual */}
            <div className="relative flex h-48 w-32 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-b from-[#1a472a] to-[#0d2b1a] shadow-2xl shadow-[#1a472a]/40">
              <div className="flex flex-col items-center gap-2">
                <span className="text-5xl">⚽</span>
                <span className="text-xs font-bold text-green-300">SOBRE</span>
                <span className="text-[10px] text-green-400">5 figuritas</span>
              </div>
              <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {canFreePack ? (
                <button
                  onClick={() => handleOpen(true)}
                  disabled={isPending}
                  className="rounded-xl bg-[#1a472a] px-6 py-3 font-bold text-white transition hover:bg-[#1a472a]/80 disabled:opacity-50"
                >
                  🎁 Sobre gratis
                </button>
              ) : (
                <div className="rounded-xl bg-gray-100 px-6 py-3 text-center text-sm dark:bg-gray-800">
                  <p className="font-medium text-gray-500">Próximo sobre gratis</p>
                  <p className="font-bold text-[#1a472a]">en {freePackIn}h</p>
                </div>
              )}

              <button
                onClick={() => handleOpen(false)}
                disabled={isPending || coins < 20}
                className="rounded-xl border-2 border-[#d4af37] px-6 py-3 font-bold text-[#d4af37] transition hover:bg-[#d4af37]/10 disabled:opacity-50"
              >
                🪙 Comprar sobre (20 monedas)
              </button>
            </div>
          </motion.div>
        )}

        {phase === 'shaking' && (
          <motion.div
            key="shaking"
            className="relative flex h-48 w-32 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-b from-[#1a472a] to-[#0d2b1a] shadow-2xl"
            animate={{
              rotate: [-3, 3, -3, 3, -2, 2, 0],
              scale: [1, 1.05, 1.05, 1.08, 1.05, 1.1, 1.15],
            }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-5xl">⚽</span>
              <span className="text-xs font-bold text-green-300">ABRIENDO...</span>
            </div>
          </motion.div>
        )}

        {(phase === 'revealing' || phase === 'done') && result && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-lg space-y-4"
          >
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {result.stickers.map((sticker, i) => (
                <RevealCard
                  key={sticker.playerId}
                  sticker={sticker}
                  index={i}
                  isRevealing={phase === 'done'}
                />
              ))}
            </div>

            {phase === 'done' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3 text-center"
              >
                <button
                  onClick={() => setRevealAll(true)}
                  className="text-sm text-[#1a472a] underline dark:text-green-400"
                >
                  {revealAll ? '' : 'Revelar todas'}
                </button>

                {result.coinsEarned > 0 && (
                  <p className="text-sm font-medium text-[#d4af37]">
                    🪙 +{result.coinsEarned} monedas por repetidas
                  </p>
                )}

                <div className="flex justify-center gap-3">
                  <button
                    onClick={reset}
                    className="rounded-xl bg-[#1a472a] px-5 py-2.5 font-medium text-white transition hover:bg-[#1a472a]/80"
                  >
                    Abrir otro sobre
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
