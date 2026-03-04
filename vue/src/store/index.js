import { createStore } from 'vuex'
const STORAGE_KEY = 'mergeGame'

export default createStore({
  state: {
    gridSize: 8,
    grid: [],
    score: 0
  },
 mutations: {
    setGridSize(state, size) {
      state.gridSize = size
    },
    setGrid(state, grid) {
      state.grid = grid
    },
    setScore(state, score) {
      state.score = score
    },
    updateCell(state, {index, value}) {
      state.grid[index] = value  
    }
  },
  actions: {
    createEmptyGrid({ state, commit }) {
      const totalCells = state.gridSize * state.gridSize
      const grid = Array(totalCells).fill(null) 
      commit('setGrid', grid)

    },
    findEmptyCells({ state }) {
      const emptyCells = []
      state.grid.forEach((cell, index) => { 
        if (!cell) {
          const row = Math.floor(index / state.gridSize)
          const col = index % state.gridSize
          emptyCells.push({ row, col, index })
        }
      })
      return emptyCells
    },
    getRandomLevel() {
      const rand = Math.random()
      if (rand < 0.7) return 1
      if (rand < 0.9) return 2
      return 3
    },
    addRandomItem({ dispatch, commit, state }) {
      const emptyCells = awaitdispatch('findEmptyCells')
      if (emptyCells.length > 0) {
        const { index } = emptyCells[Math.floor(Math.random() * emptyCells.length)] 
        const level = dispatch('getRandomLevel')
        commit('updateCell', { index, value: { level } })
      }
    },
    newGame({ dispatch, commit }) {
      dispatch('createEmptyGrid')
      commit('setScore', 0)
      for (let i = 0; i < 5; i++) {
        dispatch('addRandomItem')
      }
      dispatch('saveGame')
    },
    saveGame({ state }) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        grid: state.grid,
        score: state.score,
        gridSize: state.gridSize
      }))
    },
    loadGame({ dispatch, commit, state }) {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        commit('setGridSize', data.gridSize || 8)
        commit('setGrid', data.grid || [])
        commit('setScore', data.score || 0)
      } else {
        dispatch('newGame')
      }
    }
  },
  getters: {
    gridSize: state => state.gridSize,
    grid: state => state.grid,
    score: state => state.score
  }
})