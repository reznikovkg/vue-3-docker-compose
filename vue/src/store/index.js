import { createStore } from 'vuex'
import list from './list'

export const MUTATIONS = {
  INCREMENT: 'INCREMENT',
  SET_COUNT: 'SET_COUNT',
  SET_CURRENT_SCORE: 'SET_CURRENT_SCORE',
  SET_BEST_SCORE: 'SET_BEST_SCORE',
}

export const ACTIONS = {
  RUN_INCREMENT: 'runIncrement',
  SET_COUNT: 'setCount',
  SAVE_SCORE: 'saveScore',
}

export default createStore({
  state: () => ({
    count: 0,
    currentScore: 0,
    bestScore: 0,
  }),
  getters: {
    getCount: (state) => state.count,
    getCount2: (state) => state.count * 2,
    getCurrentScore: (state) => state.currentScore,
    getBestScore: (state) => state.bestScore,
  },
  mutations: {
    [MUTATIONS.INCREMENT]: (state, value) => {
      state.count += value
    },
    [MUTATIONS.SET_COUNT]: (state, value) => {
      state.count = value
    },
    [MUTATIONS.SET_CURRENT_SCORE]: (state, value) => {
      state.currentScore = value
    },
    [MUTATIONS.SET_BEST_SCORE]: (state, value) => {
      state.bestScore = value
    },
  },
  actions: {
    [ACTIONS.RUN_INCREMENT]: (store, value) => {
      store.commit(MUTATIONS.INCREMENT, value)
    },
    [ACTIONS.SET_COUNT]: (store, payload) => {
      const { value, timeout = 0 } = payload
      setTimeout(() => {
        store.commit(MUTATIONS.SET_COUNT, value)
      }, timeout)
    },
    [ACTIONS.SAVE_SCORE]: (store, value) => {
      const bestScore = store.state.bestScore
      store.commit(MUTATIONS.SET_CURRENT_SCORE, value)

      if (value > bestScore) {
        store.commit(MUTATIONS.SET_BEST_SCORE, value)
      }
    },
  },
  modules: {
    list,
  },
})
