import { createStore } from 'vuex'
import { generateZonesForChunk, isInsideIsland, getChunkCoords, generateIslandsForChunk, getZoneType, isInMarket, findClosestZone, FishZoneType, generateZone } from './fishZones'
import { GEAR_MAP } from './gear'
import { CONSUMABLES_MAP } from './consumables'
const LS_KEY = 'myGameData'

//mutations
const SET_CHUNK = 'SET_CHUNK'
const REMOVE_CHUNK = 'REMOVE_CHUNK'
const MOVE_BOAT = 'MOVE_BOAT'
const MOVE_BOAT_BY = 'MOVE_BOAT_BY'
const SET_BOAT_POSITION = 'SET_BOAT_POSITION'
const ADD_FISH = 'ADD_FISH'
const REMOVE_FISH = 'REMOVE_FISH'
const SET_BALANCE = 'SET_BALANCE'
const ADD_BALANCE = 'ADD_BALANCE'
const ADD_GEAR = 'ADD_GEAR'
const DELETE_GEAR = 'DELETE_GEAR'
const CHANGE_GEAR = 'CHANGE_GEAR'
const ADD_CONSUMABLE = 'ADD_CONSUMABLE'
const SPEND_CONSUMABLE = 'SPEND_CONSUMABLE'
const SWITCH_BAIT = 'SWITCH_BAIT'
const USE_FEED = 'USE_FEED'
//
const BASE_GEAR = { rod: 'rod1', line: 'line1', reel: 'reel1' }
const BOAT_SPEED = 51
const CHUNK_ACTIVE_RADIUS = 2
const FEED_USE_RANGE = 100


function saveToLS(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state))
}

function loadFromLS() {
  const data = localStorage.getItem(LS_KEY)
  return data
    ? JSON.parse(data)
    : {
      boat: { x: 0, y: 0 },
      chunks: {},
      ownedFish: [],
      ownedGear: BASE_GEAR,
      ownedConsumables: [{ c: CONSUMABLES_MAP.worm, amount: -1 }],
      balance: 0,
      selectedBaitId: 'worm'
    }
}

