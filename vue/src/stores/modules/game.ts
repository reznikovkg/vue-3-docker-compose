import { MOVE_BOAT, ADD_FISH_TO_INVENTORY, CLEAR_INVENTORY, SET_BOAT_COORDINATES } from '../mutations-types'

interface Coordinates {
  x: number
  y: number
}

interface Zone {
  x: number
  y: number
  radius: number
}

interface GameState {
  boatCoordinates: Coordinates
  inventory: string[]
  mediumZone: Zone
  highZone: Zone
}

export default {
  namespaced: true,

  state: (): GameState => ({
    boatCoordinates: { x: 0, y: 0 },
    inventory: [],
    mediumZone: { x: 100, y: 100, radius: 50 },
    highZone: { x: -100, y: -100, radius: 30 }
  }),

  getters: {
    getBoatCoordinates: (state: GameState) => state.boatCoordinates,
    
    getInventory: (state: GameState) => state.inventory,
    
    getInventoryCount: (state: GameState) => state.inventory.length,
    
    getMediumZone: (state: GameState) => state.mediumZone,
    
    getHighZone: (state: GameState) => state.highZone,
    
    fishingZone: (state: GameState) => {
      const distanceToMedium = Math.sqrt(
        Math.pow(state.boatCoordinates.x - state.mediumZone.x, 2) +
        Math.pow(state.boatCoordinates.y - state.mediumZone.y, 2)
      )
      if (distanceToMedium <= state.mediumZone.radius) {
        return 'medium'
      }

      const distanceToHigh = Math.sqrt(
        Math.pow(state.boatCoordinates.x - state.highZone.x, 2) +
        Math.pow(state.boatCoordinates.y - state.highZone.y, 2)
      )
      if (distanceToHigh <= state.highZone.radius) {
        return 'high'
      }

      return 'low'
    }
  },

  mutations: {
    [MOVE_BOAT]: (state: GameState, payload: { x: number, y: number }) => {
      state.boatCoordinates.x += payload.x
      state.boatCoordinates.y += payload.y
    },

    [ADD_FISH_TO_INVENTORY]: (state: GameState, payload: string) => {
      state.inventory.push(payload)
    },

    [CLEAR_INVENTORY]: (state: GameState) => {
      state.inventory = []
    },

    [SET_BOAT_COORDINATES]: (state: GameState, payload: Coordinates) => {
      state.boatCoordinates = payload
    }
  },

  actions: {
    runMoveBoat: ({ commit }, payload: { x: number, y: number }) => {
      return new Promise((resolve) => {
        commit(MOVE_BOAT, payload)
        resolve(payload)
      })
    },

    runAddFish: ({ commit }, payload: string) => {
      return new Promise((resolve) => {
        commit(ADD_FISH_TO_INVENTORY, payload)
        resolve(payload)
      })
    },

    runClearInventory: ({ commit }) => {
      return new Promise((resolve) => {
        commit(CLEAR_INVENTORY)
        resolve(true)
      })
    },

    runSetBoatCoordinates: ({ commit }, payload: Coordinates) => {
      return new Promise((resolve) => {
        commit(SET_BOAT_COORDINATES, payload)
        resolve(payload)
      })
    }
  }
}

