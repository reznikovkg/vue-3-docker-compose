import type { CaughtFish, Location, FishingModuleState, InventoryItem, TackleItem, FishForSale, Fish, GroundbaitSpot, GroundbaitType, FishAttraction, NetItem } from '@/types'
import { locations } from '@/data/locations'
import { groundbaitTypes } from '@/data/tackle'

const STORAGE_KEY = 'fishing-game-data'

const saveStateToStorage = (state: FishingModuleState) => {
  const dataToSave = {
    caughtFish: state.caughtFish,
    fishForSale: state.fishForSale,
    money: state.money,
    equippedTackle: state.equippedTackle,
    inventory: state.inventory,
    groundbaitSpots: state.groundbaitSpots,
    availableGroundbaits: state.availableGroundbaits,
    activeGroundbait: state.activeGroundbait,
    equippedNet: state.equippedNet,
    activeNet: state.activeNet
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
}

const loadSavedData = (): Partial<FishingModuleState> => {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved ? JSON.parse(saved) : {}
}

const calculateFishPrice = (fish: CaughtFish): number => {
  let basePrice = 10

  basePrice += (fish.actualStrength || fish.strength) * 5

  if (fish.caughtSize) {
    const sizeMultiplier = {
      'Мелкий': 1,
      'Средний': 1.5,
      'Крупный': 2,
      'Трофейный': 3
    }[fish.caughtSize.name] || 1

    basePrice *= sizeMultiplier
  }

  if (fish.weight) {
    basePrice += Math.floor(fish.weight / 100) * 2
  }

  if (fish.struggles) {
    basePrice += fish.struggles * 3
  }

  if (fish.stamina) {
    basePrice += Math.floor(fish.stamina / 20) * 2
  }

  if (fish.duration) {
    const timeBonus = Math.max(0, 60 - fish.duration) * 0.5
    basePrice += timeBonus
  }

  return Math.max(5, Math.floor(basePrice))
}

const calculateGroundbaitMultiplier = (
  position: { x: number; y: number },
  fishName: string,
  groundbaitSpots: GroundbaitSpot[]
): number => {
  let maxMultiplier = 1.0

  for (const spot of groundbaitSpots) {
    const distance = Math.sqrt(
      Math.pow(position.x - spot.position.x, 2) +
      Math.pow(position.y - spot.position.y, 2)
    )

    if (distance <= spot.radius) {
      const attraction = spot.fishAttraction.find(att => att.fishName === fishName)
      if (attraction) {
        const levelMultiplier = 1 + (spot.level - 1) * 0.2
        const finalMultiplier = attraction.attractionMultiplier * levelMultiplier
        maxMultiplier = Math.max(maxMultiplier, finalMultiplier)
      }
    }
  }

  return maxMultiplier
}

export const fishingModule = {
  namespaced: true,

  state: (): FishingModuleState => {
    const savedData = loadSavedData()

    return {
      caughtFish: savedData.caughtFish || [],
      fishForSale: savedData.fishForSale || [],
      currentLocation: null,
      inventory: savedData.inventory || [
        {
          id: 'rod_basic',
          name: 'Простая удочка',
          type: 'tackle',
          quantity: 1,
          price: 0,
          properties: { strengthBonus: 0, level: 1 }
        },
        {
          id: 'bait_worm',
          name: 'Червяк',
          type: 'bait',
          quantity: 5,
          price: 5,
          properties: { strengthBonus: 1 }
        }
      ],
      equippedTackle: savedData.equippedTackle || {
        rod: {
          id: 'rod_basic',
          name: 'Простая удочка',
          type: 'rod',
          level: 1,
          price: 0,
          strengthBonus: 0,
          description: 'Базовая удочка для начинающих (не ломается)'
        },
        reel: null,
        line: null,
        bait: {
          id: 'bait_worm',
          name: 'Червяк',
          type: 'bait',
          level: 1,
          price: 5,
          strengthBonus: 1,
          description: 'Обычная наживка'
        }
      },
      money: savedData.money || 1000,
      groundbaitSpots: savedData.groundbaitSpots || [],
      availableGroundbaits: savedData.availableGroundbaits || groundbaitTypes,
      activeGroundbait: savedData.activeGroundbait || null,
      equippedNet: savedData.equippedNet || null,
      activeNet: savedData.activeNet || null
    }
  },

  getters: {
    caughtFish: (state: FishingModuleState): CaughtFish[] => state.caughtFish,
    fishForSale: (state: FishingModuleState): FishForSale[] => state.fishForSale,
    currentLocation: (state: FishingModuleState): Location | null => state.currentLocation,
    totalFishCaught: (state: FishingModuleState): number => state.caughtFish.length,
    inventory: (state: FishingModuleState) => state.inventory,
    equippedTackle: (state: FishingModuleState) => state.equippedTackle,
    money: (state: FishingModuleState) => state.money,
    groundbaitSpots: (state: FishingModuleState) => (locationId: number) => {
      return state.groundbaitSpots.filter(spot => spot.locationId === locationId)
    },
    availableGroundbaits: (state: FishingModuleState) => {
      return state.availableGroundbaits
    },
    activeGroundbait: (state: FishingModuleState) => {
      return state.activeGroundbait
    },
    equippedNet: (state: FishingModuleState) => state.equippedNet,
    activeNet: (state: FishingModuleState) => state.activeNet,
    isNetAvailable: (state: FishingModuleState) => {
      return state.equippedNet !== null && state.equippedNet.usesLeft > 0
    },
    canUseNetForFish: (state: FishingModuleState) => (fishWeight?: number) => {
      if (!state.equippedNet || state.equippedNet.usesLeft <= 0) {
        return { canUse: false, reason: 'Сачок недоступен' }
      }

      const result = { canUse: true, reason: 'Можно использовать' }

      if (fishWeight !== undefined) {
        const fishWeightKg = fishWeight / 1000
        const netMaxWeight = state.equippedNet.maxWeight || 3

        if (fishWeightKg > netMaxWeight) {
          result.reason = 'Рыба тяжелее сачка - сачок сломается!'
          result.willBreak = true
        }
      }

      return result
    },
    netInventory: (state: FishingModuleState) => {
      return state.inventory.filter(item => {
        if (item.type !== 'net') return false

        const usesLeft = item.properties?.usesLeft || item.properties?.uses || 0
        const durability = item.properties?.durability || 100

        if (item.properties && item.properties.usesLeft === undefined) {
          item.properties.usesLeft = item.properties.uses || 10
        }

        return true
      })
    },
    getBrokenNets: (state: FishingModuleState) => {
      return state.inventory.filter(item => {
        if (item.type !== 'net') return false

        const usesLeft = item.properties?.usesLeft || item.properties?.uses || 0
        const durability = item.properties?.durability || 100
        const isBroken = item.properties?.isBroken || usesLeft <= 0 || durability <= 0

        return isBroken
      })
    },
    fishByLocation: (state: FishingModuleState): Record<string, CaughtFish[]> => {
      const grouped: Record<string, CaughtFish[]> = {}
      state.caughtFish.forEach((fish: CaughtFish) => {
        if (!grouped[fish.location]) {
          grouped[fish.location] = []
        }
        grouped[fish.location].push(fish)
      })
      return grouped
    },
    availableFishForSale: (state: FishingModuleState): FishForSale[] => {
      return state.fishForSale
    },
    getLocationById: (): ((id: number) => Location | undefined) => (id: number): Location | undefined => {
      return locations.find(loc => loc.id === id)
    },
    totalStrengthBonus: (state: FishingModuleState) => {
      let bonus = 0
      Object.values(state.equippedTackle).forEach(item => {
        if (item) bonus += item.strengthBonus
      })
      return bonus
    },
    fishInventory: (state: FishingModuleState) => {
      return state.fishForSale.map(fish => ({
        id: fish.inventoryId,
        name: fish.name,
        type: 'fish',
        quantity: 1,
        price: fish.price,
        emoji: fish.emoji,
        properties: {
          strength: fish.strength,
          location: fish.location,
          timestamp: fish.timestamp,
          stamina: fish.stamina,
          duration: fish.duration,
          struggles: fish.struggles
        }
      }))
    },
    tackleInventory: (state: FishingModuleState) => {
      return state.inventory.filter(item => item.type === 'tackle' || item.type === 'bait')
    },
    groundbaitInventory: (state: FishingModuleState) => {
      return state.inventory.filter(item => item.type === 'groundbait')
    },
    hasBait: (state: FishingModuleState) => {
      const hasEquippedBait = state.equippedTackle.bait !== null
      const hasBaitInInventory = state.inventory.some(item =>
        item.type === 'bait' && item.quantity > 0
      )
      return hasEquippedBait && hasBaitInInventory
    },
    availableBait: (state: FishingModuleState) => {
      return state.inventory.filter(item => item.type === 'bait' && item.quantity > 0)
    },
    totalFishValue: (state: FishingModuleState) => {
      return state.fishForSale.reduce((total, fish) => total + Math.floor(fish.price * 0.7), 0)
    },
    hasGroundbait: (state: FishingModuleState) => (groundbaitId: string) => {
      return state.inventory.some(item =>
        item.id === groundbaitId && item.type === 'groundbait' && item.quantity > 0
      )
    },
    getFishAttractionMultiplier: (state: FishingModuleState) => ({
      locationId,
      fishName,
      position
    }: {
      locationId: number,
      fishName: string,
      position: { x: number, y: number }
    }) => {
      const spots = state.groundbaitSpots.filter(spot =>
        spot.locationId === locationId && spot.currentUses > 0
      )

      if (spots.length === 0) return 1.0

      return calculateGroundbaitMultiplier(position, fishName, spots)
    },
    isPositionInGroundbaitSpot: (state: FishingModuleState) => ({
      locationId,
      position
    }: {
      locationId: number,
      position: { x: number, y: number }
    }) => {
      const spots = state.groundbaitSpots.filter(spot =>
        spot.locationId === locationId && spot.currentUses > 0
      )

      for (const spot of spots) {
        const distance = Math.sqrt(
          Math.pow(position.x - spot.position.x, 2) +
          Math.pow(position.y - spot.position.y, 2)
        )

        if (distance <= spot.radius) {
          return {
            isInside: true,
            spot,
            distance
          }
        }
      }

      return {
        isInside: false,
        spot: null,
        distance: 0
      }
    },
    fishingStatistics: (state: FishingModuleState) => {
      const stats = {
        totalCaught: state.caughtFish.length,
        totalWeight: state.caughtFish.reduce((sum, fish) => sum + (fish.weight || 0), 0),
        averageStrength: 0,
        totalStruggles: state.caughtFish.reduce((sum, fish) => sum + (fish.struggles || 0), 0),
        totalDuration: state.caughtFish.reduce((sum, fish) => sum + (fish.duration || 0), 0),
        byLocation: {} as Record<string, number>,
        bySize: {
          'Мелкий': 0,
          'Средний': 0,
          'Крупный': 0,
          'Трофейный': 0
        }
      }

      if (state.caughtFish.length > 0) {
        stats.averageStrength = state.caughtFish.reduce((sum, fish) => sum + fish.strength, 0) / state.caughtFish.length
      }

      state.caughtFish.forEach(fish => {
        stats.byLocation[fish.location] = (stats.byLocation[fish.location] || 0) + 1
      })

      state.caughtFish.forEach(fish => {
        if (fish.caughtSize?.name) {
          stats.bySize[fish.caughtSize.name] = (stats.bySize[fish.caughtSize.name] || 0) + 1
        }
      })

      return stats
    },
    groundbaitStatistics: (state: FishingModuleState) => {
      const stats = {
        totalSpotsCreated: state.groundbaitSpots.length,
        activeSpots: state.groundbaitSpots.filter(spot => spot.currentUses > 0).length,
        byType: {} as Record<string, number>,
        totalUses: 0,
        maxLevelReached: 0
      }

      state.groundbaitSpots.forEach(spot => {
        const typeName = spot.groundbaitType.name
        stats.byType[typeName] = (stats.byType[typeName] || 0) + 1
        stats.totalUses += (spot.groundbaitType.maxUses - spot.currentUses)
        stats.maxLevelReached = Math.max(stats.maxLevelReached, spot.level)
      })

      return stats
    }
  },

  mutations: {
    ADD_FISH_TO_HISTORY: (state: FishingModuleState, fish: CaughtFish): void => {
      state.caughtFish.unshift(fish)
    },
    ADD_FISH_FOR_SALE: (state: FishingModuleState, fish: FishForSale): void => {
      state.fishForSale.push(fish)
    },
    REMOVE_FISH_FOR_SALE: (state: FishingModuleState, inventoryId: string): void => {
      state.fishForSale = state.fishForSale.filter(fish => fish.inventoryId !== inventoryId)
    },
    CLEAR_FISH_FOR_SALE: (state: FishingModuleState): void => {
      state.fishForSale = []
    },
    SET_CURRENT_LOCATION: (state: FishingModuleState, location: Location): void => {
      state.currentLocation = location
    },
    UPDATE_MONEY: (state: FishingModuleState, amount: number): void => {
      state.money = Math.max(0, state.money + amount)
    },
    ADD_TO_INVENTORY: (state: FishingModuleState, item: InventoryItem): void => {
      const existingItem = state.inventory.find(i => i.id === item.id)
      if (existingItem) {
        existingItem.quantity += item.quantity
      } else {
        state.inventory.push({ ...item })
      }
    },
    REMOVE_FROM_INVENTORY: (state: FishingModuleState, payload: { itemId: string; quantity?: number }): void => {
      const { itemId, quantity = 1 } = payload
      const itemIndex = state.inventory.findIndex(item => item.id === itemId)

      if (itemIndex !== -1) {
        if (state.inventory[itemIndex].quantity > quantity) {
          state.inventory[itemIndex].quantity -= quantity
        } else {
          state.inventory.splice(itemIndex, 1)
        }
      }
    },
    EQUIP_TACKLE: (state: FishingModuleState, payload: { type: string; item: TackleItem }): void => {
      const { type, item } = payload
      if (type in state.equippedTackle) {
        state.equippedTackle[type as keyof typeof state.equippedTackle] = item
      }
    },
    UNEQUIP_TACKLE: (state: FishingModuleState, type: string): void => {
      if (type in state.equippedTackle) {
        state.equippedTackle[type as keyof typeof state.equippedTackle] = null
      }
    },
    REMOVE_BROKEN_ROD: (state: FishingModuleState, rodId: string): void => {
      state.inventory = state.inventory.filter(item => item.id !== rodId)

      if (state.equippedTackle.rod?.id === rodId) {
        state.equippedTackle.rod = {
          id: 'rod_basic',
          name: 'Простая удочка',
          type: 'rod',
          level: 1,
          price: 0,
          strengthBonus: 0,
          description: 'Базовая удочка для начинающих (не ломается)'
        }

        const hasBasicRod = state.inventory.some(item => item.id === 'rod_basic')
        if (!hasBasicRod) {
          state.inventory.push({
            id: 'rod_basic',
            name: 'Простая удочка',
            type: 'tackle',
            quantity: 1,
            price: 0,
            properties: { strengthBonus: 0, level: 1 }
          })
        }
      }
    },
    ADD_GROUNDBAIT_SPOT: (state: FishingModuleState, spot: GroundbaitSpot): void => {
      state.groundbaitSpots.push(spot)
    },
    UPDATE_GROUNDBAIT_SPOT: (state: FishingModuleState, { spotId, updates }: { spotId: string; updates: Partial<GroundbaitSpot> }): void => {
      const spotIndex = state.groundbaitSpots.findIndex(spot => spot.id === spotId)
      if (spotIndex !== -1) {
        state.groundbaitSpots[spotIndex] = { ...state.groundbaitSpots[spotIndex], ...updates }
      }
    },
    REMOVE_GROUNDBAIT_SPOT: (state: FishingModuleState, spotId: string): void => {
      state.groundbaitSpots = state.groundbaitSpots.filter(spot => spot.id !== spotId)
    },
    CLEAR_GROUNDBAIT_SPOTS: (state: FishingModuleState): void => {
      state.groundbaitSpots = []
    },
    SET_ACTIVE_GROUNDBAIT: (state: FishingModuleState, groundbait: GroundbaitType | null): void => {
      state.activeGroundbait = groundbait
    },
    DECREASE_GROUNDBAIT_USES: (state: FishingModuleState, { spotId, locationId }: { spotId: string; locationId: number }): void => {
      const spot = state.groundbaitSpots.find(s => s.id === spotId && s.locationId === locationId)
      if (spot && spot.currentUses > 0) {
        spot.currentUses--
        if (spot.currentUses <= 0) {
          state.groundbaitSpots = state.groundbaitSpots.filter(s => s.id !== spotId)
        }
      }
    },
    ADD_AVAILABLE_GROUNDBAIT: (state: FishingModuleState, groundbait: GroundbaitType): void => {
      const existingIndex = state.availableGroundbaits.findIndex(gb => gb.id === groundbait.id)

      if (existingIndex === -1) {
        state.availableGroundbaits.push(groundbait)
      } else {
        state.availableGroundbaits[existingIndex] = groundbait
      }
    },
    REMOVE_BROKEN_NET: (state: FishingModuleState, netId: string): void => {
      state.inventory = state.inventory.filter(item => item.id !== netId)

      if (state.equippedNet?.id === netId) {
        state.equippedNet = null
      }
    },
    REMOVE_BROKEN_NET_FROM_INVENTORY: (state: FishingModuleState, netId: string): void => {
      state.inventory = state.inventory.filter(item => item.id !== netId)

      if (state.equippedNet?.id === netId) {
        state.equippedNet = null
      }
    },
    EQUIP_NET: (state: FishingModuleState, net: NetItem): void => {
      state.equippedNet = net
    },
    UNEQUIP_NET: (state: FishingModuleState): void => {
      state.equippedNet = null
    },
    ACTIVATE_NET: (state: FishingModuleState): void => {
      state.activeNet = state.equippedNet
    },
    DEACTIVATE_NET: (state: FishingModuleState): void => {
      state.activeNet = null
    },
    USE_NET: (state: FishingModuleState): void => {
      if (state.equippedNet && state.equippedNet.usesLeft > 0) {
        state.equippedNet.usesLeft -= 1

        const netInInventory = state.inventory.find(item => item.id === state.equippedNet!.id)
        if (netInInventory && netInInventory.properties) {
          netInInventory.properties.usesLeft = state.equippedNet.usesLeft
        }
      }
    },
    BREAK_NET: (state: FishingModuleState): void => {
      if (state.equippedNet) {
        state.equippedNet.durability = 0
        state.equippedNet.usesLeft = 0

        const netInInventory = state.inventory.find(item => item.id === state.equippedNet!.id)
        if (netInInventory && netInInventory.properties) {
          netInInventory.properties.durability = 0
          netInInventory.properties.usesLeft = 0
          netInInventory.properties.isBroken = true
        }
      }
    },
    REPAIR_NET: (state: FishingModuleState, payload: { netId: string; durability: number; usesLeft: number }): void => {
      const { netId, durability, usesLeft } = payload

      if (state.equippedNet && state.equippedNet.id === netId) {
        state.equippedNet.durability = durability
        state.equippedNet.usesLeft = usesLeft
        state.equippedNet.isBroken = false
      }

      const netInInventory = state.inventory.find(item => item.id === netId)
      if (netInInventory && netInInventory.properties) {
        netInInventory.properties.durability = durability
        netInInventory.properties.usesLeft = usesLeft
        netInInventory.properties.isBroken = false
      }
    },
    RESET_GAME_DATA: (state: FishingModuleState): void => {
      state.caughtFish = []
      state.fishForSale = []
      state.inventory = [
        {
          id: 'rod_basic',
          name: 'Простая удочка',
          type: 'tackle',
          quantity: 1,
          price: 0,
          properties: { strengthBonus: 0, level: 1 }
        },
        {
          id: 'bait_worm',
          name: 'Червяк',
          type: 'bait',
          quantity: 5,
          price: 5,
          properties: { strengthBonus: 1 }
        }
      ]
      state.equippedTackle = {
        rod: {
          id: 'rod_basic',
          name: 'Простая удочка',
          type: 'rod',
          level: 1,
          price: 0,
          strengthBonus: 0,
          description: 'Базовая удочка для начинающих (не ломается)'
        },
        reel: null,
        line: null,
        bait: {
          id: 'bait_worm',
          name: 'Червяк',
          type: 'bait',
          level: 1,
          price: 5,
          strengthBonus: 1,
          description: 'Обычная наживка'
        }
      }
      state.money = 1000
      state.groundbaitSpots = []
      state.availableGroundbaits = groundbaitTypes
      state.activeGroundbait = null
      state.equippedNet = null
      state.activeNet = null
    }
  },

  actions: {
    removeBrokenNet({ commit, dispatch }: any, netId: string) {
      return new Promise((resolve) => {
        commit('REMOVE_BROKEN_NET', netId)
        dispatch('saveGameState')
        resolve({ success: true, message: 'Сломанный сачок удален' })
      })
    },
    removeBrokenNetFromInventory({ commit, dispatch }: any, netId: string) {
      return new Promise((resolve) => {
        commit('REMOVE_BROKEN_NET_FROM_INVENTORY', netId)
        dispatch('saveGameState')
        resolve({ success: true, message: 'Сломанный сачок удален' })
      })
    },
    saveGameState({ state }: any): void {
      saveStateToStorage(state)
    },
    addFishToHistory({ commit, dispatch }: any, fish: CaughtFish): void {
      commit('ADD_FISH_TO_HISTORY', fish)
      dispatch('saveGameState')
    },
    addCaughtFish({ commit, dispatch }: any, fish: CaughtFish) {
      return new Promise((resolve) => {
        const fishForSale: FishForSale = {
          ...fish,
          price: calculateFishPrice(fish),
          inventoryId: `fish_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }

        commit('ADD_FISH_FOR_SALE', fishForSale)
        commit('ADD_FISH_TO_HISTORY', fish)
        dispatch('saveGameState')
        resolve({ success: true, message: 'Рыба добавлена в инвентарь' })
      })
    },
    addFishForSale({ commit, dispatch }: any, fish: FishForSale): void {
      commit('ADD_FISH_FOR_SALE', fish)
      dispatch('saveGameState')
    },
    removeFishFromSale({ commit, dispatch }: any, inventoryId: string): void {
      commit('REMOVE_FISH_FOR_SALE', inventoryId)
      dispatch('saveGameState')
    },
    clearFishForSale({ commit, dispatch }: any): void {
      commit('CLEAR_FISH_FOR_SALE')
      dispatch('saveGameState')
    },
    setCurrentLocation({ commit, dispatch }: any, location: Location): void {
      commit('SET_CURRENT_LOCATION', location)
      dispatch('saveGameState')
    },
    updateMoney({ commit, dispatch }: any, amount: number): void {
      commit('UPDATE_MONEY', amount)
      dispatch('saveGameState')
    },
    addToInventory({ commit, dispatch }: any, item: InventoryItem): void {
      commit('ADD_TO_INVENTORY', item)
      dispatch('saveGameState')
    },
    removeFromInventory({ commit, dispatch }: any, payload: { itemId: string; quantity?: number }): void {
      commit('REMOVE_FROM_INVENTORY', payload)
      dispatch('saveGameState')
    },
    removeBrokenRod({ commit, dispatch }: any, rodId: string): void {
      commit('REMOVE_BROKEN_ROD', rodId)
      dispatch('saveGameState')
    },
    equipTackle({ commit, state, dispatch }: any, { type, itemId }: { type: string; itemId: string }) {
      return new Promise((resolve) => {
        const itemInInventory = state.inventory.find(item =>
          item.id === itemId && (item.type === 'tackle' || item.type === 'bait')
        )

        if (!itemInInventory) {
          resolve({ success: false, message: 'Предмет не найден в инвентаре' })
          return
        }
        const tackleItem: TackleItem = {
          id: itemInInventory.id,
          name: itemInInventory.name,
          type: type as 'rod' | 'reel' | 'line' | 'bait',
          level: itemInInventory.properties?.level || 1,
          price: itemInInventory.price,
          strengthBonus: itemInInventory.properties?.strengthBonus || 0,
          description: itemInInventory.properties?.description || 'Снасть для рыбалки'
        }
        commit('EQUIP_TACKLE', { type, item: tackleItem })
        dispatch('saveGameState')
        resolve({ success: true, message: `${tackleItem.name} экипирована!` })
      })
    },
    unequipTackle({ commit, dispatch }: any, type: string) {
      return new Promise((resolve) => {
        commit('UNEQUIP_TACKLE', type)
        dispatch('saveGameState')
        resolve({ success: true, message: 'Снасть снята' })
      })
    },
    unequipNet({ commit, dispatch }: any) {
      return new Promise((resolve) => {
        commit('UNEQUIP_NET')
        dispatch('saveGameState')
        resolve({ success: true, message: 'Сачок снят' })
      })
    },
    useBait({ commit, state, dispatch }: any): boolean {
      const currentBait = state.equippedTackle.bait
      if (currentBait) {
        const baitInInventory = state.inventory.find(item => item.id === currentBait.id)
        if (baitInInventory && baitInInventory.quantity > 0) {
          dispatch('removeFromInventory', { itemId: currentBait.id, quantity: 1 })
          return true
        } else {
          commit('UNEQUIP_TACKLE', 'bait')
          dispatch('saveGameState')
          return false
        }
      }
      return false
    },
    sellAllFish({ commit, state, dispatch }: any) {
      return new Promise((resolve) => {
        const totalAmount = state.fishForSale.reduce((total, fish) => {
          return total + Math.floor(fish.price * 0.7)
        }, 0)

        commit('CLEAR_FISH_FOR_SALE')
        commit('UPDATE_MONEY', totalAmount)
        dispatch('saveGameState')
        resolve(totalAmount)
      })
    },
    useGroundbait({ commit, state, dispatch }: any, {
      locationId,
      groundbaitId,
      position
    }: {
      locationId: number,
      groundbaitId: string,
      position: { x: number, y: number }
    }) {
      return new Promise((resolve) => {
        const groundbait = state.availableGroundbaits.find((gb: GroundbaitType) => gb.id === groundbaitId)

        if (!groundbait) {
          resolve({ success: false, message: 'Прикормка не найдена' })
          return
        }

        const groundbaitInInventory = state.inventory.find((item: InventoryItem) =>
          item.id === groundbaitId && item.type === 'groundbait' && item.quantity > 0
        )

        if (!groundbaitInInventory) {
          resolve({ success: false, message: 'Прикормка отсутствует в инвентаре' })
          return
        }

        const existingSpot = state.groundbaitSpots.find((spot: GroundbaitSpot) =>
          spot.locationId === locationId
        )

        if (existingSpot) {
          if (existingSpot.groundbaitType.id === groundbaitId) {
            if (existingSpot.level < existingSpot.groundbaitType.maxLevel) {
              const newRadius = existingSpot.radius * 1.2
              const newLevel = existingSpot.level + 1

              const updatedFishAttraction = groundbait.fishAttraction.map(att => ({
                ...att,
                attractionMultiplier: att.attractionMultiplier * (1 + (newLevel - 1) * 0.1)
              }))

              commit('UPDATE_GROUNDBAIT_SPOT', {
                spotId: existingSpot.id,
                updates: {
                  position,
                  radius: Math.min(newRadius, 50),
                  level: newLevel,
                  currentUses: groundbait.uses,
                  fishAttraction: updatedFishAttraction
                }
              })

              dispatch('removeFromInventory', { itemId: groundbaitId, quantity: 1 })
              dispatch('saveGameState')

              resolve({
                success: true,
                message: `Прикормка усилена до уровня ${newLevel}! Радиус увеличен до ${Math.round(newRadius)}%`,
                spot: {
                  ...existingSpot,
                  position,
                  radius: Math.min(newRadius, 50),
                  level: newLevel,
                  currentUses: groundbait.uses,
                  fishAttraction: updatedFishAttraction
                }
              })
            } else {
              resolve({
                success: false,
                message: 'Максимальный уровень прикормки достигнут (5)'
              })
            }
          } else {
            commit('REMOVE_GROUNDBAIT_SPOT', existingSpot.id)

            const newSpot: GroundbaitSpot = {
              id: `groundbait_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              locationId,
              groundbaitType: groundbait,
              position,
              radius: groundbait.radius,
              currentUses: groundbait.uses,
              level: 1,
              createdAt: Date.now(),
              fishAttraction: groundbait.fishAttraction
            }

            commit('ADD_GROUNDBAIT_SPOT', newSpot)
            dispatch('removeFromInventory', { itemId: groundbaitId, quantity: 1 })
            dispatch('saveGameState')

            resolve({
              success: true,
              message: `Прикормка "${groundbait.name}" заброшена!`,
              spot: newSpot
            })
          }
        } else {
          const newSpot: GroundbaitSpot = {
            id: `groundbait_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            locationId,
            groundbaitType: groundbait,
            position,
            radius: groundbait.radius,
            currentUses: groundbait.uses,
            level: 1,
            createdAt: Date.now(),
            fishAttraction: groundbait.fishAttraction
          }

          commit('ADD_GROUNDBAIT_SPOT', newSpot)
          dispatch('removeFromInventory', { itemId: groundbaitId, quantity: 1 })
          dispatch('saveGameState')

          resolve({
            success: true,
            message: `Прикормка "${groundbait.name}" заброшена!`,
            spot: newSpot
          })
        }
      })
    },
    decreaseGroundbaitUses({ commit, dispatch }: any, { spotId, locationId }: { spotId: string; locationId: number }) {
      commit('DECREASE_GROUNDBAIT_USES', { spotId, locationId })
      dispatch('saveGameState')
    },
    setActiveGroundbait({ commit, dispatch }: any, groundbait: GroundbaitType | null) {
      commit('SET_ACTIVE_GROUNDBAIT', groundbait)
      dispatch('saveGameState')
    },
    addAvailableGroundbait({ commit, dispatch }: any, groundbait: GroundbaitType) {
      commit('ADD_AVAILABLE_GROUNDBAIT', groundbait)
      dispatch('saveGameState')
    },
    clearGroundbaitSpots({ commit, dispatch }: any) {
      commit('CLEAR_GROUNDBAIT_SPOTS')
      dispatch('saveGameState')
    },
    onFishCaught({ state, dispatch }: any, { locationId, position }: { locationId: number, position: { x: number, y: number } }) {
      const groundbaitInfo = state.groundbaitSpots.find((spot: GroundbaitSpot) => {
        if (spot.locationId !== locationId) return false

        const distance = Math.sqrt(
          Math.pow(position.x - spot.position.x, 2) +
          Math.pow(position.y - spot.position.y, 2)
        )

        return distance <= spot.radius
      })

      if (groundbaitInfo) {
        dispatch('decreaseGroundbaitUses', {
          spotId: groundbaitInfo.id,
          locationId
        })
      }
    },
    equipNet({ commit, state, dispatch }: any, netId: string) {
      return new Promise((resolve) => {
        const netInInventory = state.inventory.find((item: InventoryItem) =>
          item.id === netId && item.type === 'net'
        )

        if (!netInInventory) {
          resolve({ success: false, message: 'Сачок не найден в инвентаре' })
          return
        }

        const netItem: NetItem = {
          id: netInInventory.id,
          name: netInInventory.name,
          type: 'net',
          level: netInInventory.properties?.level || 1,
          price: netInInventory.price,
          strengthBonus: netInInventory.properties?.strengthBonus || 0,
          description: netInInventory.description || 'Сачок для вылова рыбы',
          maxWeight: netInInventory.properties?.maxWeight || 3,
          durability: netInInventory.properties?.durability || 100,
          usesLeft: netInInventory.properties?.usesLeft || netInInventory.properties?.uses || 10,
          maxUses: netInInventory.properties?.uses || 10,
          isActive: false
        }

        commit('EQUIP_NET', netItem)
        dispatch('saveGameState')
        resolve({ success: true, message: `Сачок "${netItem.name}" экипирован!` })
      })
    },
    useNet({ commit, state, dispatch }: any, fishWeight?: number) {
      return new Promise((resolve) => {
        if (!state.equippedNet || state.equippedNet.usesLeft <= 0) {
          resolve({ success: false, message: 'Сачок недоступен' })
          return
        }

        if (fishWeight !== undefined) {
          const fishWeightKg = fishWeight / 1000
          const netMaxWeight = state.equippedNet.maxWeight || 3

          if (fishWeightKg > netMaxWeight) {
            commit('BREAK_NET')
            dispatch('saveGameState')
            resolve({
              success: false,
              message: `Сачок сломался! Рыба слишком тяжелая (${fishWeightKg.toFixed(1)}кг > ${netMaxWeight}кг)`,
              netBroken: true,
              fishTooHeavy: true,
              usesLeft: 0
            })
            return
          }
        }

        commit('USE_NET')
        dispatch('saveGameState')
        resolve({
          success: true,
          message: 'Рыба выловлена сачком!',
          usesLeft: state.equippedNet.usesLeft
        })
      })
    },
    breakNet({ commit, state, dispatch }: any, netId?: string) {
      const netToBreak = netId || state.equippedNet?.id

      if (!netToBreak) {
        return
      }

      const netInInventory = state.inventory.find(item => item.id === netToBreak)

      if (netInInventory && netInInventory.properties) {
        netInInventory.properties.durability = 0
        netInInventory.properties.usesLeft = 0
        netInInventory.properties.isBroken = true
      }

      if (state.equippedNet && state.equippedNet.id === netToBreak) {
        state.equippedNet.durability = 0
        state.equippedNet.usesLeft = 0
        state.equippedNet.isBroken = true
      }

      dispatch('saveGameState')

      setTimeout(() => {
        dispatch('removeBrokenNet', netToBreak)
      }, 5000)
    },
    repairNet({ commit, dispatch }: any, payload: { netId: string; durability: number; usesLeft: number }) {
      commit('REPAIR_NET', payload)
      dispatch('saveGameState')
    },
    resetGameData({ commit, dispatch }: any): void {
      commit('RESET_GAME_DATA')
      dispatch('saveGameState')
    },
    canStartFishing({ state }: any): boolean {
      return state.equippedTackle.bait !== null &&
        state.inventory.some(item => item.id === state.equippedTackle.bait?.id && item.quantity > 0)
    }
  }
}