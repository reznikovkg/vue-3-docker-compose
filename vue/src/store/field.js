const MUTATIONS = {
    CHANGE_SIZE: 'CHANGE_SIZE'
}

export default {
  namespaced: true,
  state () {
    return {
        size: 7,
        field: Array(7).fill(null).map(() => Array(7).fill(0))
    }
  },
  getters: {
    getField: (state) => state.field,
    getSize: (state) => state.size,
  },
  mutations: {
    CHANGE_SIZE: (state, newSize) => {
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
    changeSize: (store, newSize) => {
      store.commit(MUTATIONS.CHANGE_SIZE, newSize)
    },
  }
}