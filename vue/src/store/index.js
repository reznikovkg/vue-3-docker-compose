import { createStore } from 'vuex'

const MUTATIONS = {
  MOVE: 'MOVE',
  SET_MOVING: 'SET_MOVING',
  SET_FISHING: 'SET_FISHING',
}

export default createStore({
  namespaced: true,
  state() {
    return {
      boat: {
        x: 0,
        y: 0,
        speed: 1
      },
      inventory: {
        fish: 0
      },
      isMoving: false,
      isFishing: false
    }
  },
  getters: {
    getBoat: (state) => state.boat,
    getIsMoving: (state) => state.isMoving,
    getIsFishing: (state) => state.isFishing
  },
  mutations: {
    [MUTATIONS.MOVE]: (state, payload) => {
      const {px, py} = payload
      state.boat.x += state.boat.speed * px
      state.boat.y += state.boat.speed * py
    },
    [MUTATIONS.SET_MOVING]: (state, value) => {
      state.isMoving = value
    },
    [MUTATIONS.SET_FISHING]: (state) => {
      state.isFishing = !state.isFishing
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
    }
  }
})
