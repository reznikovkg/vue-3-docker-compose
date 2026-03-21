import { createStore } from 'vuex'
import list from './list'

export const MUTATIONS = {
  INCREMENT: 'INCREMENT',
  SET_COUNT: 'SET_COUNT',
  SET_LAST_RESULT: 'SET_LAST_RESULT',
  SET_MODE_STATE: 'SET_MODE_STATE',
}

export default createStore({
  state () {
    return {
      count: 0,
      lastResultScore: null,
      modeState: {
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
  },
  getters: {
    getCount: (state) => state.count,
    getCount2: (state) => state.count * 2,
    getLastResultScore: (state) => state.lastResultScore,
    getModeState: (state) => state.modeState,
    // getList: (state) => [4, 3]
  },
  mutations: {
    [MUTATIONS.INCREMENT]: (state, value) => {
      state.count += value
    },
    [MUTATIONS.SET_COUNT]: (state, value) => {
      state.count = value
    },
    [MUTATIONS.SET_LAST_RESULT]: (state, payload) => {
      state.lastResultScore = payload
    },
    [MUTATIONS.SET_MODE_STATE]: (state, payload) => {
      state.modeState = payload
    },
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
    setLastResult: ({ commit }, payload) => {
      commit(MUTATIONS.SET_LAST_RESULT, payload)
    },
    setModeState: ({ commit }, payload) => {
      commit(MUTATIONS.SET_MODE_STATE, payload)
    },
  },
  modules: {
    list
  }
})
