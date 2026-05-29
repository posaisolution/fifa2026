export type UserRole = 'USER' | 'ADMIN'
export type PlayerRarity = 'COMMON' | 'RARE' | 'LEGEND'
export type StickerStatus = 'MISSING' | 'OWNED' | 'DUPLICATE'
export type TradeStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
export type PlayerPosition = 'GK' | 'DEF' | 'MID' | 'FWD'
export type Confederation = 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC'

export interface TeamWithProgress {
  id: string
  fifaCode: string
  name: string
  group: string
  confederation: Confederation
  flagUrl: string
  coverImageUrl: string | null
  totalPlayers: number
  ownedPlayers: number
}

export interface PlayerWithStatus {
  id: string
  name: string
  position: PlayerPosition
  number: number
  imageUrl: string | null
  rarity: PlayerRarity
  stickerStatus: StickerStatus
  stickerId?: string
}

export interface AlbumStats {
  totalStickers: number
  ownedStickers: number
  duplicateStickers: number
  completionPercentage: number
  byConfederation: Record<Confederation, { total: number; owned: number }>
  byPosition: Record<PlayerPosition, { total: number; owned: number }>
}
