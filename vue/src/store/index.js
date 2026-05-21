import { createStore } from 'vuex'
import { FISH_TYPES, TACKLE_TYPES, BAIT_TYPES } from '../config/types.js'
import { findAreaIndex, getRandomInt, getRandomOffset, normalize } from '../utils/functions.js'

const MUTATIONS = {
  MOVE: 'MOVE',
  SET_DIRECTION: 'SET_DIRECTION',
  SET_MOVING: 'SET_MOVING',
  SET_FISHING: 'SET_FISHING',
  SET_GAMING: 'SET_GAMING',
  SET_HOOKED: 'SET_HOOKED',
  SET_BROKEN: 'SET_BROKEN',
  SET_FIGHTING: 'SET_FIGHTING',
  SET_SHOPPING: 'SET_SHOPPING',
  SET_STOPPED: 'SET_STOPPED',
  SET_CURRENT_FISH: 'SET_CURRENT_FISH',
  ADD_CURRENT_FISH: 'ADD_CURRENT_FISH',
  SET_FISH_SKIPPED: 'SET_FISH_SKIPPED',
  SET_TIME_INTERVAL: 'SET_TIME_INTERVAL',
  SET_PIRATES_INTERVAL: 'SET_PIRATES_INTERVAL',
  CHANGE_FISH_SKIPPED: 'CHANGE_FISH_SKIPPED',
  CLEAR_INVENTORY_FISH: 'CLEAR_INVENTORY_FISH',
  SET_ACTIVE_TACKLE: 'SET_ACTIVE_TACKLE',
  SET_TACKLE_OWNED: 'SET_TACKLE_OWNED',
  CLEAR_INVENTORY_TACKLE: 'CLEAR_INVENTORY_TACKLE',
  SET_ACTIVE_BAIT: 'SET_ACTIVE_BAIT',
  CHANGE_BAIT_COUNT: 'CHANGE_BAIT_COUNT',
  TICK_TIME: 'TICK_TIME',
  TOGGLE_NIGHT: 'TOGGLE_NIGHT',
  CLEAR_TIME_INTERVAL: 'CLEAR_TIME_INTERVAL',
  CLEAR_PIRATES_INTERVAL: 'CLEAR_PIRATES_INTERVAL',
  CHANGE_BALANCE: 'CHANGE_BALANCE',
  START_AREA: 'START_AREA',
  RELOCATE_AREA: 'RELOCATE_AREA',
  MOVE_PIRATE: 'MOVE_PIRATE',
  SET_PIRATE_SPEED: 'SET_PIRATE_SPEED',
  SET_PIRATE_MOVING: 'SET_PIRATE_MOVING',
  SET_PIRATE_FIGHTING: 'SET_PIRATE_FIGHTING',
  ADD_PIRATE: 'ADD_PIRATE',
  REMOVE_PIRATE: 'REMOVE_PIRATE'
}

