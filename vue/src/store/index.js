import { createStore } from 'vuex'

const MUTATIONS = {
  SET_FLASK_COUNT: 'SET_FLASK_COUNT',
  SET_LAYERS_PER_FLASK: 'SET_LAYERS_PER_FLASK',
  INC_FLASK_COUNT: 'INC_FLASK_COUNT',
  DEC_FLASK_COUNT: 'DEC_FLASK_COUNT',
  INC_LAYERS_PER_FLASK: 'INC_LAYERS_PER_FLASK',
  DEC_LAYERS_PER_FLASK: 'DEC_LAYERS_PER_FLASK',
  NULL_WIN_COUNT: 'NULL_WIN_COUNT',
  INC_WIN_COUNT: 'INC_WIN_COUNT',
  SET_RECORD: 'SET_RECORD',
  CHANGE_MODE: 'CHANGE_MODE'
}

export default createStore({
  state () {
    return {
      flaskCount: 5,
      layersPerFlask: 4,
      winCount: 0,
      countRecords: 10,
      records: [],
      hardMode: false
    }
  },
  getters: {
    getFlaskCount: (state) => state.flaskCount,
    getLayersPerFlask: (state) => state.layersPerFlask,
    getWinCount: (state) => state.winCount,
    getRecords: (state) => state.records,
    getHardMode: (state) => state.hardMode
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
    },
    [MUTATIONS.SET_RECORD]: (state, value) => {
      state.records.push(value)
      state.records.sort((a, b) => a - b)
      if (state.records.length > state.countRecords)
        state.records.pop()
    },
    [MUTATIONS.CHANGE_MODE]: (state) => {
      state.hardMode = !state.hardMode
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
    },
    setRecord: (store, value) => {
      store.commit(MUTATIONS.SET_RECORD, value)
    },
    changeMode: (store) => {
      store.commit(MUTATIONS.CHANGE_MODE)
    }
  }
})
