import { ActionContext } from 'vuex'
import {
  GameState,
  Zones,
  Zone,
  Inventory,
  RootState,
  FeedingSpot,
  Island,
} from '../types'

const lsKey = 'fishing_state_v2'
const VERSION = 1
const INITIAL_BALANCE = 100
const FEED_RADIUS = 220
const MERGE_RADIUS = 220

export interface FishType {
  id: 'carp' | 'perch' | 'pike'
  name: string
  rarity: 'common' | 'good' | 'rare'
  basePrice: number
  size: number
}

export interface BaitDef {
  id: 'worm' | 'small_fish'
  name: string
  price: number
  fishIds: FishType['id'][]
}

export interface GroundbaitDef {
  id: 'groundbait_basic'
  name: string
  price: number
}

export type TackleSlot = 'rod' | 'reel' | 'line' | 'hook'

export interface TackleItem {
  id: string
  type: TackleSlot
  name: string
  price: number
  power: number
}

export const FISH_TYPES: FishType[] = [
  { id: 'carp', name: 'Карась', rarity: 'common', basePrice: 6, size: 1 },
  { id: 'perch', name: 'Окунь', rarity: 'good', basePrice: 14, size: 2 },
  { id: 'pike', name: 'Щука', rarity: 'rare', basePrice: 32, size: 3 },
]

export const BAITS: BaitDef[] = [
  { id: 'worm', name: 'Червь', price: 2, fishIds: ['carp', 'perch'] },
  { id: 'small_fish', name: 'Живец', price: 5, fishIds: ['pike'] },
]

export const GROUNDBAIT_ITEMS: GroundbaitDef[] = [
  { id: 'groundbait_basic', name: 'Прикормка', price: 7 },
]

export const TACKLE_ITEMS: TackleItem[] = [
  { id: 'rod_t1', type: 'rod', name: 'Удилище 1', price: 0, power: 1 },
  { id: 'rod_t2', type: 'rod', name: 'Удилище 2', price: 150, power: 1.6 },
  { id: 'rod_t3', type: 'rod', name: 'Удилище 3', price: 320, power: 2.5 },

  { id: 'reel_t1', type: 'reel', name: 'Катушка 1', price: 0, power: 1 },
  { id: 'reel_t2', type: 'reel', name: 'Катушка 2', price: 120, power: 1.5 },
  { id: 'reel_t3', type: 'reel', name: 'Катушка 3', price: 280, power: 2 },

  { id: 'line_t1', type: 'line', name: 'Леска 1', price: 0, power: 1 },
  { id: 'line_t2', type: 'line', name: 'Леска 2', price: 90, power: 1.3 },
  { id: 'line_t3', type: 'line', name: 'Леска 3', price: 220, power: 1.6 },

  { id: 'hook_t1', type: 'hook', name: 'Крючок 1', price: 0, power: 1 },
  { id: 'hook_t2', type: 'hook', name: 'Крючок 2', price: 70, power: 1.18 },
  { id: 'hook_t3', type: 'hook', name: 'Крючок 3', price: 180, power: 1.25 },
]

const ISLANDS: Island[] = [
  { x: 800, y: -1200, islandRadius: 260, shallowRadius: 420 },
  { x: -1500, y: 600, islandRadius: 220, shallowRadius: 380 },
]

const defaultOwnedTackle: string[] = ['rod_t1', 'reel_t1', 'line_t1', 'hook_t1']
const defaultEquippedTackle: GameState['equippedTackle'] = {
  rod: 'rod_t1',
  reel: 'reel_t1',
  line: 'line_t1',
  hook: 'hook_t1',
}

