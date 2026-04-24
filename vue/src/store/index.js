import { createStore } from 'vuex'
import fish1 from '../assets/images/fish/1.png'
import fish2 from '../assets/images/fish/2.png'
import fish3 from '../assets/images/fish/3.png'

const MUTATIONS = {
  MOVE: 'MOVE',
  SET_MOVING: 'SET_MOVING',
  SET_FISHING: 'SET_FISHING',
  SET_GAMING: 'SET_GAMING',
  SET_HOOKED: 'SET_HOOKED',
  SET_BROKEN: 'SET_BROKEN',
  ADD_FISH: 'ADD_FISH',
  START_AREA: 'START_AREA',
  RELOCATE_AREA: 'RELOCATE_AREA'
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
      inventory: [
        { count: 0, image: fish1, name: 'fish1' },
        { count: 0, image: fish2, name: 'fish2' },
        { count: 0, image: fish3, name: 'fish3' }
      ],
      areas: [],
      isMoving: false,
      isFishing: false,
      isGaming: false,
      isHooked: false,
      isBroken: false
    }
  },
  getters: {
    getBoat: (state) => state.boat,
    getIsMoving: (state) => state.isMoving,
    getIsFishing: (state) => state.isFishing,
    getIsGaming: (state) => state.isGaming,
    getIsHooked: (state) => state.isHooked,
    getIsBroken: (state) => state.isBroken,
    getInventory: (state) => state.inventory,
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
    }
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
    [MUTATIONS.ADD_FISH]: (state) => {
      state.inventory[randomInt(0, state.inventory.length - 1)].count += 1
    },
    [MUTATIONS.START_AREA]: (state, areas) => {
      state.areas = areas
    },
    [MUTATIONS.RELOCATE_AREA]: (state, payload) => {
      const {index, px, py} = payload
      state.areas[index].x = px
      state.areas[index].y = py
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
    addFish: (store) => {
      store.commit(MUTATIONS.ADD_FISH)
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
    }
  }
})
