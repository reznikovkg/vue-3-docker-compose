import { BASE_PIECES } from '../constants/constants'

const MUTATIONS = {
  ADD_SHAPE: 'ADD_SHAPE',
  UPDATE_SHAPE: 'UPDATE_SHAPE',
  DELETE_SHAPE: 'DELETE_SHAPE'
}

export default {
  namespaced: true,
  state() {
    return {
      customShapes: []
    }
  },
  getters: {
    getAllShapes: (state) => [...BASE_PIECES, ...state.customShapes],
    getShapeById: (state) => (id) => {
      const custom = state.customShapes.find(p => p.id === id)
      if (custom) return custom
      return BASE_PIECES.find(p => p.id === id)
    }
  },
  mutations: {
    [MUTATIONS.ADD_SHAPE]: (state, shape) => {
      state.customShapes.push(shape)
    },
    [MUTATIONS.UPDATE_SHAPE]: (state, { id, ...updates }) => {
      const index = state.customShapes.findIndex(s => s.id === id)
      if (index !== -1) {
        state.customShapes[index] = { ...state.customShapes[index], ...updates }
      } else {
        const baseShape = BASE_PIECES.find(p => p.id === id)
        if (baseShape) {
          state.customShapes.push({ ...baseShape, ...updates })
        }
      }
    },
    [MUTATIONS.DELETE_SHAPE]: (state, id) => {
      state.customShapes = state.customShapes.filter(s => s.id !== id)
    }
  },
  actions: {
    addShape: ({ commit }, shape) => {
      commit(MUTATIONS.ADD_SHAPE, shape)
    },
    updateShape: ({ commit }, shape) => {
      commit(MUTATIONS.UPDATE_SHAPE, shape)
    },
    deleteShape: ({ commit }, id) => {
      commit(MUTATIONS.DELETE_SHAPE, id)
    }
  }
}