import { createStore } from 'vuex'
import list from './list'
import { GAME_DEFAULTS } from '@/constants/gameConfig.js'

const getDefaultModeState = () => {
  return {
    laser: {
      activeLeft: 0,
      cooldownLeft: 0
    },
    automat: {
      activeLeft: 0,
      cooldownLeft: 0
    }
  }
}

export const MUTATIONS = {
  INCREMENT: 'INCREMENT',
  SET_COUNT: 'SET_COUNT',
  SET_IS_RUNNING: 'SET_IS_RUNNING',
  SET_SCORE: 'SET_SCORE',
  SET_TIME_LEFT: 'SET_TIME_LEFT',
  SET_ACTIVE_MODE: 'SET_ACTIVE_MODE',
  SET_LAST_RESULT: 'SET_LAST_RESULT',
  SET_MODE_STATE: 'SET_MODE_STATE',
  SET_BOMBS_COUNT: 'SET_BOMBS_COUNT',
  SET_SUCCESSFUL_HITS_COUNT: 'SET_SUCCESSFUL_HITS_COUNT',
  SET_HIT_COMBO_MULTIPLIER: 'SET_HIT_COMBO_MULTIPLIER',
  SET_MISS_COMBO_MULTIPLIER: 'SET_MISS_COMBO_MULTIPLIER'
}

export default createStore({
  state () {
    return {
      count: 0,
      isRunning: false,
      score: 0,
      timeLeft: GAME_DEFAULTS.maxTime,
      activeMode: 'normal',
      lastResultScore: null,
      modeState: getDefaultModeState(),
      bombsCount: 0,
      successfulHitsCount: 0,
      hitComboMultiplier: 1,
      missComboMultiplier: 1
    }
  },
  getters: {
    getCount: (state) => state.count,
    getCount2: (state) => state.count * 2,
    getIsRunning: (state) => state.isRunning,
    getScore: (state) => state.score,
    getTimeLeft: (state) => state.timeLeft,
    getActiveMode: (state) => state.activeMode,
    getLastResultScore: (state) => state.lastResultScore,
    getModeState: (state) => state.modeState,
    getBombsCount: (state) => state.bombsCount,
    getSuccessfulHitsCount: (state) => state.successfulHitsCount,
    getHitComboMultiplier: (state) => state.hitComboMultiplier,
    getMissComboMultiplier: (state) => state.missComboMultiplier
  },
  mutations: {
    [MUTATIONS.INCREMENT]: (state, value) => {
      state.count += value
    },
    [MUTATIONS.SET_COUNT]: (state, value) => {
      state.count = value
    },
    [MUTATIONS.SET_IS_RUNNING]: (state, payload) => {
      state.isRunning = payload
    },
    [MUTATIONS.SET_SCORE]: (state, payload) => {
      state.score = payload
    },
    [MUTATIONS.SET_TIME_LEFT]: (state, payload) => {
      state.timeLeft = payload
    },
    [MUTATIONS.SET_ACTIVE_MODE]: (state, payload) => {
      state.activeMode = payload
    },
    [MUTATIONS.SET_LAST_RESULT]: (state, payload) => {
      state.lastResultScore = payload
    },
    [MUTATIONS.SET_MODE_STATE]: (state, payload) => {
      state.modeState = payload
    },
    [MUTATIONS.SET_BOMBS_COUNT]: (state, payload) => {
      state.bombsCount = payload
    },
    [MUTATIONS.SET_SUCCESSFUL_HITS_COUNT]: (state, payload) => {
      state.successfulHitsCount = payload
    },
    [MUTATIONS.SET_HIT_COMBO_MULTIPLIER]: (state, payload) => {
      state.hitComboMultiplier = payload
    },
    [MUTATIONS.SET_MISS_COMBO_MULTIPLIER]: (state, payload) => {
      state.missComboMultiplier = payload
    }
  },
  actions: {
    runIncrement: (store, value) => {
      store.commit(MUTATIONS.INCREMENT, value)
    },
    setCount: (store, payload) => {
      const { value, timeout = 0 } = payload
      setTimeout(() => {
        store.commit(MUTATIONS.SET_COUNT, value)
      }, timeout)
    },
    setIsRunning: ({ commit }, payload) => {
      commit(MUTATIONS.SET_IS_RUNNING, payload)
    },
    setScore: ({ commit }, payload) => {
      commit(MUTATIONS.SET_SCORE, payload)
    },
    setTimeLeft: ({ commit }, payload) => {
      commit(MUTATIONS.SET_TIME_LEFT, payload)
    },
    setActiveMode: ({ commit }, payload) => {
      commit(MUTATIONS.SET_ACTIVE_MODE, payload)
    },
    setLastResult: ({ commit }, payload) => {
      commit(MUTATIONS.SET_LAST_RESULT, payload)
    },
    setModeState: ({ commit }, payload) => {
      commit(MUTATIONS.SET_MODE_STATE, payload)
    },
    setBombsCount: ({ commit }, payload) => {
      commit(MUTATIONS.SET_BOMBS_COUNT, payload)
    },
    setSuccessfulHitsCount: ({ commit }, payload) => {
      commit(MUTATIONS.SET_SUCCESSFUL_HITS_COUNT, payload)
    },
    setHitComboMultiplier: ({ commit }, payload) => {
      commit(MUTATIONS.SET_HIT_COMBO_MULTIPLIER, payload)
    },
    setMissComboMultiplier: ({ commit }, payload) => {
      commit(MUTATIONS.SET_MISS_COMBO_MULTIPLIER, payload)
    }
  },
  modules: {
    list
  }
})
