const BASE_FIGURES = [
  {
    id: 'I',
    name: 'I-figure',
    color: '#00bcd4',
    cells:[
        {row: 0, col: -1},
        {row: 0, col: 0},
        {row: 0, col: 1},
        {row: 0, col: 2},
    ]
  },
  {
    id: 'O',
    name: 'O-figure',
    color: '#ffeb3b',
    cells:[
        {row: 0, col: 0},
        {row: 0, col: 1},
        {row: 1, col: 0},
        {row: 1, col: 1},
    ]
  },
  {
    id: 'T',
    name: 'T-figure',
    color: '#9c27b0',
    cells:[
        {row: 0, col: -1},
        {row: 0, col: 0},
        {row: 0, col: 1},
        {row: 1, col: 0},
    ]
  },
  {
    id: 'S',
    name: 'S-figure',
    color: '#4caf50',
    cells:[
        {row: 0, col: 0},
        {row: 0, col: 1},
        {row: 1, col: -1},
        {row: 1, col: 0},
    ]
  },
  {
    id: 'Z',
    name: 'Z-figure',
    color: '#f44336',
    cells:[
        {row: 0, col: -1},
        {row: 0, col: 0},
        {row: 1, col: 0},
        {row: 1, col: 1},
    ]
  },
  {
    id: 'L',
    name: 'L-figure',
    color: '#ff9800',
    cells:[
        {row: 0, col: -1},
        {row: 0, col: 0},
        {row: 0, col: 1},
        {row: 1, col: -1},
    ]
  },
  {
    id: 'J',
    name: 'J-figure',
    color: '#2196f3',
    cells:[
        {row: 0, col: -1},
        {row: 0, col: 0},
        {row: 0, col: 1},
        {row: 1, col: 1},
    ]
  },
]

const MUTATIONS={
    SET_SHAPES: 'SET_SHAPES',
    ADD_SHAPE: 'ADD_SHAPE',
    UPDATE_SHAPE: 'UPDATE_SHAPE',
    REMOVE_SHAPE: 'REMOVE_SHAPE',
    SET_ACTIVE_SHAPE_ID: 'SET_ACTIVE_SHAPE_ID',
}

export default {
  namespaced: true,
  state() {
    return {
      shapes: BASE_FIGURES.map(f => ({...f})),
      activeShapeId: null,
    }
  },
  getters: {
    getShapes: (state) => state.shapes,
    getActiveShapeId: (state) => state.activeShapeId,
    getActiveShape: (state) => state.shapes.find(s => s.id === state.activeShapeId) ?? null,
    getShapeById: (state) => (id) => state.shapes.find(s => s.id === id) ?? null,
  },
  mutations: {
    [MUTATIONS.SET_SHAPES]: (state, payload) => {
      state.shapes = payload
    },
    [MUTATIONS.ADD_SHAPE]: (state, payload) => {
      state.shapes.push(payload)
      console.log(`Figure is added: ${payload.name}`)
    },
    [MUTATIONS.UPDATE_SHAPE]: (state, payload) => {
      const idx = state.shapes.findIndex(s => s.id === payload.id)
      if (idx !== -1){
        state.shapes[idx] = {...payload}
        console.log(`Figure is updated: ${payload.name}`)
      }
    },
    [MUTATIONS.REMOVE_SHAPE]: (state, payload) => {
      state.shapes = state.shapes.filter(s => s.id !== payload)
      console.log(`Figure is deleted: ${payload}`)
    },
    [MUTATIONS.SET_ACTIVE_SHAPE_ID]: (state, payload) => {
      state.activeShapeId = payload
      console.log(`Active figure: ${payload}`)
    }
  },
  actions: {
    loadShapes: ({state, commit}) => {
      try {
        const saved = localStorage.getItem('islandFigureShapes')
        if (saved) {
          commit(MUTATIONS.SET_SHAPES, JSON.parse(saved))
          console.log('Figures are loaded in localStorage')
        }
      } catch (e) {
        console.warn('Could not load figures from localStorage', e)
      }
    },

    saveShapes: ({state, commit}) => {
      try {
        localStorage.setItem('islandFigureShapes', JSON.stringify(state.shapes))
        console.log('Figures are saved in localStorage')
      } catch (e) {
        console.warn('Could not save figures in localStorage', e)
      }
    },

    addShape: ({state, commit}, shape) => {
      const newShape = {
        ...shape, 
        id: 'custom-' + Date.now() + '-' + Math.random(),
      }
      commit(MUTATIONS.ADD_SHAPE, newShape)
    },

    updateShape: ({state, commit}, shape) => {
        commit(MUTATIONS.UPDATE_SHAPE, shape)
    },

    removeShape: ({state, commit}, id) => {
      const isBase = ['I', 'O', 'T', 'S', 'Z', 'L', 'J'].includes(id)
      if (isBase){
        console.warn(`Could not remove the base figure`)
        return
      }
      commit(MUTATIONS.REMOVE_SHAPE, id)
    },

    setActiveShapeId: ({state, commit}, id) => {
      commit(MUTATIONS.SET_ACTIVE_SHAPE_ID, id)
    },

    resetToDefaults: ({state, commit}) => {
      const defaults = BASE_FIGURES.map(f => ({...f, cells: f.cells.map(c => ({...c}))}))
      commit(MUTATIONS.SET_SHAPES, defaults)
      console.log(`Figures are reset to base`)
    },

    saveShapeAs: ({state, commit}, {sourceId, name}) => {
      const source = state.shapes.find(s => s.id === sourceId)
      if (!source) return
      const newShape = {
        ...source,
        id: 'custom-' + Date.now() + '-' + Math.random(),
        name: name || source.name + '(copy)',
        cells: source.cells.map(c => ({...c})),
      }
      commit(MUTATIONS.ADD_SHAPE, newShape)
      console.log(`Figure is saved as new: ${newShape.name}`)
    }
  }
}
