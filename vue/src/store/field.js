const MUTATIONS = {
    CHANGE_SIZE: 'CHANGE_SIZE'
}

export default {
  namespaced: true,
  state () {
    return {
      field: Array(7).fill(null).map(() => Array(7).fill(0))
    }
  },
  getters: {
    getField: (state) => state.field,
  },
  mutations: {
    CHANGE_SIZE: (state, newSizeValue) => {
        newSize = newSizeValue
        if (newSize < 7) {
            newSize = 7
        }
        else if (newSize > 21) {
            newSize = 21
        }
        else if (newSize % 2 == 0) {
            newSize += 1
        }
      state.field = Array(newSize).fill(null).map(() => Array(newSize).fill(0))
    },
  },
  actions: {
    changeSize: (store, newSizeValue) => {
      store.commit(MUTATIONS.CHANGE_SIZE, newSizeValue)
    },
  }
}