export default createStore({
  state () {
    return {
      boat: {
        x: 0,
        y: 0,
        speed: 6,
        direction: 1,
        isMoving: false,
        isFishing: false,
        isGaming: false,
        isHooked: false,
        isBroken: false,
        isFighting: false,
        isShopping: false,
        isStopped: false
      },
      currentFish: null,
      fishSkipped: 0,
      inventory: {
        fishes: [],
        tackles: TACKLE_TYPES.map(tackle => ({
          ...tackle,
          isActive: tackle.level === 1,
          isOwned: tackle.level === 1
        })),
        baits: BAIT_TYPES.map((bait, index) => ({
          ...bait,
          isActive: index === 0,
          count: index === 0 ? 10 : 0
        }))
      },
      time: 360,
      timeInterval: null,
      piratesInterval: null,
      balance: 0,
      areas: [],
      pirates: [],
      isNight: false
    }
  },
  getters: {
    getBoat: (state) => state.boat,
    getIsMoving: (state) => state.boat.isMoving,
    getIsFishing: (state) => state.boat.isFishing,
    getIsGaming: (state) => state.boat.isGaming,
    getIsHooked: (state) => state.boat.isHooked,
    getIsBroken: (state) => state.boat.isBroken,
    getIsFighting: (state) => state.boat.isFighting,
    getIsShopping: (state) => state.boat.isShopping,
    getIsStopped: (state) => state.boat.isStopped,
    getIsNight: (state) => state.isNight,
    getCurrentFish: (state) => state.currentFish,
    getFishSkipped: (state) => state.fishSkipped,
    getLengthInventoryFish: (state) => state.inventory.fishes.length,
    getVisibleFish: (state) => state.inventory.fishes.slice(-state.fishSkipped - 3, -state.fishSkipped || undefined).reverse(),
    getTotalPriceFish: (state) => {
      let totalPrice = 0
      state.inventory.fishes.forEach(fish => totalPrice += fish.price)
      return totalPrice
    },
    getInventoryTackle: (state) => state.inventory.tackles,
    getActiveTacklesInfo: (state) => {
      const activeTackles = state.inventory.tackles.filter(tackle => tackle.isActive)
      let totalLevel = 1
      if(activeTackles.length === 3) {
        activeTackles.forEach(tackle => totalLevel *= tackle.level)
      }
      else {
        totalLevel = 0
      }
      return {
        activeTackles: activeTackles,
        totalLevel: totalLevel
      }
    },
    getFeedInfo: (state) => {
      const index = state.inventory.baits.findIndex(bait => bait.type === 'feeding')
      return {
        feed: state.inventory.baits[index],
        index: index
      }
    },
    getInventoryBait: (state) => state.inventory.baits,
    getActiveBaitInfo: (state) => {
      const index = state.inventory.baits.findIndex(bait => bait.isActive)
      return {
        bait: state.inventory.baits[index],
        index: index
      }
    },
    getTime: (state) => {
      const time = state.time
      let hours = Math.floor(time / 60), minutes = time % 60
      hours = hours < 10 ? '0' + hours : hours
      minutes = minutes < 10 ? '0' + minutes : minutes
      return hours + ':' + minutes
    },
    getBalance: (state) => state.balance,
    getAreas: (state) => state.areas,
    getCurrentAreaInfo: (state) => {
      const index = findAreaIndex(state.boat.x, state.boat.y, state.areas, '', true)
      if(index !== -1) {
        return {
          area: state.areas[index],
          index: index
        }
      }
      return null
    },
    getPirates: (state) => state.pirates
  },
  mutations: {
    [MUTATIONS.MOVE]: (state, payload) => {
      const {px, py} = payload
      state.boat.x += state.boat.speed * px
      state.boat.y += state.boat.speed * py
      if(px > 0) {
        state.boat.direction = 1
      }
      else if(px < 0) {
        state.boat.direction = -1
      }
    },
    [MUTATIONS.SET_DIRECTION]: (state, value) => {
      state.boat.direction = value
    },
    [MUTATIONS.SET_MOVING]: (state, value) => {
      state.boat.isMoving = value
    },
    [MUTATIONS.SET_FISHING]: (state) => {
      state.boat.isFishing = !state.boat.isFishing
    },
    [MUTATIONS.SET_GAMING]: (state, value) => {
      state.boat.isGaming = value
    },
    [MUTATIONS.SET_HOOKED]: (state) => {
      state.boat.isHooked = !state.boat.isHooked
    },
    [MUTATIONS.SET_BROKEN]: (state) => {
      state.boat.isBroken = !state.boat.isBroken
    },
    [MUTATIONS.SET_FIGHTING]: (state, value) => {
      state.boat.isFighting = value
    },
    [MUTATIONS.SET_SHOPPING]: (state) => {
      state.boat.isShopping = !state.boat.isShopping
    },
    [MUTATIONS.SET_STOPPED]: (state, value) => {
      state.boat.isStopped = value
    },
    [MUTATIONS.SET_CURRENT_FISH]: (state, payload) => {
      state.currentFish = payload
    },
    [MUTATIONS.ADD_CURRENT_FISH]: (state) => {
      state.inventory.fishes.push(state.currentFish)
      state.currentFish = null
    },
    [MUTATIONS.SET_FISH_SKIPPED]: (state, value) => {
      state.fishSkipped = value
    },
    [MUTATIONS.CHANGE_FISH_SKIPPED]: (state, value) => {
      state.fishSkipped += value
    },
    [MUTATIONS.CLEAR_INVENTORY_FISH]: (state) => {
      state.inventory.fishes = []
    },
    [MUTATIONS.SET_ACTIVE_TACKLE]: (state, payload) => {
      const {oldIndex, newIndex} = payload
      if(oldIndex !== -1) {
        state.inventory.tackles[oldIndex].isActive = false
      }
      state.inventory.tackles[newIndex].isActive = true
    },
    [MUTATIONS.SET_TACKLE_OWNED]: (state, payload) => {
      const {index, buy} = payload
      if(!buy) {
        state.inventory.tackles[index].isActive = buy
      }
      state.inventory.tackles[index].isOwned = buy
    },
    [MUTATIONS.CLEAR_INVENTORY_TACKLE]: (state) => {
      state.inventory.tackles.forEach(tackle => {
        if(tackle.isActive) {
          tackle.isActive = false
          tackle.isOwned = false
        }
      })
    },
    [MUTATIONS.SET_ACTIVE_BAIT]: (state, payload) => {
      const {oldIndex, newIndex} = payload
      state.inventory.baits[oldIndex].isActive = false
      state.inventory.baits[newIndex].isActive = true
    },
    [MUTATIONS.CHANGE_BAIT_COUNT]: (state, payload) => {
      const {index, count} = payload
      state.inventory.baits[index].count += count
    },
    [MUTATIONS.TICK_TIME]: (state) => {
      if(state.time + 1 >= 1440) {
        state.time = 0
      }
      else {
        state.time += 1
      }
    },
    [MUTATIONS.TOGGLE_NIGHT]: (state) => {
      state.isNight = !state.isNight
      state.boat.speed = state.isNight ? 4 : 6
    },
    [MUTATIONS.SET_TIME_INTERVAL]: (state, value) => {
      state.timeInterval = value
    },
    [MUTATIONS.SET_PIRATES_INTERVAL]: (state, value) => {
      state.piratesInterval = value
    },
    [MUTATIONS.CLEAR_TIME_INTERVAL]: (state) => {
      clearInterval(state.timeInterval)
    },
    [MUTATIONS.CLEAR_PIRATES_INTERVAL]: (state) => {
      clearInterval(state.piratesInterval)
    },
    [MUTATIONS.CHANGE_BALANCE]: (state, value) => {
      state.balance += value
    },
    [MUTATIONS.START_AREA]: (state, areas) => {
      state.areas = areas
    },
    [MUTATIONS.RELOCATE_AREA]: (state, payload) => {
      const {index, px, py} = payload
      state.areas[index].x = px
      state.areas[index].y = py
    },
    [MUTATIONS.MOVE_PIRATE]: (state, payload) => {
      const {index, px, py} = payload
      state.pirates[index].x += state.pirates[index].speed * px
      state.pirates[index].y += state.pirates[index].speed * py
      if(px > 0) {
        state.pirates[index].direction = 1
      }
      else if(px < 0) {
        state.pirates[index].direction = -1
      }
    },
    [MUTATIONS.SET_PIRATE_SPEED]: (state, payload) => {
      const {index, value} = payload
      state.pirates[index].speed = value
    },
    [MUTATIONS.SET_PIRATE_MOVING]: (state, payload) => {
      const {index, value} = payload
      state.pirates[index].isMoving = value
    },
    [MUTATIONS.SET_PIRATE_FIGHTING]: (state, payload) => {
      const {index, value} = payload
      state.pirates[index].isFighting = value
    },
    [MUTATIONS.ADD_PIRATE]: (state, payload) => {
      const {px, py, speed, direction, isMoving, isFighting} = payload
      const newPirates = [...state.pirates]
      newPirates.push({
        x: px,
        y: py,
        speed: speed,
        direction: direction,
        isMoving: isMoving,
        isFighting: isFighting
      })
      state.pirates = newPirates
    },
    [MUTATIONS.REMOVE_PIRATE]: (state, value) => {
      const newPirates = [...state.pirates]
      newPirates.splice(value, 1)
      state.pirates = newPirates
    }
  },
  actions: {
    move: (store, payload) => {
      const {px, py} = payload, next = {
        x: store.state.boat.x + store.state.boat.speed * px,
        y: store.state.boat.y + store.state.boat.speed * py
      }
      let index = findAreaIndex(next.x, next.y, store.state.areas, 'island', false)
      if(index === -1) {
        store.commit(MUTATIONS.MOVE, payload)
        store.commit(MUTATIONS.SET_MOVING, true)
      }
      else {
        if(px !== 0) {
          index = findAreaIndex(next.x, store.state.boat.y, store.state.areas, 'island', false)
        }
        if(index === -1) {
          store.commit(MUTATIONS.MOVE, {px: px, py: 0})
          store.commit(MUTATIONS.SET_MOVING, true)
        }
        else {
          if(py !== 0) {
            index = findAreaIndex(store.state.boat.x, next.y, store.state.areas, 'island', false)
          }
          if(index === -1) {
            store.commit(MUTATIONS.MOVE, {px: 0, py: py})
            store.commit(MUTATIONS.SET_MOVING, true)
          }
          else {
            store.commit(MUTATIONS.SET_MOVING, false)
          }
        }
      }
    },
    setMoving: (store, value) => {
      store.commit(MUTATIONS.SET_MOVING, value)
    },
    setFishing: (store) => {
      store.commit(MUTATIONS.SET_FISHING)
    },
    setGaming: (store, value) => {
      store.commit(MUTATIONS.SET_GAMING, value)
    },
    setHooked: (store) => {
      store.commit(MUTATIONS.SET_HOOKED)
    },
    setBroken: (store) => {
      store.commit(MUTATIONS.SET_BROKEN)
    },
    setFighting: (store, value) => {
      store.commit(MUTATIONS.SET_FIGHTING, value)
    },
    setShopping: (store) => {
      store.commit(MUTATIONS.SET_SHOPPING)
    },
    fightResult: (store, value) => {
      if(value === 3) {
        store.commit(MUTATIONS.CHANGE_BAIT_COUNT, {
          index: 0,
          count: 1
        })
      }
      else if(value < 3) {
        store.commit(MUTATIONS.CHANGE_BALANCE, -store.state.balance)
        if(value < 2) {
          store.commit(MUTATIONS.CLEAR_INVENTORY_TACKLE)
          if(value < 1) {
            store.commit(MUTATIONS.SET_FISH_SKIPPED, 0)
            store.commit(MUTATIONS.CLEAR_INVENTORY_FISH)
          }
        }
      }
    },
    setCurrentFish: (store) => {
      store.commit(MUTATIONS.CHANGE_BAIT_COUNT, {
        index: store.getters.getActiveBaitInfo.index,
        count: -1
      })
      const type = FISH_TYPES[getRandomInt(0, store.getters.getActiveBaitInfo.bait.level)]
      let weight = getRandomInt(type.minWeight, type.maxWeight)
      if(store.state.isNight) {
        weight *= 2
      }
      store.commit(MUTATIONS.SET_CURRENT_FISH, {
        name: type.name,
        image: type.image,
        weight: weight,
        price: weight * type.pricePerKg
      })
    },
    addCurrentFish: (store) => {
      store.commit(MUTATIONS.ADD_CURRENT_FISH)
    },
    changeFishSkipped: (store, value) => {
      store.commit(MUTATIONS.CHANGE_FISH_SKIPPED, value)
    },
    sellAllFish: (store) => {
      store.commit(MUTATIONS.CHANGE_BALANCE, store.getters.getTotalPriceFish)
      store.commit(MUTATIONS.SET_FISH_SKIPPED, 0)
      store.commit(MUTATIONS.CLEAR_INVENTORY_FISH)
    },
    equipTackle: (store, value) => {
      const tackles = store.state.inventory.tackles
      store.commit(MUTATIONS.SET_ACTIVE_TACKLE, {
        oldIndex: tackles.findIndex(tackle => (tackle.type === tackles[value].type && tackle.isActive)),
        newIndex: value
      })
    },
    tradeTackle: (store, payload) => {
      const {index, buy} = payload
      if(buy) {
        store.commit(MUTATIONS.CHANGE_BALANCE, -store.state.inventory.tackles[index].price)
      }
      else {
        store.commit(MUTATIONS.CHANGE_BALANCE, store.state.inventory.tackles[index].price / 2)
      }
      store.commit(MUTATIONS.SET_TACKLE_OWNED, {
        index: index,
        buy: buy
      })
    },
    changeFeedCount: (store, count) => {
      store.commit(MUTATIONS.CHANGE_BAIT_COUNT, {
        index: store.getters.getFeedInfo.index,
        count: count
      })
    },
    setActiveBait: (store, index) => {
      const activeIndex = store.getters.getActiveBaitInfo.index
      if(index !== activeIndex) {
        store.commit(MUTATIONS.SET_ACTIVE_BAIT, {
          oldIndex: activeIndex,
          newIndex: index
        })
      }
    },
    tradeBait: (store, payload) => {
      const {index, count} = payload
      if(count < 0) {
        store.commit(MUTATIONS.CHANGE_BALANCE, -store.state.inventory.baits[index].price * count / 2)
      }
      else {
        store.commit(MUTATIONS.CHANGE_BALANCE, -store.state.inventory.baits[index].price * count)
      }
      store.commit(MUTATIONS.CHANGE_BAIT_COUNT, {
        index: index,
        count: count
      })
    },
    clearIntervals: (store) => {
      store.commit(MUTATIONS.CLEAR_TIME_INTERVAL)
      store.commit(MUTATIONS.CLEAR_PIRATES_INTERVAL)
    },
    startTickTime: (store) => {
      if(store.state.timeInterval) {
        store.commit(MUTATIONS.CLEAR_TIME_INTERVAL)
      }
      store.commit(MUTATIONS.SET_TIME_INTERVAL,
        setInterval(() => {
          store.commit(MUTATIONS.TICK_TIME)
          const hours = Math.floor(store.state.time / 60)
          if((hours > 21 || hours < 6) !== store.state.isNight) {
            store.commit(MUTATIONS.TOGGLE_NIGHT)
          }
        }, 1000)
      )
    },
    startArea: (store) => {
      const areas = [], coords = []
      for(let i = 0; i < 3; ++i) {
        const c = getRandomOffset(750, 2500)
        coords.push({
          x: c.x,
          y: c.y
        })
        areas.push({
          x: coords[i].x,
          y: coords[i].y,
          type: 'island',
          radius: 350
        })
      }
      for(let i = 0; i < 3; ++i) {
        areas.push({
          x: coords[i].x,
          y: coords[i].y,
          type: 'shallow',
          radius: 500
        })
      }
      for(let i = 0; i < 50; ++i) {
        areas.push({
          x: getRandomInt(-2500, 2500),
          y: getRandomInt(-2500, 2500),
          type: 'high',
          radius: 100
        })
      }
      for(let i = 0; i < 25; ++i) {
        areas.push({
          x: getRandomInt(-2500, 2500),
          y: getRandomInt(-2500, 2500),
          type: 'medium',
          radius: 250
        })
      }
      store.commit(MUTATIONS.START_AREA, areas)
    },
    relocateCurrentArea: (store) => {
      if(store.getters.getCurrentAreaInfo) {
        const offset = getRandomOffset(1000, 2500)
        store.commit(MUTATIONS.RELOCATE_AREA, {
          index: store.getters.getCurrentAreaInfo.index,
          px: store.state.boat.x + offset.x,
          py: store.state.boat.y + offset.y
        })
      }
    },
    relocateDistantAreas: (store) => {
      store.state.areas.forEach((area, index) => {
        if(Math.abs(area.x - store.state.boat.x) > 2500 || Math.abs(area.y - store.state.boat.y) > 2500) {
          const offset = getRandomOffset(1000, 2500)
          store.commit(MUTATIONS.RELOCATE_AREA, {
            index: index,
            px: store.state.boat.x + offset.x,
            py: store.state.boat.y + offset.y
          })
          if(area.type === 'island' || area.type === 'shallow') {
            const i = area.type === 'island' ? 3 : -3
            store.commit(MUTATIONS.RELOCATE_AREA, {
              index: index + i,
              px: store.state.boat.x + offset.x,
              py: store.state.boat.y + offset.y
            })
          }
        }
      })
    },
    relocateMaxDistanceAreaToBoat: (store, type) => {
      let maxDistance = -1, maxDistanceIndex = -1
      store.state.areas.forEach((area, index) => {
        if(area.type === type) {
          const distance = Math.max(Math.abs(area.x - store.state.boat.x), Math.abs(area.y - store.state.boat.y))
          if(distance > maxDistance) {
            maxDistance = distance
            maxDistanceIndex = index
          }
        }
      })
      store.commit(MUTATIONS.RELOCATE_AREA, {
        index: maxDistanceIndex,
        px: store.state.boat.x,
        py: store.state.boat.y
      })
    },
    startAddPirates: (store) => {
      if(store.state.piratesInterval) {
        store.commit(MUTATIONS.CLEAR_PIRATES_INTERVAL)
      }
      store.commit(MUTATIONS.SET_PIRATES_INTERVAL,
        setInterval(() => {
          const piratesCount = store.state.pirates.length
          if(piratesCount < 1 || (piratesCount < (store.state.isNight ? 5 : 3) && Math.random() < 0.25)) {
            const offset = getRandomOffset(3000, 4000)
            store.commit(MUTATIONS.ADD_PIRATE, {
              px: store.state.boat.x + offset.x,
              py: store.state.boat.y + offset.y,
              speed: 2,
              direction: -normalize(offset.x, -1),
              isMoving: true,
              isFighting: false
            })
          }
        }, 1000)
      )
    },
    movePirates: (store) => {
      const piratesToRemove = []
      store.state.pirates.forEach((pirate, index) => {
        if(!pirate.isFighting) {
          const dx = store.state.boat.x - pirate.x, dy = store.state.boat.y - pirate.y, distance = Math.sqrt(dx * dx + dy * dy)
          if(distance > 600 || store.state.boat.isFighting) {
            if(pirate.speed !== 2) {
              store.commit(MUTATIONS.SET_PIRATE_SPEED, {
                index: index,
                value: 2
              })
            }
            store.commit(MUTATIONS.MOVE_PIRATE, {
              index: index,
              px: pirate.direction,
              py: 0
            })
          }
          else if(distance > 200) {
            if(pirate.speed !== 4) {
              store.commit(MUTATIONS.SET_PIRATE_SPEED, {
                index: index,
                value: 4
              })
            }
            store.commit(MUTATIONS.MOVE_PIRATE, {
              index: index,
              px: normalize(dx, 0),
              py: normalize(dy, 0)
            })
          }
          else {
            if(pirate.isMoving) {
              store.commit(MUTATIONS.SET_PIRATE_MOVING, {
                index: index,
                value: false
              })
            }
            if(!store.state.boat.isFishing && !store.state.boat.isHooked && !store.state.boat.isBroken && !store.state.boat.isShopping) {
              store.commit(MUTATIONS.SET_FIGHTING, true)
              store.commit(MUTATIONS.SET_DIRECTION, -pirate.direction)
              store.commit(MUTATIONS.SET_PIRATE_FIGHTING, {
                index: index,
                value: true
              })
              store.commit(MUTATIONS.SET_STOPPED, false)
            }
            else {
              store.commit(MUTATIONS.SET_STOPPED, true)
            }
          }
          if(findAreaIndex(pirate.x, pirate.y, store.state.areas, 'island', false) !== -1 || distance > 5000) {
            piratesToRemove.push(index)
          }
        }
        else if(!store.state.boat.isFighting) {
          piratesToRemove.push(index)
        }
      })
      piratesToRemove.reverse().forEach(index => {
        store.commit(MUTATIONS.REMOVE_PIRATE, index)
      })
    }
  }
})