export default createStore({
  state: loadFromLS(),

  getters: {
    getGearPower(state) {
      let coeff = 1
      for (const id of Object.values(state.ownedGear)) {
        coeff *= GEAR_MAP[id].power
      }
      return coeff
    },
    isInsideIsland(state) {
      const { x, y } = state.boat
      const { cx, cy } = getChunkCoords(x, y)
      const key = `${x},${y}`
      return isInsideIsland(x, y, chunks[key].islands)
    },
    isInMarket(state, getters) {
      return isInMarket(state.boat.x, state.boat.y, getters.getNearbyIslands)
    },

    getNearbyChunks(state) {
      const coords = []
      const { cx, cy } = getChunkCoords(state.boat.x, state.boat.y)
      for (let dx = -CHUNK_ACTIVE_RADIUS; dx <= CHUNK_ACTIVE_RADIUS; dx++) {
        for (let dy = -CHUNK_ACTIVE_RADIUS; dy <= CHUNK_ACTIVE_RADIUS; dy++) {
          const x = cx + dx
          const y = cy + dy
          coords.push({ x, y })
        }
      }
      return coords
    },

    getNearbyChunksKeys(state, getters) {
      const ids = getters.getNearbyChunks
      return ids.flatMap(({ x, y }) => `${x},${y}`)
    },
    getNearbyZones(state, getters) {
      const keys = getters.getNearbyChunksKeys
      const temp = keys.flatMap((key) => state.chunks[key] ? state.chunks[key].zones : [])
      return temp
    },
    getNearbyIslands(state, getters) {
      const keys = getters.getNearbyChunksKeys
      const temp = keys.flatMap((key) => state.chunks[key] ? state.chunks[key].islands : [])/*чертов джаваскрипт*/.filter(Boolean)
      return temp
    },
    getCurrentZoneType(state, getters) {
      return getZoneType(state.boat.x, state.boat.y, getters.getNearbyZones)
    },
    getGearTypes() {
      return [...new Set(Object.values(GEAR_MAP).map((gear) => gear.type))]
    },
    getGearByType(state, getters) {
      const types = getters.getGearTypes
      const result = {}
      types.forEach((type) => {
        result[type] = Object.keys(GEAR_MAP).filter(id => GEAR_MAP[id].type === type && GEAR_MAP[id].price > 0)
      })
      return result
    },
    getOwnedGearPower(state) {
      const result = {}
      for (const type in state.ownedGear) {
        const gearId = state.ownedGear[type]
        result[type] = gearId ? GEAR_MAP[gearId].power : 0
      }
      return result
    },
    getNextGearByType(state) {
      const result = {}

      for (const type in state.ownedGear) {
        const currentId = state.ownedGear[type]
        const current = GEAR_MAP[currentId]

        if (current && current.next) {
          result[type] = current.next
        } else {
          result[type] = null
        }
      }
      return result
    },
    getCurrentGear(state, getters) {
      const types = getters.getGearTypes;
      const result = [];

      for (const type of types) {
        const gearId = state.ownedGear[type];
        if (gearId && GEAR_MAP[gearId]) {
          result.push({ ...GEAR_MAP[gearId], type });
        }
      }
      console.log(result)
      return result;
    },
    getBaitBoost(state) {
      return CONSUMABLES_MAP[state.selectedBaitId].effect.bonusPower
    },
    getFishingPower(state, getters) {
      return getters.getBaitBoost * getters.getGearPower
    },

  },

  mutations: {
    [USE_FEED](state, { zone, feedPower }) {
      if (zone) {
        zone.upgraded += feedPower
        if (zone.upgraded >= 3)
          zone.type = FishZoneType.HIGH
      } else {
        const { cx, cy } = getChunkCoords(state.boat.x, state.boat.y)
        const key = `${cx},${cy}`
        console.log(state.chunks[key].zones)
        state.chunks[key].zones.push(generateZone(state.boat.x, state.boat.y))
      }
    },
    [SPEND_CONSUMABLE](state, index) {
      if (!index) {
        index = state.ownedConsumables.findIndex(ele => ele.c.id === state.selectedBaitId);
      }
      if (index !== -1) {
        const found = state.ownedConsumables[index];
        if (found.amount != -1)
          found.amount -= 1;
        if (found.amount === 0) {
          state.ownedConsumables.splice(index, 1);
        }
      }


    },
    [SWITCH_BAIT](state, index) {
      state.selectedBaitId = state.ownedConsumables[index].c.id
    },
    [ADD_CONSUMABLE](state, c) {
      const found = state.ownedConsumables.find((ele) => ele.c.id == c.id)
      if (found) {
        if (found.amount > 0)
          found.amount += 1
      }
      else {
        state.ownedConsumables.push({
          c: c,
          amount: 1
        })

      }
      console.log(state.ownedConsumables)
    },
    [CHANGE_GEAR](state, type) {
      state.ownedGear[type] = GEAR_MAP[state.ownedGear[type]].next
      //state.ownedGear[type] = GEAR_MAP[state.ownedGear[type].next]
    },
    [REMOVE_FISH](state, index) {
      state.ownedFish.splice(index, 1)

    },
    [ADD_BALANCE](state, amount) {
      state.balance += amount
      saveToLS(state)
    },
    //[ADD_GEAR](state, gear) {
    // },
    [SET_BOAT_POSITION](state, { x, y }) {
      state.boat.x = x
      state.boat.y = y
      saveToLS(state)
    },
    [MOVE_BOAT_BY](state, { dx, dy }) {
      state.boat.x += dx
      state.boat.y += dy
      saveToLS(state)
    },
    [SET_CHUNK](state, { key, chunk }) {
      state.chunks[key] = chunk
      console.log(chunk)
      saveToLS(state)
    },
    [REMOVE_CHUNK](state, key) {
      delete state.chunks[key]
      saveToLS(state)
    },
    [ADD_FISH](state, fish) {
      state.ownedFish.push(fish)
      saveToLS(state)
    }
  },

  actions: {
    moveBoat({ commit, state, getters, dispatch }, direction) {
      let { x, y } = state.boat
      const { cx: ocx, cy: ocy } = getChunkCoords(x, y)

      switch (direction) {
        case 'up': y -= BOAT_SPEED; break
        case 'down': y += BOAT_SPEED; break
        case 'left': x -= BOAT_SPEED; break
        case 'right': x += BOAT_SPEED; break
      }
      if (isInsideIsland(x, y, getters.getNearbyIslands)) return
      commit(SET_BOAT_POSITION, { x, y })
      const { cx: ncx, cy: ncy } = getChunkCoords(x, y)
      if (ocx !== ncx || ocy !== ncy) {
        dispatch('updateChunks')
      }
    },

    updateChunks({ state, commit, getters }) {
      console.log('UPDATE')
      const needed = new Set(getters.getNearbyChunksKeys)
      for (const { x, y } of getters.getNearbyChunks) {
        const key = `${x},${y}`
        if (!state.chunks[key]) {
          const zones = generateZonesForChunk(x, y)
          const islands = generateIslandsForChunk(x, y)
          commit(SET_CHUNK, { key, chunk: { zones, islands } })
        }
      }
      console.log(needed)
      for (const key in state.chunks) {
        if (!needed.has(key)) {
          commit(REMOVE_CHUNK, key)
        }
      }
    },

    addFish({ commit }, fish) {
      commit(ADD_FISH, fish)
    },

    trySellFish({ commit, getters, state }, index) {
      if (!getters.isInMarket) return

      const fish = state.ownedFish[index]
      commit(ADD_BALANCE, fish.price)
      commit(REMOVE_FISH, index)
    },


    tryBuyGear({ commit, state }, gearId) {
      console.log(gearId)
      const wantGear = GEAR_MAP[gearId]
      if (state.balance < wantGear.price) return

      commit(ADD_BALANCE, -wantGear.price)
      commit(CHANGE_GEAR, wantGear.type)
    },
    tryBuyConsumable({ commit, getters, state }, cId) {

      const wantC = CONSUMABLES_MAP[cId]

      if (state.balance < wantC.price) return

      commit(ADD_BALANCE, -wantC.price)
      commit(ADD_CONSUMABLE, wantC)

    },
    switchBait({ commit, state }, c) {
      commit(SWITCH_BAIT, c)
    },
    spendBait({ commit }) {
      commit(SPEND_CONSUMABLE)
    },
    useFeed({ commit, state, getters }) {
      const feedIndex = state.ownedConsumables.findIndex((ele) => ele.c.type == 'feed')
      if (feedIndex === -1) return

      const feedPower = state.ownedConsumables[feedIndex].c.effect.zoneIncreasePower
      let closest = findClosestZone(state.boat.x, state.boat.y, getters.getNearbyZones)
      if (closest.dist > FEED_USE_RANGE) {
        closest.zone = null
      }
      commit(USE_FEED, { zone: closest.zone, feedPower: feedPower })
      commit(SPEND_CONSUMABLE, feedIndex)
    }
  }
})