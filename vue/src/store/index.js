import { createStore } from 'vuex'
import figure from './figure'
import figureShapes from './figureShapes'

const MUTATIONS = {
  INCREMENT: 'INCREMENT',
  SET_COUNT: 'SET_COUNT',
}

export default createStore({
  state () {
    return {
      count: 10000
    }
  },
  getters: {
    getCount: (state) => state.count,
    getCount2: (state) => state.count * 2,
  },
  mutations: {
    [MUTATIONS.INCREMENT]: (state, value) => {
      state.count += value
    },
    [MUTATIONS.SET_COUNT]: (state, value) => {
      state.count = value
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
  },
  modules: {
    figure,
    figureShapes
  }
})
