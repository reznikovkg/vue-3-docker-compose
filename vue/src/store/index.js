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
  ADD_FISH: 'ADD_FISH'
}

export default createStore({
  state() {
    return {
      boat: {
        x: 0,
        y: 0,
        speed: 1,
        direction: 1
      },
      inventory: [
        { count: 0, image: fish1, name: 'fish1' },
        { count: 0, image: fish2, name: 'fish2' },
        { count: 0, image: fish3, name: 'fish3' }
      ],
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
    getInventory: (state) => state.inventory
  },
  mutations: {
    [MUTATIONS.MOVE]: (state, payload) => {
      const {px, py} = payload
      state.boat.x += state.boat.speed * px
      state.boat.y += state.boat.speed * py
      if(px > 0)
        state.boat.direction = 1
      if(px < 0)
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
      state.inventory[Math.floor(Math.random() * state.inventory.length)].count += 1
    }
  },
  actions: {
    move: (store, payload) => {
      store.commit(MUTATIONS.MOVE, payload)
    },
    setMoving: (store, value) => new Promise((resolve) => {
      setTimeout(() => {
        store.commit(MUTATIONS.SET_MOVING, value)
        resolve()
      }, 10)
    }),
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
    }
  }
})
