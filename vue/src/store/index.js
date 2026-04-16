import { createStore } from 'vuex'

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
  pointsForWrong: -5,
  fps: 60
}
const DEFAULT_GAME_MODE = 'click'

const validateSettings = (settings) => {
  return {
    totalColors: Math.min(8, Math.max(1, settings.totalColors || DEFAULT_SETTINGS.totalColors)),
    targetColor: settings.targetColor || DEFAULT_SETTINGS.targetColor,
    spawnRate: Math.max(0.1, settings.spawnRate || DEFAULT_SETTINGS.spawnRate),
    pointsForCorrect: settings.pointsForCorrect || DEFAULT_SETTINGS.pointsForCorrect,
    pointsForWrong: settings.pointsForWrong !== undefined ? settings.pointsForWrong : DEFAULT_SETTINGS.pointsForWrong,
    fps: [30, 60, 120, 144, 240].includes(settings.fps) ? settings.fps : DEFAULT_SETTINGS.fps
  }
}

const validateGameMode = (mode) => {
  const validModes = ['click', 'auto', 'laser']
  return validModes.includes(mode) ? mode : DEFAULT_GAME_MODE
}

const loadFromLocalStore = () => {
  try {
    const savedSettings = localStorage.getItem('gameSettings')
    const savedMode = localStorage.getItem('gameMode')
    
    const settings = savedSettings ? validateSettings(JSON.parse(savedSettings)) : { ...DEFAULT_SETTINGS }
    
    const gameMode = savedMode ? validateGameMode(savedMode) : DEFAULT_GAME_MODE

    return { settings, gameMode }
  } catch (error) {
    console.error('Ошибка загрузки настроек:', error)
    return {
      settings: { ...DEFAULT_SETTINGS },
      gameMode: DEFAULT_GAME_MODE
    }
  }
}

const saveSettingsToLocalStore = (settings) => {
  try {
    localStorage.setItem('gameSettings', JSON.stringify(settings))
  } catch (error) {
    console.error('Ошибка сохранения настроек:', error)
  }
}

const saveGameModeToLocalStore = (mode) => {
  try {
    localStorage.setItem('gameMode', mode)
  } catch (error) {
    console.error('Ошибка сохранения режима курсора:', error)
  }
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
    getGameMode: (state) => state.gameMode,
    getFPS: (state) => state.settings.fps,
    getGameModeName: (state) => {
      const names = {
        click: 'Клик',
        auto: 'Авто',
        laser: 'Лазер'
      }
      return names[state.gameMode] || state.gameMode
    }
  },
  mutations: {
    [MUTATIONS.SET_SETTINGS]: (state, settings) => {
      const validated = validateSettings(settings)
      state.settings = {...validated}
      saveSettingsToLocalStore(state.settings)
    },
    [MUTATIONS.UPDATE_SETTINGS]: (state, {key, value}) => {
      if (key in state.settings) {
        const newSettings = { ...state.settings, [key]: value }
        const validated = validateSettings(newSettings)
        state.settings = { ...validated }
        saveSettingsToLocalStore(state.settings)
      }
    },
    [MUTATIONS.RESET_SETTINGS]: (state) => {
      state.settings = {...DEFAULT_SETTINGS}
      saveSettingsToLocalStore(state.settings)
    },
    [MUTATIONS.SET_GAME_MODE]: (state, mode) => {
      const validated = validateGameMode(mode)
      state.gameMode = validated
      saveGameModeToLocalStore(validated)
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
    },
    resetAll: ({ commit }) => {
      commit(MUTATIONS.RESET_SETTINGS)
      commit(MUTATIONS.SET_GAME_MODE, DEFAULT_GAME_MODE)
    }
  }
})