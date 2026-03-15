import { createStore } from 'vuex'
import list from './list'

const MUTATIONS = {
  SET_SETTINGS: 'SET_SETTINGS',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  RESET_SETTINGS: 'RESET_SETTINGS'
}

const DEFAULT_SETTINGS = {
  totalColors: 3,
  targetColor: 'red',
  spawnRate: 1,
  pointsForCorrect: 1,
  pointsForWrong: -5
}

export default createStore({
  state () {
    return {
      settings: {...DEFAULT_SETTINGS}
    }
  },
  getters: {  
    getSettings: (state) => state.settings,
    getTotalColors: (state) => state.settings.totalColors,
    getTargetColor: (state) => state.settings.targetColor,
    getSpawnRate: (state) => state.settings.spawnRate,
    getPointsForCorrect: (state) => state.settings.pointsForCorrect,
    getPointsForWrong:  (state) => state.settings.pointsForWrong,

    getSpawnInterval: (state) => (1/state.settings.spawnRate).toFixed(2),
    isTargetColor: (state) => (color) => color == state.settings.targetColor
  },
  mutations: {
    [MUTATIONS.SET_SETTINGS]: (state, settings) => {
      state.settings = {...settings}
    },
    [MUTATIONS.UPDATE_SETTINGS]: (state, {key, value}) => {
      if (key in state.settings) {
        state.settings[key] = value
      }
    },
    [MUTATIONS.RESET_SETTINGS]: (state) => {
      state.settings = {...DEFAULT_SETTINGS}
    }
  },
  actions: {
    setSettings: (store, settings) => {
      store.commit(MUTATIONS.SET_SETTINGS, settings)
    },
    updateSetting: (store, {key, value}) => {
      store.commit(MUTATIONS.UPDATE_SETTINGS, {key, value})
    },
    resetSettings: (store) => {
      store.commit(MUTATIONS.RESET_SETTINGS)
    }
  },
  modules: {
    list,
  }
})