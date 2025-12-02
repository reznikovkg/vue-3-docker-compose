import { Store } from 'vuex'

export interface Zone {
  x: number
  y: number
  r: number
}

export interface Zones {
  medium: Zone[]
  high: Zone[]
}

export interface FishCounts {
  carp: number
  perch: number
  pike: number
}

export interface BaitCounts {
  worm: number
  small_fish: number
}

export interface Inventory {
  fish: FishCounts
  baits: BaitCounts
  groundbait: number
}

export interface FeedingSpot {
  x: number
  y: number
  level: number
}

export interface Island {
  x: number
  y: number
  islandRadius: number
  shallowRadius: number
}

export interface GameState {
  pos: { x: number; y: number }
  inventory: Inventory
  zones: Zones
  balance: number
  feedingSpots: FeedingSpot[]
  islands: Island[]
  marketNearby: boolean
  currentBaitId: string
  ownedTackleIds: string[]
  equippedTackle: {
    rod?: string
    reel?: string
    line?: string
    hook?: string
  }
}

export interface RootState {
  game: GameState
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: Store<RootState>
  }
}

