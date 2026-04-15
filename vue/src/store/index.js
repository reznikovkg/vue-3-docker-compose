import { createStore } from 'vuex'

const MUTATIONS = {
  MOVE: 'MOVE',
  SET_MOVING: 'SET_MOVING',
  SET_FISHING: 'SET_FISHING',
  SET_GAMING: 'SET_GAMING'
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
      inventory: {
        fish: 0
      },
      isMoving: false,
      isFishing: false,
      isGaming: false
    }
  },
  getters: {
    getBoat: (state) => state.boat,
    getIsMoving: (state) => state.isMoving,
    getIsFishing: (state) => state.isFishing,
    getIsGaming: (state) => state.isGaming
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
  },
  actions: {
    move: (store, payload) => {
      store.commit(MUTATIONS.MOVE, payload)
    },
    setMoving: (store, value) => new Promise((resolve) => {
      setTimeout(() => {
        store.commit(MUTATIONS.SET_MOVING, value)
        resolve()
      }, 20)
    }),
    setFishing: (store) => {
      store.commit(MUTATIONS.SET_FISHING)
    },
    setGaming: (store, value) => {
      store.commit(MUTATIONS.SET_GAMING, value)
    }
  }
})
