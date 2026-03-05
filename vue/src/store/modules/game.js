const GRID_SIZE = 8
const INITIAL_ITEMS_COUNT = 7
const STORAGE_KEY = 'puzzleGameState'

const ITEM_ICONS = [
  'seedling',
  'leaf',
  'clover',
  'tree',
  'pine-tree',
  'mountain',
  'volcano',
  'star',
  'gem',
  'crown'
]

const SPAWN_PROBABILITIES = [
{ level: 1, probability: 0.70 },
{ level: 2, probability: 0.20 },
{ level: 3, probability: 0.10 }
]

const state = () => ({
  gridSize: GRID_SIZE,
  grid: Array(GRID_SIZE * GRID_SIZE).fill(null),
  score: 0,
  moves: 0,
  gameOver: false,
  message: '',
  messageType: 'info',
  itemIcons: ITEM_ICONS,
  spawnProbabilities: SPAWN_PROBABILITIES
})

const getters = {
isFull: (state) => {
    return state.grid.every(cell => cell !== null)
  },

emptyCells: (state) => {
    return state.grid
      .map((cell, index) => cell === null ? index : null)
      .filter(index => index !== null)
  },

getItemIcon: (state) => (level) => {
    return state.itemIcons[Math.min(level - 1, state.itemIcons.length - 1)]
  },

getCell: (state) => (index) => {
    return state.grid[index]
  },

gameStats: (state) => {
    return {
      score: state.score,
      moves: state.moves,
      occupiedCells: state.grid.filter(cell => cell !== null).length,
      totalCells: state.grid.length
    }
  }
}

const mutations = {
SET_CELL: (state, { index, value }) => {
    state.grid[index] = value
  },

CLEAR_CELL: (state, index) => {
    state.grid[index] = null
  },

SET_GRID: (state, grid) => {
    state.grid = grid
  },

ADD_SCORE: (state, points) => {
    state.score += points
  },

SET_SCORE: (state, score) => {
    state.score = score
  },

INCREMENT_MOVES: (state) => {
    state.moves++
  },

SET_MOVES: (state, moves) => {
    state.moves = moves
  },

SET_GAME_OVER: (state, value) => {
    state.gameOver = value
  },

SET_MESSAGE: (state, { text, type }) => {
    state.message = text
    state.messageType = type
  },

CLEAR_MESSAGE: (state) => {
    state.message = ''
    state.messageType = 'info'
  },

SET_CELL_NEW: (state, { index, isNew }) => {
    if (state.grid[index]) {
      state.grid[index].isNew = isNew
    }
  },

RESET_GAME: (state) => {
    state.grid = Array(GRID_SIZE * GRID_SIZE).fill(null)
    state.score = 0
    state.moves = 0
    state.gameOver = false
    state.message = ''
    state.messageType = 'info'
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations
}