import { createStore } from 'vuex'
import list from './list'
const MUTATIONS = {
  SET_COLORS_COUNT: 'SET_COLORS_COUNT',
  SET_TARGET_COLOR: 'SET_TARGET_COLOR',
  SET_SPAWN_RATE: 'SET_SPAWN_RATE',
}
export default createStore({
  state() {
    return {
      colorsCount: 7,
      targetColor: 'red',
      spawnRate: 1
    }
  },
  getters: {
    getColorsCount: (state) => state.colorsCount,
    getTargetColor: (state) => state.targetColor,
    getSpawnRate: (state) => state.spawnRate,
  },
  mutations: {
    [MUTATIONS.SET_COLORS_COUNT](state, value) {
      state.colorsCount = value
    },
    [MUTATIONS.SET_TARGET_COLOR](state, value) {
      state.targetColor = value
    },
    [MUTATIONS.SET_SPAWN_RATE](state, value) {
      state.spawnRate = value
    },
  },
  actions: {
    setColorsCount(store, value) {
      store.commit(MUTATIONS.SET_COLORS_COUNT, value)
    },
    setTargetColor(store, value) {
      store.commit(MUTATIONS.SET_TARGET_COLOR, value)
    },
    setSpawnRate(store, value) {
      store.commit(MUTATIONS.SET_SPAWN_RATE, value)
    },
  },
  modules: {
    list
  }
})