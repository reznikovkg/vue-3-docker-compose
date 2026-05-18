const STORAGE_KEY = 'compose-pair-game'
const GRID_SIZE = 8
const START_ITEMS_COUNT = 6
export const ACTIONS = {
  INIT_GAME: 'INIT_GAME',
  ADD_RANDOM_ITEM: 'ADD_RANDOM_ITEM',
  MERGE_ITEMS: 'MERGE_ITEMS',
  RESET_GAME: 'RESET_GAME',
  SET_SELECTED_CELL: 'SET_SELECTED_CELL',
}
export const MUTATIONS = {
  SET_GRID: 'SET_GRID',
  SET_SCORE: 'SET_SCORE',
  SET_SELECTED_CELL: 'SET_SELECTED_CELL',
}
const ITEM_TYPES = [
  {
    level: 1,
    name: 'Капля',
    emoji: '💧',
    score: 10,
  },
  {
    level: 2,
    name: 'Лёд',
    emoji: '🧊',
    score: 25,
  },
  {
    level: 3,
    name: 'Росток',
    emoji: '🌱',
    score: 40,
  },
  {
    level: 4,
    name: 'Дерево',
    emoji: '🌳',
    score: 60,
  }
]
const createEmptyGrid = () => {
  return Array.from({ length: GRID_SIZE }, () => {
    return Array.from({ length: GRID_SIZE }, () => null)
  })
}
const getRandomNumber = (max) => {
  return Math.floor(Math.random() * max)
}
const getEmptyCells = (grid) => {
  const cells = []
  grid.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      if (!cell) {
        cells.push({
          row: rowIndex,
          column: columnIndex,
        })
      }
    })
  })
  return cells
}
const saveToStorage = (payload) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}
const loadFromStorage = () => {
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) {
    return null
  }
  return JSON.parse(data)
}
const generateRandomItem = () => {
  return {
    level: 1,
    ...ITEM_TYPES[0],
  }
}
const addRandomItemToGrid = (grid) => {
  const emptyCells = getEmptyCells(grid)
  if (!emptyCells.length) {
    return grid
  }
  const randomCell = emptyCells[getRandomNumber(emptyCells.length)]
  grid[randomCell.row][randomCell.column] = generateRandomItem()
  return grid
}
export default {
  namespaced: true,
  state () {
    return {
      grid: createEmptyGrid(),
      score: 0,
      selectedCell: null,
      gridSize: GRID_SIZE,
    }
  },
  getters: {
    getGrid: (state) => state.grid,
    getScore: (state) => state.score,
    getGridSize: (state) => state.gridSize,
    getSelectedCell: (state) => state.selectedCell,
  },
  mutations: {
    [MUTATIONS.SET_GRID]: (state, value) => {
      state.grid = value
    },

    [MUTATIONS.SET_SCORE]: (state, value) => {
      state.score = value
    },

    [MUTATIONS.SET_SELECTED_CELL]: (state, value) => {
      state.selectedCell = value
    },
  },
  actions: {
    [ACTIONS.INIT_GAME]: ({ commit, dispatch }) => {
      const savedData = loadFromStorage()
      if (savedData) {
        commit(MUTATIONS.SET_GRID, savedData.grid)
        commit(MUTATIONS.SET_SCORE, savedData.score)
        return
      }
      const grid = createEmptyGrid()
      for (let index = 0; index < START_ITEMS_COUNT; index += 1) {
        addRandomItemToGrid(grid)
      }
      commit(MUTATIONS.SET_GRID, grid)
      dispatch('saveGame')
    },
    saveGame: ({ state }) => {
      saveToStorage({
        grid: state.grid,
        score: state.score,
      })
    },
    [ACTIONS.ADD_RANDOM_ITEM]: ({ state, commit, dispatch }) => {
      const grid = JSON.parse(JSON.stringify(state.grid))
      addRandomItemToGrid(grid)
      commit(MUTATIONS.SET_GRID, grid)
      dispatch('saveGame')
    },
    [ACTIONS.MERGE_ITEMS]: ({ state, commit, dispatch }, payload) => {
      const {
        fromRow,
        fromColumn,
        toRow,
        toColumn,
      } = payload
      const grid = JSON.parse(JSON.stringify(state.grid))
      const sourceItem = grid[fromRow][fromColumn]
      const targetItem = grid[toRow][toColumn]
      if (!sourceItem || !targetItem) {
        return
      }
      if (sourceItem.level !== targetItem.level) {
        return
      }
      const nextLevel = sourceItem.level + 1
      const nextItem = ITEM_TYPES.find((item) => {
        return item.level === nextLevel
      })
      if (!nextItem) {
        return
      }
      grid[fromRow][fromColumn] = null
      grid[toRow][toColumn] = {
        ...nextItem,
      }
      commit(MUTATIONS.SET_GRID, grid)
      commit(MUTATIONS.SET_SCORE, state.score + nextItem.score)
      dispatch('saveGame')
    },
    [ACTIONS.SET_SELECTED_CELL]: ({ commit }, payload) => {
      commit(MUTATIONS.SET_SELECTED_CELL, payload)
    },
    [ACTIONS.RESET_GAME]: ({ commit, dispatch }) => {
      localStorage.removeItem(STORAGE_KEY)
      const grid = createEmptyGrid()
      for (let index = 0; index < START_ITEMS_COUNT; index += 1) {
        addRandomItemToGrid(grid)
      }
      commit(MUTATIONS.SET_GRID, grid)
      commit(MUTATIONS.SET_SCORE, 0)
      commit(MUTATIONS.SET_SELECTED_CELL, null)
      dispatch('saveGame')
    },
  },
}