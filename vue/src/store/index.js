import { createStore } from 'vuex'

const MUTATIONS = {
  SET_GRID: 'SET_GRID',
  SET_SELECTED_SHAPE: 'SET_SELECTED_SHAPE', 
  SET_GAME_MODE: 'SET_GAME_MODE',
  ADD_SHAPE: 'ADD_SHAPE',
  REMOVE_SHAPE: 'REMOVE_SHAPE',
  SET_PREVIEW_CELLS: 'SET_PREVIEW_CELLS',
  SET_GRID_SIZE: 'SET_GRID_SIZE'
}

export default createStore({
  state () {
    return {
      grid: [],
      gridSizeX: 8,
      gridSizeY: 8,
      selectedShape: null,
      gameMode: 'add',
      previewCells: [],
      nextShapeId: 1,
      availableShapes: [
        {
          id: 1,
          name: 'Дом',
          type: 'square',
          color: '#3d171cff',
          layout: [
            { x: 0, y: 0 }, { x: 1, y: 0 },
            { x: 0, y: 1 }, { x: 1, y: 1 }
          ]
        },
        {
          id: 2,
          name: 'Теплица',
          type: 'line',
          color: '#72abe1ff',
          layout: [
            { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }
          ]
        },
        {
          id: 3,
          name: 'Магазин',
          type: 'lshape',
          color: '#fc7a10ff',
          layout: [
            { x: 0, y: 0 }, { x: 1, y: 0 },
            { x: 0, y: 1 }
          ]
        },
        {
          id: 4,
          name: 'Куст',
          type: 'single',
          color: '#92eb3eff',
          layout: [{ x: 0, y: 0 }]
        }
      ]
    }
  },
  getters: {
    getGrid: (state) => state.grid,
    getGridSizeX: (state) => state.gridSizeX,
    getGridSizeY: (state) => state.gridSizeY,
    getSelectedShape: (state) => state.selectedShape,
    getGameMode: (state) => state.gameMode,
    getPreviewCells: (state) => state.previewCells,
    getAvailableShapes: (state) => state.availableShapes
  },
  mutations: {
    [MUTATIONS.SET_GRID]: (state, grid) => {
      state.grid = grid
    },
    [MUTATIONS.SET_GRID_SIZE]: (state, payload) => {
      state.gridSizeX = payload.gridSizeX
      state.gridSizeY = payload.gridSizeY
    },
    [MUTATIONS.SET_SELECTED_SHAPE]: (state, shape) => {
      state.selectedShape = shape
    },
    [MUTATIONS.SET_GAME_MODE]: (state, mode) => {
      state.gameMode = mode
    },
    [MUTATIONS.ADD_SHAPE]: (state, payload) => {
      payload.cells.forEach(({ row, col }) => {
        if (!state.grid[row]) state.grid[row] = []
        state.grid[row][col] = {
          id: payload.shapeId,
          type: payload.shapeType,
          color: payload.color
        }
      })
      state.nextShapeId++
    },
    [MUTATIONS.REMOVE_SHAPE]: (state, payload) => {
      for (let row = 0; row < payload.gridSizeY; row++) {
        for (let col = 0; col < payload.gridSizeX; col++) {
          if (state.grid[row]?.[col]?.id === payload.shapeId) {
            state.grid[row][col] = null
          }
        }
      }
    },
    [MUTATIONS.SET_PREVIEW_CELLS]: (state, previewCells) => {
      state.previewCells = previewCells
    }
  },
  actions: {
    initializeGrid: (store, payload = {}) => {
      const gridSizeX = payload.gridSizeX || store.state.gridSizeX
      const gridSizeY = payload.gridSizeY || store.state.gridSizeY
      
      store.commit(MUTATIONS.SET_GRID_SIZE, { gridSizeX, gridSizeY })
      
      const grid = Array(gridSizeY)
        .fill(null)
        .map(() => Array(gridSizeX).fill(null))
      store.commit(MUTATIONS.SET_GRID, grid)
    },
    
    setSelectedShape: (store, shape) => {
      store.commit(MUTATIONS.SET_SELECTED_SHAPE, shape)
    },
    
    setGameMode: (store, mode) => {
      store.commit(MUTATIONS.SET_GAME_MODE, mode)
    },
    
    addShape: (store, payload) => {
      const gridSizeX = payload.gridSizeX || store.state.gridSizeX
      const gridSizeY = payload.gridSizeY || store.state.gridSizeY
      
      const cellsToFill = []
      for (const part of payload.shape.layout) {
        const targetRow = payload.startRow + part.y
        const targetCol = payload.startCol + part.x
        cellsToFill.push({ row: targetRow, col: targetCol })
      }
      
      store.commit(MUTATIONS.ADD_SHAPE, {
        cells: cellsToFill,
        shapeId: store.state.nextShapeId,
        shapeType: payload.shape.type,
        color: payload.shape.color
      })
    },
    
    removeShape: (store, payload) => {
      const gridSizeX = payload.gridSizeX || store.state.gridSizeX
      const gridSizeY = payload.gridSizeY || store.state.gridSizeY
      
      store.commit(MUTATIONS.REMOVE_SHAPE, {
        shapeId: payload.shapeId,
        gridSizeX,
        gridSizeY
      })
    },
    
    updatePreview: (store, payload) => {
      if (!store.state.selectedShape) {
        store.commit(MUTATIONS.SET_PREVIEW_CELLS, [])
        return
      }
      
      const gridSizeX = payload.gridSizeX || store.state.gridSizeX
      const gridSizeY = payload.gridSizeY || store.state.gridSizeY
      
      const shapeLayout = store.state.selectedShape.layout
      const preview = []
      
      for (const part of shapeLayout) {
        const targetRow = payload.row + part.y
        const targetCol = payload.col + part.x
        
        preview.push({ row: targetRow, col: targetCol})
      }
      
      store.commit(MUTATIONS.SET_PREVIEW_CELLS, preview)
    },
    
    clearPreview: (store) => {
      store.commit(MUTATIONS.SET_PREVIEW_CELLS, [])
    }
  }
})