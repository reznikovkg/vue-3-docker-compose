const MUTATIONS = {
    CHANGE_FIELD_SIZE: 'CHANGE_FIELD_SIZE',
    SET_NUMBER: 'SET_NUMBER'
}

const OBJECTS = {
  NONE: 0,
  CENTRAL_CUBE: 1,
  EXTERNAL_FIGURE: 2,
  ATTACHED_CUBE: 3
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
    [MUTATIONS.CHANGE_FIELD_SIZE]: (state, newSize) => {
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
    [MUTATIONS.SET_NUMBER]: (state, { position, objectType }) => {
      if (position.x >= 0 && position.x < state.size &&
            position.y >= 0 && position.y < state.size) {
        state.field[position.y - 1][position.x - 1] = objectType
      }
    }
  },
  actions: {
    changeFieldSize: (store, newSize) => {
      store.commit(MUTATIONS.CHANGE_FIELD_SIZE, newSize)
    },
    changeCentralCubePosition: (store, { oldPosition, newPosition }) => {
      store.commit(MUTATIONS.SET_NUMBER, { position: newPosition, objectType: OBJECTS.CENTRAL_CUBE })
      store.commit(MUTATIONS.SET_NUMBER, { position: oldPosition, objectType: OBJECTS.NONE })
    }
  }
}