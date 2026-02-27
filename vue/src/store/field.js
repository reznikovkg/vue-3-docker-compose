const MUTATIONS = {
    CHANGE_FIELD_SIZE: 'CHANGE_FIELD_SIZE'
}

export default {
  namespaced: true,
  state () {
    return {
        size: 7,
        field: null
    }
  },
  getters: {
    getField: (state) => state.field,
    getFieldSize: (state) => state.size,
  },
  mutations: {
    CHANGE_FIELD_SIZE: (state, newSize) => {
        state.size = newSize
        if (state.size < 7) {
            state.size = 7
        }
        else if (state.size > 21) {
            state.size = 21
        }
        else if (state.size % 2 == 0) {
            state.size += 1
        }
      state.field = Array(state.size).fill(null).map(() => Array(state.size).fill(0))
    },
  },
  actions: {
    changeFieldSize: (store, newSize) => {
      store.commit(MUTATIONS.CHANGE_FIELD_SIZE, newSize)
    },
  }
}