import { createStore } from 'vuex'
import greenFish from '../assets/images/fish/green.png'
import blueFish from '../assets/images/fish/blue.png'
import redFish from '../assets/images/fish/red.png'
import worm from '../assets/images/bait/worm.png'
import caterpillar from '../assets/images/bait/caterpillar.png'
import crab from '../assets/images/bait/crab.png'
import feed from '../assets/images/bait/feed.png'

const MUTATIONS = {
  MOVE: 'MOVE',
  SET_MOVING: 'SET_MOVING',
  SET_FISHING: 'SET_FISHING',
  SET_GAMING: 'SET_GAMING',
  SET_HOOKED: 'SET_HOOKED',
  SET_BROKEN: 'SET_BROKEN',
  SET_CURRENT_FISH: 'SET_CURRENT_FISH',
  ADD_CURRENT_FISH: 'ADD_CURRENT_FISH',
  USE_FEED: 'USE_FEED',
  SET_ACTIVE_BAIT: 'SET_ACTIVE_BAIT',
  USE_ACTIVE_BAIT: 'USE_ACTIVE_BAIT',
  START_AREA: 'START_AREA',
  RELOCATE_AREA: 'RELOCATE_AREA',
  SET_SHOPPING: 'SET_SHOPPING'
}

const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const offsets = (minDist, maxDist) => {
  let x, y
  do {
    x = randomInt(-maxDist, maxDist)
    y = randomInt(-maxDist, maxDist)
  } while(Math.abs(x) < minDist && Math.abs(y) < minDist)
  return {x: x, y: y}
}

const findAreaIndex = (x, y, areas, type, allTypes) => {
  return areas.findIndex(area => {
    if(area.type === type || allTypes) {
      const dx = x - area.x, dy = y - area.y
      return (dx * dx + dy * dy <= area.radius * area.radius)
    }
    return false
  })
}

export default createStore({
  state () {
    return {
      boat: {
        x: 0,
        y: 0,
        speed: 4,
        direction: 1
      },
      fishTypes: [
        {name: 'green fish', image: greenFish, minWeight: 8, maxWeight: 12, pricePerKg: 1},
        {name: 'blue fish', image: blueFish, minWeight: 15, maxWeight: 25, pricePerKg: 2},
        {name: 'red fish', image: redFish, minWeight: 30, maxWeight: 50, pricePerKg: 3},
      ],
      currentFish: null,
      inventory: {
        fishes: [],
        baits: [
          {name: 'worm', image: worm, count: 1, level: 0, price: 10, isActive: true, type: 'fishing'},
          {name: 'caterpillar', image: caterpillar, count: 0, level: 1, price: 20, isActive: false, type: 'fishing'},
          {name: 'crab', image: crab, count: 0, level: 2, price: 40, isActive: false, type: 'fishing'},
          {name: 'feed', image: feed, count: 0, level: 0, price: 5, isActive: false, type: 'feeding'}
        ]
      },
      areas: [],
      isMoving: false,
      isFishing: false,
      isGaming: false,
      isHooked: false,
      isBroken: false,
      isShopping: false
    }
  },
  getters: {
    getBoat: (state) => state.boat,
    getIsMoving: (state) => state.isMoving,
    getIsFishing: (state) => state.isFishing,
    getIsGaming: (state) => state.isGaming,
    getIsHooked: (state) => state.isHooked,
    getIsBroken: (state) => state.isBroken,
    getCurrentFish: (state) => state.currentFish,
    getInventoryFish: (state) => state.inventory.fishes,
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
    getIsShopping: (state) => state.isShopping
  },
  mutations: {
    [MUTATIONS.MOVE]: (state, payload) => {
      const {px, py} = payload
      state.boat.x += state.boat.speed * px
      state.boat.y += state.boat.speed * py
      if(px > 0)
        state.boat.direction = 1
      else if(px < 0)
        state.boat.direction = -1
    },
    [MUTATIONS.SET_MOVING]: (state, value) => {
      state.isMoving = value
    },
    [MUTATIONS.SET_FISHING]: (state) => {
      state.isFishing = !state.isFishing
    },
    [MUTATIONS.SET_GAMING]: (state, value) => {
      state.isGaming = value
    },
    [MUTATIONS.SET_HOOKED]: (state) => {
      state.isHooked = !state.isHooked
    },
    [MUTATIONS.SET_BROKEN]: (state) => {
      state.isBroken = !state.isBroken
    },
    [MUTATIONS.SET_CURRENT_FISH]: (state, payload) => {
      state.currentFish = payload
    },
    [MUTATIONS.ADD_CURRENT_FISH]: (state) => {
      state.inventory.fishes.push(state.currentFish)
      state.currentFish = null
    },
    [MUTATIONS.USE_FEED]: (state, payload) => {
      const {index, count} = payload
      state.inventory.baits[index].count -= count
    },
    [MUTATIONS.SET_ACTIVE_BAIT]: (state, payload) => {
      const {oldIndex, newIndex} = payload
      state.inventory.baits[oldIndex].isActive = false
      state.inventory.baits[newIndex].isActive = true
    },
    [MUTATIONS.USE_ACTIVE_BAIT]: (state, value) => {
      state.inventory.baits[value].count--
    },
    [MUTATIONS.START_AREA]: (state, areas) => {
      state.areas = areas
    },
    [MUTATIONS.RELOCATE_AREA]: (state, payload) => {
      const {index, px, py} = payload
      state.areas[index].x = px
      state.areas[index].y = py
    },
    [MUTATIONS.SET_SHOPPING]: (state) => {
      state.isShopping = !state.isShopping
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
        if(px !== 0)
          index = findAreaIndex(next.x, store.state.boat.y, store.state.areas, 'island', false)
        if(index === -1) {
          store.commit(MUTATIONS.MOVE, {px: px, py: 0})
          store.commit(MUTATIONS.SET_MOVING, true)
        }
        else {
          if(py !== 0)
            index = findAreaIndex(store.state.boat.x, next.y, store.state.areas, 'island', false)
          if(index === -1) {
            store.commit(MUTATIONS.MOVE, {px: 0, py: py})
            store.commit(MUTATIONS.SET_MOVING, true)
          }
          else
            store.commit(MUTATIONS.SET_MOVING, false)
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
    setCurrentFish: (store) => {
      store.commit(MUTATIONS.USE_ACTIVE_BAIT, store.getters.getActiveBaitInfo.index)
      const type = store.state.fishTypes[randomInt(0, store.getters.getActiveBaitInfo.bait.level)], weight = randomInt(type.minWeight, type.maxWeight)
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
    useFeed: (store, count) => {
      store.commit(MUTATIONS.USE_FEED, {
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
    startArea: (store) => {
      let areas = [], coords = []
      for(let i = 0; i < 3; ++i) {
        const c = offsets(750, 2500)
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
          x: randomInt(-2500, 2500),
          y: randomInt(-2500, 2500),
          type: 'high',
          radius: 100
        })
      }
      for(let i = 0; i < 25; ++i) {
        areas.push({
          x: randomInt(-2500, 2500),
          y: randomInt(-2500, 2500),
          type: 'medium',
          radius: 250
        })
      }
      store.commit(MUTATIONS.START_AREA, areas)
    },
    relocateCurrentArea: (store) => {
      if(store.getters.getCurrentAreaInfo) {
        const offset = offsets(1000, 2500)
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
          const offset = offsets(1000, 2500)
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
    setShopping: (store) => {
      store.commit(MUTATIONS.SET_SHOPPING)
    }
  }
})
