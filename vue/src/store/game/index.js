const MUTATIONS = {
  MOVE_BOAT: 'MOVE_BOAT',
  SET_DIRECTION: 'SET_DIRECTION',
  SET_ROWING: 'SET_ROWING',
  START_FISHING: 'START_FISHING',
  STOP_FISHING: 'STOP_FISHING',
  ADD_FISH: 'ADD_FISH',
  GENERATE_ZONES: 'GENERATE_ZONES'
}

const defaultState = {
  boat: {
    x: 0,
    y: 0,
    direction: 1,
    rowing: false
  },
  inventory: {
    common: 0,
    rare: 0, 
    legendary: 0
  },
  isFishing: false,
  zones: []
}

export default {
  namespaced: true,
  state () {
    return defaultState
  },
  getters: {
    getBoat: (state) => state.boat,
    getInventory: (state) => state.inventory,
    getIsFishing: (state) => state.isFishing,
    getZones: (state) => state.zones, 
    getCurrentZone: (state) => {
      const boat = state.boat

      for (const zone of state.zones) {
        if (zone.type === 'high') {
          if (boat.x >= zone.x - 10 && boat.x <= zone.x + 10 && boat.y >= zone.y - 10 && boat.y <= zone.y + 10) 
            return 'Высокий'
        }
      }

      for (const zone of state.zones) {
        if (zone.type === 'medium') {
          if (boat.x >= zone.x - 25 && boat.x <= zone.x + 25 && boat.y >= zone.y - 25 && boat.y <= zone.y + 25) 
            return 'Средний'
        }
      }

      return 'Обычный'
    }
  },
  mutations: {
    [MUTATIONS.MOVE_BOAT]: (state, payload) => {
      const {x, y} = payload
      state.boat.x += x
      state.boat.y += y
    },
    [MUTATIONS.SET_DIRECTION]: (state, direction) => {
      state.boat.direction = direction
    },
    [MUTATIONS.START_FISHING]: (state) => {
      state.isFishing = true
    },
    [MUTATIONS.STOP_FISHING]: (state) => {
      state.isFishing = false
    },
    [MUTATIONS.ADD_FISH]: (state, type) => {
      if (state.inventory[type] !== undefined)
        state.inventory[type] += 1
    },
    [MUTATIONS.SET_ROWING]: (state, value) => {
      state.boat.rowing = value
    },
    [MUTATIONS.GENERATE_ZONES]: (state, zones) => {
      state.zones = zones 
    }
  },
  actions: {
    moveBoat: (store, payload) => {
      store.commit(MUTATIONS.MOVE_BOAT, payload)
    },
    setDirection: (store, direction) => {
      store.commit(MUTATIONS.SET_DIRECTION, direction)
    },
    setRowing: (store, value) => {
      store.commit(MUTATIONS.SET_ROWING, value)
    },
    startFishing: (store) => {
      store.commit(MUTATIONS.START_FISHING)
    },
    stopFishing: (store) => {
      store.commit(MUTATIONS.STOP_FISHING)
    },
    addFish: (store, type) => {
      store.commit(MUTATIONS.ADD_FISH, type)
    },
    generateZones: (store) => {
      const zones = []

      for (let i = 0; i < 500; i++) {
        const x = Math.floor(Math.random() * 2500 - 1250)
        const y = Math.floor(Math.random() * 2500 - 1250)
        zones.push({
          type: 'medium',
          x, y
        })
      }

      for (let i = 0; i < 100; i++) {
        const x = Math.floor(Math.random() * 2500 - 1250)
        const y = Math.floor(Math.random() * 2500 - 1250)
        zones.push({
          type: 'high',
          x, y
        })
      }
      
      store.commit(MUTATIONS.GENERATE_ZONES, zones)
    }
  }
}