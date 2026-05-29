import { z } from 'zod'

export const toggleStickerSchema = z.object({
  stickerId: z.string().cuid(),
  status: z.enum(['MISSING', 'OWNED', 'DUPLICATE']),
})

export const tradeRequestSchema = z.object({
  toUserId: z.string().cuid(),
  stickerOfferedId: z.string().cuid(),
  stickerWantedId: z.string().cuid(),
})

export type ToggleStickerInput = z.infer<typeof toggleStickerSchema>
export type TradeRequestInput = z.infer<typeof tradeRequestSchema>
