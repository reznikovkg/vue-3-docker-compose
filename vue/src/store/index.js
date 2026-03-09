import { createStore } from 'vuex'
const STORAGE_KEY = 'mergeGame'

const BRANCHES = {
  spring: {
    name: 'Весна',
    color: '#e74c3c',
    levels: [
      '/images/s1.jpg',
      '/images/s2.jpg',
      '/images/s3.jpg',
      '/images/s4.jpg',
      '/images/s5.jpg'
    ]
  },
  fruits: {
    name: 'Фрукты',
    color: '#3498db',
    levels: [
      '/images/1.jpg',
      '/images/2.jpg',
      '/images/3.jpg',
      '/images/4.jpg',
      '/images/5.jpg'
    ]
  }
}

const INITIAL_SCORE = 100
const BUY_COST = 3         
const MAX_LEVEL = 4 

export default createStore({
  state: {
    gridSize: 8,
    grid: [],
    score: INITIAL_SCORE,
    branches: BRANCHES,    
    maxLevel: MAX_LEVEL,   
    buyCost: BUY_COST
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
    },
    addScore (state, amount) {    
      state.score += amount    
    },               
    subtractScore (state, amount) { 
      state.score -= amount
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
          emptyCells.push(index)
        }
      })
      return emptyCells
    },
    addRandomItem({ dispatch, commit, state }) {
      const emptyCells = dispatch('findEmptyCells')
      if (emptyCells.length > 0) {
        const index = emptyCells[Math.floor(Math.random() * emptyCells.length)]
        const branch = dispatch('getRandomBranch')
        commit('updateCell', { index, value: { branch, level: 0 } })
      }
    },
    newGame({ dispatch, commit }) {
      dispatch('createEmptyGrid')
      commit('setScore', INITIAL_SCORE)
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
    loadGame({ dispatch, commit}) {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        commit('setGridSize', data.gridSize || 8)
        commit('setGrid', data.grid || [])
        commit('setScore', data.score || 0)
      } else {
        dispatch('newGame')
      }
    },
    getRandomBranch () {
      const keys = Object.keys(BRANCHES)
      return keys[Math.floor(Math.random() * keys.length)]
    },
    buyItem ({ state, dispatch, commit }) {
      if (state.score < state.buyCost) return false
      const emptyCells = dispatch('findEmptyCells')
      if (!emptyCells.length) return false
      commit('subtractScore', state.buyCost)
      const index = emptyCells[Math.floor(Math.random() * emptyCells.length)]
      const branch = dispatch('getRandomBranch')
      commit('updateCell', { index, value: { branch, level: 0 } })
      dispatch('saveGame')
      return true
    },
    sellItem ({ state, commit, dispatch }, index) {
      const cell = state.grid[index]
      if (!cell) return
      const sellPrice = (cell.level + 1) * 10
      commit('addScore', sellPrice)
      commit('updateCell', { index, value: null })
      dispatch('saveGame')
    },
    spawnFromMaxLevel ({ state, commit, dispatch }, index) {
      const cell = state.grid[index]
      if (!cell || cell.level < state.maxLevel) return
      const emptyCells = dispatch('findEmptyCells')
      if (!emptyCells.length) return
      const newIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)]
      commit('updateCell', { index: newIndex, value: { branch: cell.branch, level: 0 } })
      dispatch('saveGame')
    },
    mergeItems ({ state, commit, dispatch }, { fromIndex, toIndex }) {
      const from = state.grid[fromIndex]
      const to = state.grid[toIndex]
      if (
        !from || !to ||
        from.branch !== to.branch ||
        from.level !== to.level ||
        from.level >= state.maxLevel
      ) return false
      const newLevel = from.level + 1
      commit('addScore', newLevel)
      commit('updateCell', { index: toIndex, value: { branch: from.branch, level: newLevel } })
      commit('updateCell', { index: fromIndex, value: null })
      dispatch('saveGame')
      return true
    }
  },
  getters: {
    gridSize: state => state.gridSize,
    grid: state => state.grid,
    score: state => state.score,
    branches: state => state.branches,
    maxLevel: state => state.maxLevel,
    buyCost: state => state.buyCost,
    cellEmoji: state => (branch, level) => state.branches[branch]?.levels[level] ?? '?', 
  }
})