'use client'

import { useTransition, useOptimistic } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { toggleSticker } from '@/server/actions/album'
import type { PlayerWithStatus } from '@/types'

const POSITION_LABEL: Record<string, string> = {
  GK: 'PO',
  DEF: 'DEF',
  MID: 'MED',
  FWD: 'DEL',
}

const RARITY_STYLE: Record<string, string> = {
  COMMON: 'from-slate-400 to-slate-600',
  RARE: 'from-blue-500 to-blue-700',
  LEGEND: 'from-[#d4af37] to-yellow-600',
}

interface StickerCardProps {
  player: PlayerWithStatus
}

export function StickerCard({ player: initialPlayer }: StickerCardProps) {
  const [isPending, startTransition] = useTransition()
  const [player, setOptimistic] = useOptimistic(
    initialPlayer,
    (state, newStatus: 'MISSING' | 'OWNED' | 'DUPLICATE') => ({
      ...state,
      stickerStatus: newStatus,
    })
  )

  const isOwned = player.stickerStatus !== 'MISSING'

  function handleClick() {
    if (isPending) return
    const newStatus = isOwned ? 'MISSING' : 'OWNED'

    startTransition(async () => {
      setOptimistic(newStatus)
      try {
        await toggleSticker(player.id, newStatus)
        if (newStatus === 'OWNED') {
          toast.success(`¡${player.name} conseguido!`, { duration: 2000 })
        }
      } catch {
        toast.error('Error al actualizar la figurita')
      }
    })
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={isPending}
      className="focus-visible:ring-primary group relative w-full cursor-pointer rounded-xl focus:outline-none focus-visible:ring-2"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      layout
    >
      <AnimatePresence mode="wait">
        {isOwned ? (
          <motion.div
            key="owned"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={cn(
              'relative overflow-hidden rounded-xl shadow-md',
              'bg-linear-to-b',
              RARITY_STYLE[player.rarity]
            )}
          >
            {/* Player image or placeholder */}
            <div className="relative aspect-[3/4] w-full bg-black/20">
              {player.imageUrl ? (
                <Image
                  src={player.imageUrl}
                  alt={player.name}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 45vw, 180px"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-4xl opacity-60">👤</span>
                </div>
              )}

              {/* Rarity badge */}
              {player.rarity === 'LEGEND' && (
                <span className="absolute top-1 right-1 text-xs">⭐</span>
              )}
            </div>

            {/* Player info */}
            <div className="p-2 text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold opacity-80">
                  {POSITION_LABEL[player.position]}
                </span>
                <span className="text-xs font-bold">#{player.number}</span>
              </div>
              <p className="mt-0.5 truncate text-xs leading-tight font-semibold">{player.name}</p>
            </div>

            {/* Duplicate badge */}
            {player.stickerStatus === 'DUPLICATE' && (
              <div className="absolute top-1 left-1 rounded bg-orange-500 px-1 py-0.5 text-[10px] font-bold text-white">
                2+
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="missing"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 shadow-sm transition-colors group-hover:border-[#1a472a]/40"
          >
            <div className="relative aspect-[3/4] w-full">
              <div className="flex h-full flex-col items-center justify-center gap-1 text-gray-300">
                <span className="text-3xl">?</span>
                <span className="text-lg font-bold">#{player.number}</span>
              </div>
            </div>
            <div className="p-2">
              <p className="truncate text-xs text-gray-300">{player.name}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
