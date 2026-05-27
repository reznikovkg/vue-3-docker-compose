const STORAGE_KEY = 'compose-pair-game'
const START_ITEMS_COUNT = 6
const START_SCORE = 100
const ADD_ITEM_COST = 5
const FINAL_ITEM_COST = 1
const DEFAULT_GRID_SIZE = 8
const GRID_SIZE = DEFAULT_GRID_SIZE
export const ACTIONS = {
  INIT_GAME: 'INIT_GAME',
  ADD_RANDOM_ITEM: 'ADD_RANDOM_ITEM',
  MERGE_ITEMS: 'MERGE_ITEMS',
  RESET_GAME: 'RESET_GAME',
  SET_SELECTED_CELL: 'SET_SELECTED_CELL',
  SELL_ITEM: 'SELL_ITEM',
  USE_FINAL_ITEM: 'USE_FINAL_ITEM',
  EXPAND_GRID: 'EXPAND_GRID',
}
export const MUTATIONS = {
  SET_GRID: 'SET_GRID',
  SET_SCORE: 'SET_SCORE',
  SET_SELECTED_CELL: 'SET_SELECTED_CELL',
  SET_GRID_SIZE: 'SET_GRID_SIZE',
}
const ITEM_TYPES = [
  {
    branch: 'water',
    level: 1,
    name: 'Капля',
    emoji: '💧',
  },
  {
    branch: 'water',
    level: 2,
    name: 'Лёд',
    emoji: '🧊',
  },
  {
    branch: 'water',
    level: 3,
    name: 'Росток',
    emoji: '🌱',
  },
  {
    branch: 'water',
    level: 4,
    name: 'Дерево',
    emoji: '🌳',
    final: true,
    usesLeft: 6,
    used: false,
  },
  {
    branch: 'magic',
    level: 1,
    name: 'Искра',
    emoji: '✨',
  },
  {
    branch: 'magic',
    level: 2,
    name: 'Шар',
    emoji: '🔮',
  },
  {
    branch: 'magic',
    level: 3,
    name: 'Корона',
    emoji: '👑',
  },
  {
    branch: 'magic',
    level: 4,
    name: 'Планета',
    emoji: '🪐',
    final: true,
    usesLeft: 6,
    used: false,
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
  const levelOneItems = ITEM_TYPES.filter((item) => {
    return item.level === 1
  })
  return {
    ...levelOneItems[getRandomNumber(levelOneItems.length)],
  }
}
const addRandomItemToGrid = (grid,item = null) => {
  const emptyCells = getEmptyCells(grid)
  if (!emptyCells.length) {
    return grid
  }
  const randomCell = emptyCells[getRandomNumber(emptyCells.length)]
  grid[randomCell.row][randomCell.column] = item || generateRandomItem()
  return grid
}
const createExpandedGrid = (grid,size) => {
  const nextGrid = Array.from({ length: size }, () => {
    return Array.from({ length: size }, () => null)
  })
  const offset = 1
  grid.forEach((row,rowIndex) => {
    row.forEach((cell,columnIndex) => {
      nextGrid[rowIndex + offset][columnIndex + offset] = cell
    })
  })
  return nextGrid
}
export default {
  namespaced: true,
  state () {
    return {
      grid: createEmptyGrid(),
      score: START_SCORE,
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
    [MUTATIONS.SET_GRID_SIZE]: (state, value) => {
      state.gridSize = value
    },
  },
  actions: {
    [ACTIONS.INIT_GAME]: ({ commit, dispatch }) => {
      const savedData = loadFromStorage()
      if (savedData) {
        commit(MUTATIONS.SET_GRID, savedData.grid)
        commit(MUTATIONS.SET_SCORE, savedData.score)
        commit(MUTATIONS.SET_GRID_SIZE, savedData.gridSize || GRID_SIZE)
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
        gridSize: state.gridSize,
      })
    },
    [ACTIONS.ADD_RANDOM_ITEM]: ({ state, commit, dispatch }) => {
      if (state.score < ADD_ITEM_COST) {
        return
      }
      const grid = JSON.parse(JSON.stringify(state.grid))
      addRandomItemToGrid(grid)
      commit(MUTATIONS.SET_GRID, grid)
      commit(MUTATIONS.SET_SCORE, state.score - ADD_ITEM_COST)
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
      if (
        sourceItem.level !== targetItem.level
        || sourceItem.branch !== targetItem.branch
      ) {
        return
      }
      const nextLevel = sourceItem.level + 1
      const nextItem = ITEM_TYPES.find((item) => {
        return item.level === nextLevel
        && item.branch === sourceItem.branch
      })
      if (!nextItem) {
        return
      }
      grid[fromRow][fromColumn] = null
      grid[toRow][toColumn] = {
        ...nextItem,
      }
      commit(MUTATIONS.SET_GRID, grid)
      commit(MUTATIONS.SET_SCORE, state.score + (sourceItem.level*5))
      dispatch('saveGame')
    },
    [ACTIONS.SELL_ITEM]: ({ state, commit, dispatch }, payload) => {
      const grid = JSON.parse(JSON.stringify(state.grid))
      const item = grid[payload.row][payload.column]
      if (!item) {
        return
      }
      if (!item.final) {
        return
      }
      if (item.used) {
        return
      }
      grid[payload.row][payload.column] = null
      commit(MUTATIONS.SET_GRID, grid)
      commit(MUTATIONS.SET_SCORE, state.score + ((item.level - 1) * 10))
      dispatch('saveGame')
    },
    [ACTIONS.USE_FINAL_ITEM]: ({ state, commit, dispatch }, payload) => {
      if (state.score < FINAL_ITEM_COST) {
        return
      }
      const grid = JSON.parse(JSON.stringify(state.grid))
      const item = grid[payload.row][payload.column]
      if (!item?.final) {
        return
      }
      if (item.usesLeft <= 0) {
        grid[payload.row][payload.column] = null
        commit(MUTATIONS.SET_GRID, grid)
        dispatch('saveGame')
        return
      }
      const startItem = ITEM_TYPES.find((gridItem) => {
        return gridItem.branch === item.branch
        && gridItem.level === 1
      })
      addRandomItemToGrid(grid,startItem)
      const finalItem = grid[payload.row][payload.column]
      finalItem.usesLeft -= 1
      finalItem.used = true
      if (finalItem.usesLeft <= 0) {
        grid[payload.row][payload.column] = null
      }
      commit(MUTATIONS.SET_GRID, grid)
      commit(MUTATIONS.SET_SCORE, state.score - FINAL_ITEM_COST)
      dispatch('saveGame')
    },
    [ACTIONS.SET_SELECTED_CELL]: ({ commit }, payload) => {
      commit(MUTATIONS.SET_SELECTED_CELL, payload)
    },
    [ACTIONS.EXPAND_GRID]: ({ state, commit, dispatch }) => {
      const nextLevel = Math.floor((state.gridSize - DEFAULT_GRID_SIZE) / 2)
      const requiredScore = 200 * (10 ** nextLevel)
      const expandCost = 100 * (10 ** nextLevel)
      if (state.score < requiredScore) {
        return
      }
      const nextSize = state.gridSize + 2
      const nextGrid = createExpandedGrid(
        state.grid,
        nextSize
      )
      commit(MUTATIONS.SET_GRID,nextGrid)
      commit(MUTATIONS.SET_GRID_SIZE,nextSize)
      commit(
        MUTATIONS.SET_SCORE,
        state.score - expandCost
      )
      dispatch('saveGame')
    },
    [ACTIONS.RESET_GAME]: ({ commit, dispatch }) => {
      localStorage.removeItem(STORAGE_KEY)
      const grid = createEmptyGrid()
      for (let index = 0; index < START_ITEMS_COUNT; index += 1) {
        addRandomItemToGrid(grid)
      }
      commit(MUTATIONS.SET_GRID, grid)
      commit(MUTATIONS.SET_SCORE, START_SCORE)
      commit(MUTATIONS.SET_SELECTED_CELL, null)
      commit(MUTATIONS.SET_GRID_SIZE, GRID_SIZE)
      dispatch('saveGame')
    },
  },
}