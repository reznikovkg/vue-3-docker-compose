const MUTATIONS = {
  SET_FLASKS: 'SET_FLASKS',
  SET_DRAG_INDEX: 'SET_DRAG_INDEX',
  MOVE_FLASK: 'MOVE_FLASK'
}

export default {
  namespaced: true,

  state: () => ({
    flasks: [],
    dragIndex: null
  }),

  mutations: {
    [MUTATIONS.SET_FLASKS] (state, payload) {
      state.flasks = payload
    },

    [MUTATIONS.SET_DRAG_INDEX] (state, payload) {
      state.dragIndex = payload
    },

    [MUTATIONS.MOVE_FLASK] (state, payload) {
      const { fromIndex, toIndex } = payload

      if (fromIndex === null || toIndex === null) return
      if (fromIndex === toIndex) return

      const movedFlask = state.flasks.splice(fromIndex, 1)[0]

      let insertIndex = toIndex

      if (fromIndex < toIndex) {
        insertIndex--
      }

      state.flasks.splice(insertIndex, 0, movedFlask)
    }
  },

  getters: {
    getFlasks: (state) => state.flasks,
    getDragIndex: (state) => state.dragIndex
  }
}