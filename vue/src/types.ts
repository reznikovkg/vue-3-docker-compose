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
  swimmingSpeed?: number
  stamina?: number
  strugglePattern?: string
}

export interface FishSize {
  name: string
  minWeight: number
  maxWeight: number
  rarity: number
  emojiModifier?: string
}

export interface FishMovement {
  x: number
  y: number
  direction: number
  speed: number
  stamina: number
  struggleIntensity: number
  isStruggling: boolean
}

export interface BaitItem extends TackleItem {
  uses: number
  maxUses: number
  fishAttraction?: {
    fishName: string
    attractionMultiplier: number
  }[]
}

export interface FishAttraction {
  fishName: string
  attractionMultiplier: number
}

export interface GroundbaitType {
  id: string
  name: string
  description: string
  level: number
  maxLevel: number
  price: number
  radius: number
  uses: number
  maxUses: number
  fishAttraction: FishAttraction[]
  color: string
  emoji: string
}

export interface GroundbaitSpot {
  id: string
  locationId: number
  groundbaitType: GroundbaitType
  position: {
    x: number
    y: number
  }
  radius: number
  currentUses: number
  level: number
  createdAt: number
  fishAttraction: FishAttraction[]
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
  type: 'success' | 'failed' | 'rod_break' | 'net_success' | 'net_broken'
  message: string
  brokenItemId?: string
}

export interface TackleItem {
  id: string
  name: string
  type: 'rod' | 'reel' | 'line' | 'bait' | 'net'
  level: number
  price: number
  strengthBonus: number
  description: string
}

export interface NetItem extends TackleItem {
  maxWeight: number
  durability: number
  usesLeft: number
  isActive?: boolean
}

export interface ShopItem {
  id: string
  name: string
  type: 'tackle' | 'bait' | 'groundbait' | 'net'
  price: number
  description: string
  properties: {
    strengthBonus?: number
    level?: number
    upgradeTarget?: string
    upgradeLevel?: number
    radius?: number
    uses?: number
    maxWeight?: number
    durability?: number
    fishAttraction?: FishAttraction[]
    color?: string
  }
}

export interface InventoryItem {
  id: string
  name: string
  type: 'fish' | 'tackle' | 'bait' | 'net' | 'groundbait'
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
  equippedNet: NetItem | null
  activeNet: NetItem | null
  money: number
  groundbaitSpots: GroundbaitSpot[]
  availableGroundbaits: GroundbaitType[]
  activeGroundbait: GroundbaitType | null
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
  fishMovement: FishMovement | null
  fishPosition: { x: number; y: number }
  distanceToRod: number
  fishingStartTime: number
  fishStruggleCount: number
  floatPosition: { x: number; y: number }
  isCastingMode: boolean
  castTargetPosition: { x: number; y: number } | null
  lastReelTime: number
  groundbaitEffectActive: boolean
  groundbaitEffectMessage: string
  isNetAvailable: boolean
  netActivationDistance: number
  isNetUsed: boolean
}