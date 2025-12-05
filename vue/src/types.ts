export interface Fish {
  name: string
  emoji: string
  strength: number
  sizes: FishSize[]
  sizeMultipliers: {
    strength: number
    escapeChance: number
    value: number
  }
  breakChance?: number
}

export interface FishSize {
  name: string
  minWeight: number
  maxWeight: number
  rarity: number
  emojiModifier?: string
}

export interface CaughtFish extends Fish {
  location: string
  timestamp: string
  caughtSize?: FishSize
  weight?: number
  actualStrength?: number
  basePrice?: number
}

export type FishingState = 'idle' | 'casting' | 'waiting' | 'fighting' | 'success' | 'failed'

export interface FishingResult {
  type: 'success' | 'failed' | 'rod_break'
  message: string
  brokenItemId?: string
}

export interface FishingModuleState {
  caughtFish: CaughtFish[]
  fishForSale: FishForSale[]
  currentLocation: Location | null
  inventory: InventoryItem[]
  equippedTackle: {
    rod: TackleItem | null
    reel: TackleItem | null
    line: TackleItem | null
    bait: TackleItem | null
  }
  money: number
}

export interface GameModuleState {
  fishingState: FishingState
  isReeling: boolean
  fishingResult: FishingResult | null
  currentFish: Fish | null
  tension: number
  gameInterval: NodeJS.Timeout | null
  biteTimeout: NodeJS.Timeout | null
  showResult: boolean
  currentHotSpot: HotSpot | null
  difficultyMultiplier: number
  hotSpotActive: boolean
}

export interface TackleItem {
  id: string
  name: string
  type: 'rod' | 'reel' | 'line' | 'bait'
  level: number
  price: number
  strengthBonus: number
  description: string
}

export interface ShopItem {
  id: string
  name: string
  type: 'tackle' | 'bait'
  price: number
  description: string
  properties: {
    strengthBonus?: number
    level?: number
    upgradeTarget?: string
    upgradeLevel?: number
  }
}

export interface InventoryItem {
  id: string
  name: string
  type: 'fish' | 'tackle' | 'bait'
  quantity: number
  price: number
  emoji?: string
  properties?: any
}

export interface HotSpot {
  id: string;
  name: string;
  type: 'fishing' | 'bigFish' | 'rare' | 'bonus';
  multiplier: number;
  description: string;
  active: boolean;
  chance: number;
  visualEffect?: string;
  color?: string;
  effects: {
    strengthMultiplier?: number;
    biteTimeReduction?: number;
    valueMultiplier?: number;
    rareFishChance?: number;
  };
}

export interface Location {
  id: number;
  name: string;
  image: string;
  description: string;
  fish: Fish[];
  hotSpots: HotSpot[];
}

export interface FishForSale extends Fish {
  location: string
  timestamp: string
  price: number
  inventoryId: string
  caughtSize?: FishSize
  weight?: number
  actualStrength?: number
}