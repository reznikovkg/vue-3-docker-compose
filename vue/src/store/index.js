import { createStore } from 'vuex'

const MUTATIONS = {
  SET_FLASK_COUNT: 'SET_FLASK_COUNT',
  SET_LAYERS_PER_FLASK: 'SET_LAYERS_PER_FLASK',
  INC_FLASK_COUNT: 'INC_FLASK_COUNT',
  DEC_FLASK_COUNT: 'DEC_FLASK_COUNT',
  INC_LAYERS_PER_FLASK: 'INC_LAYERS_PER_FLASK',
  DEC_LAYERS_PER_FLASK: 'DEC_LAYERS_PER_FLASK',
  NULL_WIN_COUNT: 'NULL_WIN_COUNT',
  INC_WIN_COUNT: 'INC_WIN_COUNT'
}

export default createStore({
  state () {
    return {
      flaskCount: 5,
      layersPerFlask: 4,
      winCount: 0
    }
  },
  getters: {
    getFlaskCount: (state) => state.flaskCount,
    getLayersPerFlask: (state) => state.layersPerFlask,
    getWinCount: (state) => state.winCount
  },
  mutations: {
    [MUTATIONS.SET_FLASK_COUNT]: (state, value) => {
      state.flaskCount = value
    },
    [MUTATIONS.SET_LAYERS_PER_FLASK]: (state, value) => {
      state.layersPerFlask = value
    },
    [MUTATIONS.INC_FLASK_COUNT]: (state) => {
      state.flaskCount += 1
    },
    [MUTATIONS.DEC_FLASK_COUNT]: (state) => {
      state.flaskCount -= 1
    },
    [MUTATIONS.INC_LAYERS_PER_FLASK]: (state) => {
      state.layersPerFlask += 1
    },
    [MUTATIONS.DEC_LAYERS_PER_FLASK]: (state) => {
      state.layersPerFlask -= 1
    },
    [MUTATIONS.NULL_WIN_COUNT]: (state) => {
      state.winCount = 0
    },
    [MUTATIONS.INC_WIN_COUNT]: (state) => {
      state.winCount += 1
    }
  },
  actions: {
    setFlaskCount: (store, value) => {
      store.commit(MUTATIONS.SET_FLASK_COUNT, value)
    },
    setLayersPerFlask: (store, value) => {
      store.commit(MUTATIONS.SET_LAYERS_PER_FLASK, value)
    },
    incFlaskCount: (store) => {
      store.commit(MUTATIONS.INC_FLASK_COUNT)
    },
    incLayersPerFlask: (store) => {
      store.commit(MUTATIONS.INC_LAYERS_PER_FLASK)
    },
    decFlaskCount: (store) => {
      store.commit(MUTATIONS.DEC_FLASK_COUNT)
    },
    decLayersPerFlask: (store) => {
      store.commit(MUTATIONS.DEC_LAYERS_PER_FLASK)
    },
    nullWinCount: (store) => {
      store.commit(MUTATIONS.NULL_WIN_COUNT)
    },
    incWinCount: (store) => {
      store.commit(MUTATIONS.INC_WIN_COUNT)
    }
  }
})
