import tacklesList from './tacklesList'

const MUTATIONS = {
  MOVE_BOAT: 'MOVE_BOAT',
  SET_DIRECTION: 'SET_DIRECTION',
  SET_ROWING: 'SET_ROWING',
  FISHING: 'FISHING',
  ADD_FISH: 'ADD_FISH',
  GENERATE_ZONES: 'GENERATE_ZONES',
  SAVE: 'SAVE',
  REMOVE_ZONE: 'REMOVE_ZONE',
  BUY_TACKLE: 'BUY_TACKLE',
  SELL_TACKLE: 'SELL_TACKLE',
  SELL_FISH: 'SELL_FISH',
  CHANGE_BALANCE: 'CHANGE_BALANCE',
  BUY_BAIT: 'BUY_BAIT',
  USE_TACKLE: 'USE_TACKLE',
  USE_GROUNDBAIT: 'USE_GROUNDBAIT',
  USE_BAIT: 'USE_BAIT',
  SET_ACTIVE_BAIT: 'SET_ACTIVE_BAIT'
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
  tacklesOwned: {
    rods: [0],
    reels: [0],
    bobbers: [0],
    hooks: [0],
    lines: [0]
  },
  baits: {
    worms: 0,
    corn: 0,
    maggots: 0,
    groundbait: 0
  },
  activeBait: 'worms',
  isFishing: false,
  zones: [],
  islands: [{ x: 500, y: 500 }, { x: -1500, y: -500 }, { x: 2500, y: -750 }, { x: -100, y: 1750 }]
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
    getTacklesOwned: (state) => state.tacklesOwned,
    getBaits: (state) => state.baits,
    getActiveBait: (state) => state.activeBait,
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
      return Math.round(power * 100) / 100
    },
    getIsFishing: (state) => state.isFishing,
    getZones: (state) => state.zones, 
    getIslands: (state) => state.islands,
    getCurrentZone: (state) => {
      const boat = state.boat

      for (const zone of state.zones) {
        if (zone.type === 'high') {
          if (boat.x >= zone.x - 60 && boat.x <= zone.x + 60 && boat.y >= zone.y - 60 && boat.y <= zone.y + 60) 
            return 'Высокий'
        }
      }

      for (const zone of state.zones) {
        if (zone.type === 'medium') {
          if (boat.x >= zone.x - 80 && boat.x <= zone.x + 80 && boat.y >= zone.y - 80 && boat.y <= zone.y + 80) 
            return 'Средний'
        }
      }

      return 'Обычный'
    }
  },
  mutations: {
    [MUTATIONS.MOVE_BOAT]: (state, payload) => {
      const {x, y} = payload
      const speed = 10

      const nextX = state.boat.x + x * speed
      const nextY = state.boat.y + y * speed

      const islandHitbox = 90

      const isCollision = state.islands.some(island => {
        const dx = nextX - island.x
        const dy = nextY - island.y
        return Math.max(Math.abs(dx), Math.abs(dy)) < islandHitbox 
      })

      if (!isCollision) {
        state.boat.x = nextX
        state.boat.y = nextY
      }
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
      state.zones = state.zones.filter(zone => !(zone.x - 80 <= boat.x && zone.x + 80 >= boat.x && zone.y - 80 <= boat.y && zone.y + 80 >= boat.y))
    },
    [MUTATIONS.SELL_FISH]: (state, type) => {
      if (state.inventory[type] > 0) {
        state.inventory[type]--
      }
    },
    [MUTATIONS.BUY_BAIT]: (state, type) => {
      state.baits[type]++
    },
    [MUTATIONS.CHANGE_BALANCE]: (state, diff) => {
      if (state.balance + diff >= 0) 
        state.balance += diff 
    },
    [MUTATIONS.BUY_TACKLE]: (state, item) => {
      const {type, id} = item
      if (!state.tacklesOwned[type].includes(id)) {
        state.tacklesOwned[type].push(id)
      }
    },
    [MUTATIONS.SELL_TACKLE]: (state, item) => {
      const {type, id} = item
      if (id === 0) return

      state.tacklesOwned[type] = state.tacklesOwned[type].filter(i => i !== id)

      if (state.tackles[type.slice(0, -1)] === id) {
        state.tackles[type.slice(0, -1)] = 0
      }
    },
    [MUTATIONS.USE_TACKLE]: (state, item) => {
      const {type, id} = item
      state.tackles[type.slice(0, -1)] = id
    },
    [MUTATIONS.USE_GROUNDBAIT]: (state) => {
      const {x, y} = state.boat
      const radius = 80

      let zones = state.zones.filter(z => {
        const dx = x - z.x
        const dy = y - z.y
        return Math.max(Math.abs(dx), Math.abs(dy)) < radius
      })

      if (zones.length > 0) {
        zones.forEach(zone => {
          zone.level = zone.level + 1

          if (zone.level >= 3) {
            zone.type = 'high'
          }
        })
      } else {
        state.zones.push({
          type: 'medium',
          level: 1,
          x: x, y: y
        })
      }

      state.baits.groundbait--
    },
    [MUTATIONS.USE_BAIT]: (state) => {
      if (state.baits[state.activeBait] > 0) {
        state.baits[state.activeBait]--
      }
    },
    [MUTATIONS.SET_ACTIVE_BAIT]: (state, bait) => {
      state.activeBait = bait
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
        const x = Math.round(Math.random() * 500 - 250) * 10 + bx
        const y = Math.round(Math.random() * 500 - 250) * 10 + by
        zones.push({
          type: 'medium',
          level: 1,
          x: x, y: y
        })
      }

      for (let i = 0; i < 100; i++) {
        const x = Math.round(Math.random() * 500 - 250) * 10 + bx
        const y = Math.round(Math.random() * 500 - 250) * 10 + by
        zones.push({
          type: 'high',
          level: 3,
          x: x, y: y
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
    },
    sellFish: (store, payload) => {
      const {type, price} = payload
      if (store.state.inventory[type] > 0) {
        store.commit('SELL_FISH', type)
        store.commit('CHANGE_BALANCE', price)
        store.dispatch('save')
      }
    },
    buyBait: (store, payload) => {
      const {type, price} = payload
      if (store.state.balance - price >= 0) {
        store.commit('BUY_BAIT', type)
        store.commit('CHANGE_BALANCE', -price)
        store.dispatch('save')
      }
    },
    buyTackle: (store, payload) => {
      const {type, item} = payload
      if (store.state.balance < item.price) return

      if (!store.state.tacklesOwned[type].includes(item.id)) {
        store.commit('BUY_TACKLE', {type: type, id: item.id})
        store.commit('CHANGE_BALANCE', -item.price)
        store.dispatch('save')
      }
    },
    sellTackle: (store, payload) => {
      const {type, item} = payload
      if (item.id === 0) return

      if (store.state.tacklesOwned[type].includes(item.id)) {
        store.commit('SELL_TACKLE', {type: type, id: item.id})
        store.commit('CHANGE_BALANCE', +Math.round(item.price / 2))
        store.dispatch('save')
      }
    },
    useTackle: (store, payload) => {
      const {type, item} = payload
      
      if (store.state.tacklesOwned[type].includes(item.id)) {
        store.commit('USE_TACKLE', {type: type, id: item.id})
        store.dispatch('save')
      }
    },
    useGroundbait: (store) => {
      if (store.state.baits.groundbait <= 0) return

      store.commit('USE_GROUNDBAIT')
      store.dispatch('save')
    },
    setActiveBait: (store, bait) => {
      store.commit('SET_ACTIVE_BAIT', bait)
      store.dispatch('save')
    },
    useBait: (store, bait) => {
      store.commit('USE_BAIT', bait)
      store.dispatch('save')
    }
  },
  modules: {
    tacklesList
  }
}