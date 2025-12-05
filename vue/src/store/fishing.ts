import type { CaughtFish, Location, FishingModuleState, InventoryItem, TackleItem, FishForSale, Fish } from '@/types'
import { locations } from '@/data/locations'

const STORAGE_KEY = 'fishing-game-data'

const saveStateToStorage = (state: FishingModuleState) => {
  const dataToSave = {
    caughtFish: state.caughtFish,
    fishForSale: state.fishForSale,
    money: state.money,
    equippedTackle: state.equippedTackle,
    inventory: state.inventory
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

  return Math.max(5, Math.floor(basePrice))
}

export const fishingModule = {
  namespaced: true,

  state: (): FishingModuleState => ({
    caughtFish: loadSavedData().caughtFish || [],
    fishForSale: loadSavedData().fishForSale || [],
    currentLocation: null,
    inventory: loadSavedData().inventory || [
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
    equippedTackle: loadSavedData().equippedTackle || {
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
    money: loadSavedData().money || 1000
  }),

  getters: {
    caughtFish: (state: FishingModuleState): CaughtFish[] => state.caughtFish,
    fishForSale: (state: FishingModuleState): FishForSale[] => state.fishForSale,
    currentLocation: (state: FishingModuleState): Location | null => state.currentLocation,
    totalFishCaught: (state: FishingModuleState): number => state.caughtFish.length,
    inventory: (state: FishingModuleState) => state.inventory,
    equippedTackle: (state: FishingModuleState) => state.equippedTackle,
    money: (state: FishingModuleState) => state.money,

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
          timestamp: fish.timestamp
        }
      }))
    },

    tackleInventory: (state: FishingModuleState) => {
      return state.inventory.filter(item => item.type === 'tackle' || item.type === 'bait')
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
    }
  },

  actions: {
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

    setCurrentLocation({ commit }: any, location: Location): void {
      commit('SET_CURRENT_LOCATION', location)
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