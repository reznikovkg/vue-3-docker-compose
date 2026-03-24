import { createStore } from 'vuex'
import list from './list'

const MUTATIONS = {
  SET_SETTINGS: 'SET_SETTINGS',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  RESET_SETTINGS: 'RESET_SETTINGS',
  SET_GAME_MODE: 'SET_GAME_MODE'
}

const DEFAULT_SETTINGS = {
  totalColors: 3,
  targetColor: 'red',
  spawnRate: 1,
  pointsForCorrect: 1,
  pointsForWrong: -5
}

const loadFromLocalStore = () => {
  const savedSettings = localStorage.getItem('gameSettings')
  const savedMode = localStorage.getItem('gameMode')

  return {
    settings: savedSettings ? JSON.parse(savedSettings) : {...DEFAULT_SETTINGS},
    gameMode: savedMode || 'click'
  }
}

const saveSettingsToLocalStore = (settings) => {
  localStorage.setItem('gameSettings', JSON.stringify(settings))
}

const saveGameModeToLocalStore = (mode) => {
  localStorage.setItem('gameMode', mode)
}

export default createStore({
  state () {
    const saved = loadFromLocalStore()
    return {
      settings: saved.settings,
      gameMode: saved.gameMode
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
    isTargetColor: (state) => (color) => color == state.settings.targetColor,
    getGameMode: (state) => state.gameMode
  },
  mutations: {
    [MUTATIONS.SET_SETTINGS]: (state, settings) => {
      state.settings = {...settings}
      saveSettingsToLocalStore(state.settings)
    },
    [MUTATIONS.UPDATE_SETTINGS]: (state, {key, value}) => {
      if (key in state.settings) {
        state.settings[key] = value
        saveSettingsToLocalStore(state.settings)
      }
    },
    [MUTATIONS.RESET_SETTINGS]: (state) => {
      state.settings = {...DEFAULT_SETTINGS}
      saveSettingsToLocalStore(state.settings)
    },
    [MUTATIONS.SET_GAME_MODE]: (state, mode) => {
      state.gameMode = mode
      saveGameModeToLocalStore(mode)
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
    },
    setGameMode: (store, mode) => {
      store.commit(MUTATIONS.SET_GAME_MODE, mode)
    }
  },
  modules: {
    list,
  }
})