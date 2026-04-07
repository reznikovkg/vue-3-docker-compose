import tacklesList from './tacklesList'

const MUTATIONS = {
  MOVE_BOAT: 'MOVE_BOAT',
  SET_DIRECTION: 'SET_DIRECTION',
  SET_ROWING: 'SET_ROWING',
  FISHING: 'FISHING',
  ADD_FISH: 'ADD_FISH',
  GENERATE_ZONES: 'GENERATE_ZONES',
  SAVE: 'SAVE',
  REMOVE_ZONE: 'REMOVE_ZONE'
}

const defaultState = {
  boat: {
    x: 0,
    y: 0,
    direction: 1,
    rowing: false
  },
  balance: 1000,
  inventory: {
    common: 0,
    rare: 0, 
    legendary: 0
  },
  tackles: {
    rod: 0,
    reel: 0,
    bobber: 0,
    hook: 0,
    line: 0
  },
  tackles_owned: {
    rods: {
      a: true, 
      b: false,
      c: false
    },
    reel: {
      a: true, 
      b: false,
      c: false
    },
    bobber: {
      a: true, 
      b: false,
      c: false
    },
    hook: {
      a: true, 
      b: false,
      c: false
    },
    line: {
      a: true, 
      b: false,
      c: false
    }
  },
  hookbaits: {
    worms: 0,
    corn: 0,
    maggots: 0
  },
  groundbait: 0,
  isFishing: false,
  zones: []
}

export default {
  namespaced: true,
  state () {
    const savedState = localStorage.getItem('game_state')
    return (savedState !== null) ? JSON.parse(savedState) : defaultState
  },
  getters: {
    getBoat: (state) => state.boat,
    getBalance: (state) => state.balance,
    getInventory: (state) => state.inventory,
    getTackles: (state) => state.tackles,
    getTacklesOwned: (state) => state.tackles_owned,
    getHookbaits: (state) => state.hookbaits,
    getGroundbait: (state) => state.groundbait,
    getPower: (state, getters, rootState) => {
      const t = state.tackles
      const list = rootState.game.tacklesList
      const power = (
        list.rods[t.rod].power * 
        list.reels[t.reel].power * 
        list.bobbers[t.bobber].power *
        list.hooks[t.hook].power *
        list.lines[t.line].power
      )
      return power
    },
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
    [MUTATIONS.FISHING]: (state) => {
      state.isFishing = !state.isFishing
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
    },
    [MUTATIONS.REMOVE_ZONE]: (state) => {
      const boat = state.boat
      state.zones = state.zones.filter(zone => !(zone.x - 25 <= boat.x && zone.x + 25 >= boat.x && zone.y - 25 <= boat.y && zone.y + 25 >= boat.y))
    }
  },
  actions: {
    moveBoat: (store, payload) => {
      store.commit(MUTATIONS.MOVE_BOAT, payload)
      store.dispatch('save')
    },
    setDirection: (store, direction) => {
      store.commit(MUTATIONS.SET_DIRECTION, direction)
      store.dispatch('save')
    },
    setRowing: (store, value) => {
      store.commit(MUTATIONS.SET_ROWING, value)
      store.dispatch('save')
    },
    fishing: (store) => {
      store.commit(MUTATIONS.FISHING)
      store.dispatch('save')
    },
    addFish: (store, type) => {
      store.commit(MUTATIONS.ADD_FISH, type)
      store.dispatch('save')
    },
    generateZones: (store) => {
      const zones = []
      
      const {x: bx, y: by} = store.state.boat

      for (let i = 0; i < 500; i++) {
        const x = Math.floor(Math.random() * 2500 - 1250) + bx
        const y = Math.floor(Math.random() * 2500 - 1250) + by
        zones.push({
          type: 'medium',
          x, y
        })
      }

      for (let i = 0; i < 100; i++) {
        const x = Math.floor(Math.random() * 2500 - 1250) + bx
        const y = Math.floor(Math.random() * 2500 - 1250) + by
        zones.push({
          type: 'high',
          x, y
        })
      }
      
      store.commit(MUTATIONS.GENERATE_ZONES, zones)
      store.dispatch('save')
    },
    save: (store) => {
      localStorage.setItem('game_state', JSON.stringify(store.state))
    },
    removeZone: (store) => {
      store.commit(MUTATIONS.REMOVE_ZONE);
      store.dispatch('save')
    }
  },
  modules: {
    tacklesList
  }
}