const distance = (a: { x: number; y: number }, b: { x: number; y: number }): number => {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

const clampPosByIslands = (pos: { x: number; y: number }): { x: number; y: number } | null => {
  for (const island of ISLANDS) {
    if (distance(pos, island) <= island.islandRadius) {
      return null
    }
  }
  return pos
}

const loadState = (): Partial<GameState> | null => {
  try {
    const saved = JSON.parse(localStorage.getItem(lsKey) || 'null')
    if (saved && saved.version === VERSION) {
      const { version, ...rest } = saved
      return rest as Partial<GameState>
    }
  } catch (e) {
    console.error('Failed to load state:', e)
  }
  return null
}

const generateZones = (): Zones => {
  const rng = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min
  const range = 6000
  const mediumCount = 16
  const highCount = 7
  const medium: Zone[] = []
  const high: Zone[] = []

  medium.push({ x: 0, y: 0, r: 220 })
  high.push({ x: 420, y: -260, r: 160 })

  for (let i = 0; i < mediumCount; i++) {
    medium.push({ x: rng(-range, range), y: rng(-range, range), r: rng(140, 240) })
  }
  for (let i = 0; i < highCount; i++) {
    high.push({ x: rng(-range, range), y: rng(-range, range), r: rng(100, 160) })
  }
  return { medium, high }
}

const savedState = loadState()
const initialZones = savedState && savedState.zones ? savedState.zones : generateZones()

const createDefaultInventory = (): Inventory => ({
  fish: {
    carp: 0,
    perch: 0,
    pike: 0,
  },
  baits: {
    worm: 10,
    small_fish: 0,
  },
  groundbait: 0,
})

const MUTATIONS = {
  SET_POS: 'SET_POS',
  SET_INVENTORY: 'SET_INVENTORY',
  SET_ZONES: 'SET_ZONES',
  SET_BALANCE: 'SET_BALANCE',
  SET_MARKET_NEARBY: 'SET_MARKET_NEARBY',
  SET_FEEDING_SPOTS: 'SET_FEEDING_SPOTS',
  SET_CURRENT_BAIT: 'SET_CURRENT_BAIT',
  SET_OWNED_TACKLE: 'SET_OWNED_TACKLE',
  SET_EQUIPPED_TACKLE: 'SET_EQUIPPED_TACKLE',
} as const

type Ctx = ActionContext<GameState, RootState>

const getBaitDef = (id: BaitDef['id']) => BAITS.find((b) => b.id === id)

const normalizeInventory = (inv?: Partial<Inventory> | null): Inventory => ({
  fish: {
    carp: inv?.fish?.carp || 0,
    perch: inv?.fish?.perch || 0,
    pike: inv?.fish?.pike || 0,
  },
  baits: {
    worm: inv?.baits?.worm || 0,
    small_fish: inv?.baits?.small_fish || 0,
  },
  groundbait: inv?.groundbait || 0,
})

const cloneInventory = (inv: Inventory): Inventory => normalizeInventory(inv)

export default {
  namespaced: true,
  state(): GameState {
    return {
      pos: savedState && savedState.pos ? savedState.pos : { x: 0, y: 0 },
      zones: initialZones,
      inventory: savedState && savedState.inventory
        ? normalizeInventory(savedState.inventory as Inventory)
        : createDefaultInventory(),
      balance: savedState && typeof savedState.balance === 'number' ? savedState.balance : INITIAL_BALANCE,
      feedingSpots: (savedState && savedState.feedingSpots ? savedState.feedingSpots : []) as FeedingSpot[],
      islands: ISLANDS,
      marketNearby: false,
      currentBaitId: (savedState && savedState.currentBaitId) || 'worm',
      ownedTackleIds: (savedState && savedState.ownedTackleIds
        ? savedState.ownedTackleIds
        : [...defaultOwnedTackle]) as string[],
      equippedTackle: (savedState && savedState.equippedTackle
        ? savedState.equippedTackle
        : { ...defaultEquippedTackle }) as GameState['equippedTackle'],
    }
  },
  getters: {
    getPos: (state: GameState) => state.pos,
    getInventory: (state: GameState) => normalizeInventory(state.inventory),
    getZones: (state: GameState) => state.zones,
    getZoneType: (state: GameState) => {
      const isInside = (p: { x: number; y: number }, c: Zone) => {
        const dx = p.x - c.x
        const dy = p.y - c.y
        return Math.sqrt(dx * dx + dy * dy) <= c.r
      }
      for (const c of state.zones.high) {
        if (isInside(state.pos, c)) return 'high'
      }
      for (const c of state.zones.medium) {
        if (isInside(state.pos, c)) return 'medium'
      }

      let base: 'low' | 'medium' | 'high' = 'low'

      let maxFeedLevel = 0
      for (const spot of state.feedingSpots) {
        if (distance(state.pos, spot) <= FEED_RADIUS && spot.level > maxFeedLevel) {
          maxFeedLevel = spot.level
        }
      }
      if (maxFeedLevel >= 1 && base === 'low') base = 'medium'
      if (maxFeedLevel >= 2) base = 'high'

      return base
    },
    getZoneLabel: (state: GameState, getters: Record<string, unknown>) => {
      const feedLevel = (getters.getFeedLevel as number) || 0
      if (feedLevel >= 3) return 'Максимальный клёв'
      const t = getters.getZoneType as 'low' | 'medium' | 'high'
      return t === 'high' ? 'Высокий клёв' : t === 'medium' ? 'Средний клёв' : 'Низкий клёв'
    },
    getBalance: (state: GameState) => state.balance,
    getIsMarketNearby: (state: GameState) => state.marketNearby,
    getCurrentBaitId: (state: GameState) => state.currentBaitId,
    getOwnedTackleIds: (state: GameState) => state.ownedTackleIds,
    getEquippedTackle: (state: GameState) => state.equippedTackle,
    getIslands: (state: GameState) => state.islands,
    getFeedingSpots: (state: GameState) => state.feedingSpots,
    getFeedLevel: (state: GameState): number => {
      let maxFeedLevel = 0
      for (const spot of state.feedingSpots) {
        if (distance(state.pos, spot) <= FEED_RADIUS && spot.level > maxFeedLevel) {
          maxFeedLevel = spot.level
        }
      }
      return maxFeedLevel
    },
    getRodPower: (state: GameState): number => {
      const equipped = state.equippedTackle
      const ids = Object.values(equipped).filter(Boolean) as string[]
      let power = 1
      for (const id of ids) {
        const item = TACKLE_ITEMS.find((t) => t.id === id)
        if (item) power *= item.power
      }
      return power
    },
  },
  mutations: {
    [MUTATIONS.SET_POS]: (state: GameState, payload: { x: number; y: number }) => {
      state.pos = payload
    },
    [MUTATIONS.SET_INVENTORY]: (state: GameState, payload: Inventory) => {
      state.inventory = payload
    },
    [MUTATIONS.SET_ZONES]: (state: GameState, payload: Zones) => {
      state.zones = payload
    },
    [MUTATIONS.SET_BALANCE]: (state: GameState, amount: number) => {
      state.balance = amount
    },
    [MUTATIONS.SET_MARKET_NEARBY]: (state: GameState, flag: boolean) => {
      state.marketNearby = flag
    },
    [MUTATIONS.SET_FEEDING_SPOTS]: (state: GameState, spots: FeedingSpot[]) => {
      state.feedingSpots = spots
    },
    [MUTATIONS.SET_CURRENT_BAIT]: (state: GameState, baitId: BaitDef['id']) => {
      state.currentBaitId = baitId
    },
    [MUTATIONS.SET_OWNED_TACKLE]: (state: GameState, ids: string[]) => {
      state.ownedTackleIds = ids
    },
    [MUTATIONS.SET_EQUIPPED_TACKLE]: (state: GameState, equipped: GameState['equippedTackle']) => {
      state.equippedTackle = equipped
    },
  },
  actions: {
    moveBoat: (context: Ctx, payload: { x: number; y: number }) => {
      const newPos = clampPosByIslands(payload)
      if (!newPos) return

      context.commit(MUTATIONS.SET_POS, newPos)

      let market = false
      for (const island of context.state.islands) {
        const d = distance(newPos, island)
        if (d > island.islandRadius && d <= island.shallowRadius) {
          market = true
          break
        }
      }
      context.commit(MUTATIONS.SET_MARKET_NEARBY, market)
      context.dispatch('saveToLocalStorage')
    },
    addFish: (context: Ctx, fishId: FishType['id']) => {
      const inv = cloneInventory(normalizeInventory(context.state.inventory))
      inv.fish[fishId] = (inv.fish[fishId] || 0) + 1
      context.commit(MUTATIONS.SET_INVENTORY, inv)
      context.dispatch('saveToLocalStorage')
    },
    catchFish: (context: Ctx, fishId: FishType['id']) => {
      const baitId = context.state.currentBaitId as BaitDef['id']
      const bait = getBaitDef(baitId)
      if (!bait || !bait.fishIds.includes(fishId)) return

      const inv = cloneInventory(normalizeInventory(context.state.inventory))
      if (!inv.baits[baitId] || inv.baits[baitId] <= 0) return

      inv.baits[baitId] -= 1
      inv.fish[fishId] = (inv.fish[fishId] || 0) + 1
      context.commit(MUTATIONS.SET_INVENTORY, inv)
      context.dispatch('saveToLocalStorage')
    },
    sellFish: (context: Ctx, payload: { fishId: FishType['id']; amount: number }) => {
      const { fishId, amount } = payload
      const inv = cloneInventory(normalizeInventory(context.state.inventory))
      if (!inv.fish[fishId] || amount <= 0) return

      const realAmount = Math.min(inv.fish[fishId], amount)
      const fish = FISH_TYPES.find((f) => f.id === fishId)
      const income = fish ? fish.basePrice * realAmount : 0
      inv.fish[fishId] -= realAmount
      context.commit(MUTATIONS.SET_INVENTORY, inv)
      context.commit(MUTATIONS.SET_BALANCE, context.state.balance + income)
      context.dispatch('saveToLocalStorage')
    },
    buyBait: (context: Ctx, payload: { baitId: BaitDef['id']; amount: number }) => {
      const { baitId, amount } = payload
      const bait = BAITS.find((b) => b.id === baitId)
      if (!bait || amount <= 0) return

      const cost = bait.price * amount
      if (context.state.balance < cost) return

      const inv = cloneInventory(normalizeInventory(context.state.inventory))
      if (!inv.baits[baitId]) inv.baits[baitId] = 0
      inv.baits[baitId] += amount
      context.commit(MUTATIONS.SET_INVENTORY, inv)
      context.commit(MUTATIONS.SET_BALANCE, context.state.balance - cost)
      context.dispatch('saveToLocalStorage')
    },
    buyGroundbait: (context: Ctx, amount: number) => {
      if (amount <= 0) return

      const item = GROUNDBAIT_ITEMS[0]
      const cost = item.price * amount
      if (context.state.balance < cost) return

      const inv = cloneInventory(normalizeInventory(context.state.inventory))
      inv.groundbait += amount
      context.commit(MUTATIONS.SET_INVENTORY, inv)
      context.commit(MUTATIONS.SET_BALANCE, context.state.balance - cost)
      context.dispatch('saveToLocalStorage')
    },
    buyTackle: (context: Ctx, itemId: string) => {
      if (context.state.ownedTackleIds.includes(itemId)) return

      const item = TACKLE_ITEMS.find((t) => t.id === itemId)
      if (!item || item.price <= 0) return
      if (context.state.balance < item.price) return

      const ids = context.state.ownedTackleIds.slice()
      ids.push(itemId)
      context.commit(MUTATIONS.SET_OWNED_TACKLE, ids)
      context.commit(MUTATIONS.SET_BALANCE, context.state.balance - item.price)
      context.dispatch('saveToLocalStorage')
    },
    sellTackle: (context: Ctx, itemId: string) => {
      if (!context.state.ownedTackleIds.includes(itemId)) return

      const item = TACKLE_ITEMS.find((t) => t.id === itemId)
      if (!item) return

      const ids = context.state.ownedTackleIds.filter((id) => id !== itemId)
      const equipped: GameState['equippedTackle'] = { ...context.state.equippedTackle }
      Object.entries(equipped).forEach(([slot, id]) => {
        if (id === itemId) {
          equipped[slot as TackleSlot] = undefined
        }
      })
      const income = Math.floor(item.price * 0.6)
      context.commit(MUTATIONS.SET_OWNED_TACKLE, ids)
      context.commit(MUTATIONS.SET_EQUIPPED_TACKLE, equipped)
      context.commit(MUTATIONS.SET_BALANCE, context.state.balance + income)
      context.dispatch('saveToLocalStorage')
    },
    equipTackle: (context: Ctx, itemId: string) => {
      const item = TACKLE_ITEMS.find((t) => t.id === itemId)
      if (!item) return
      if (!context.state.ownedTackleIds.includes(itemId)) return

      const equipped: GameState['equippedTackle'] = {
        ...context.state.equippedTackle,
        [item.type]: itemId,
      }
      context.commit(MUTATIONS.SET_EQUIPPED_TACKLE, equipped)
      context.dispatch('saveToLocalStorage')
    },
    setCurrentBait: (context: Ctx, baitId: BaitDef['id']) => {
      if (!BAITS.find((b) => b.id === baitId)) return

      context.commit(MUTATIONS.SET_CURRENT_BAIT, baitId)
      context.dispatch('saveToLocalStorage')
    },
    dropGroundbait: (context: Ctx) => {
      const inv = cloneInventory(normalizeInventory(context.state.inventory))
      if (inv.groundbait <= 0) return

      inv.groundbait -= 1

      const pos = context.state.pos
      const spots = context.state.feedingSpots.slice()
      let found: FeedingSpot | null = null
      for (const spot of spots) {
        if (distance(pos, spot) <= MERGE_RADIUS) {
          found = spot
          break
        }
      }
      if (found) {
        found.level = Math.min(3, (found.level || 1) + 1)
      } else {
        spots.push({ x: pos.x, y: pos.y, level: 1 })
      }
      context.commit(MUTATIONS.SET_FEEDING_SPOTS, spots)
      context.commit(MUTATIONS.SET_INVENTORY, inv)
      context.dispatch('saveToLocalStorage')
    },
    resetGame: (context: Ctx) => {
      const inv = createDefaultInventory()
      const zones = generateZones()
      context.commit(MUTATIONS.SET_POS, { x: 0, y: 0 })
      context.commit(MUTATIONS.SET_ZONES, zones)
      context.commit(MUTATIONS.SET_INVENTORY, inv)
      context.commit(MUTATIONS.SET_BALANCE, INITIAL_BALANCE)
      context.commit(MUTATIONS.SET_FEEDING_SPOTS, [])
      context.commit(MUTATIONS.SET_MARKET_NEARBY, false)
      context.commit(MUTATIONS.SET_CURRENT_BAIT, 'worm')
      context.commit(MUTATIONS.SET_OWNED_TACKLE, [...defaultOwnedTackle])
      context.commit(MUTATIONS.SET_EQUIPPED_TACKLE, { ...defaultEquippedTackle })
      context.dispatch('saveToLocalStorage')
    },
    saveToLocalStorage: (context: Ctx) => {
      localStorage.setItem(lsKey, JSON.stringify({
        version: VERSION,
        pos: context.state.pos,
        inventory: context.state.inventory,
        zones: context.state.zones,
        balance: context.state.balance,
        feedingSpots: context.state.feedingSpots,
        ownedTackleIds: context.state.ownedTackleIds,
        equippedTackle: context.state.equippedTackle,
        currentBaitId: context.state.currentBaitId,
      }))
    },
  },
}
