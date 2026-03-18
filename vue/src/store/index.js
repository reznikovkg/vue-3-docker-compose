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
const BUY_COST = 10         
const MAX_LEVEL = 4 
const INITIAL_GRID_SIZE = 3
const EXPAND_COST_BASE = 100
const EXPAND_SCORE_BASE = 200

export default createStore({
  state: {
    gridSize: INITIAL_GRID_SIZE,
    grid: [],
    score: INITIAL_SCORE,    
    maxLevel: MAX_LEVEL,   
    buyCost: BUY_COST,
    expandLevel: 0,
    draggedItem: null,
    itemsMerged: 0,
    noSpaceCount: 0
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
    },
    setExpandLevel (state, level) {
      state.expandLevel = level
    },
    setDraggedItem (state, item) {
      state.draggedItem = item
    },
    setItemsMerged (state, count) {
      state.itemsMerged = count
    },
    setNoSpaceCount (state, count) {
      state.noSpaceCount = count
    }
  },
  actions: {
    createEmptyGrid({ state, commit }) {
      const totalCells = state.gridSize * state.gridSize
      const grid = Array(totalCells).fill(null) 
      commit('setGrid', grid)
    },
    addRandomItem({ commit, state }) {
      const emptyCells = []
      state.grid.forEach((cell, index) => {
        if (!cell) emptyCells.push(index)
      })
      if (!emptyCells.length) return
      const index = emptyCells[Math.floor(Math.random() * emptyCells.length)]
      const keys = Object.keys(BRANCHES)
      const branch = keys[Math.floor(Math.random() * keys.length)]
      commit('updateCell', { index, value: { branch, level: 0 } })
    },
    addMultipleRandomItems ({ state, commit, dispatch }, count) {
      for (let i = 0; i < count; i++) {
        const emptyCells = []
        state.grid.forEach((cell, index) => {
          if (!cell) emptyCells.push(index)
        })
        if (!emptyCells.length) break
          const index = emptyCells[Math.floor(Math.random() * emptyCells.length)]
          const keys = Object.keys(BRANCHES)
          const branch = keys[Math.floor(Math.random() * keys.length)]
          commit('updateCell', { index, value: { branch, level: 0 } })
        } 
      dispatch('saveGame')
    },
    newGame({ dispatch, commit }) {
      commit('setExpandLevel', 0)
      commit('setGridSize', INITIAL_GRID_SIZE)
      commit('setScore', INITIAL_SCORE)
      commit('setItemsMerged', 0)
      commit('setNoSpaceCount', 0)
      dispatch('createEmptyGrid')
      dispatch('addMultipleRandomItems', 5)
    },
    handleDragStart ({ commit }, data) {
      commit('setDraggedItem', {
        index: data.index,
        level: data.cell.level,
        branch: data.cell.branch
      })
    },
    handleDrop ({ state, commit, dispatch }, targetIndex) {
      if (!state.draggedItem) return
      const sourceIndex = state.draggedItem.index
      if (sourceIndex === targetIndex) {
        commit('setDraggedItem', null)
        return
      }
      const newGrid = [...state.grid]
      const sourceItem = newGrid[sourceIndex]
      const targetItem = newGrid[targetIndex]
      if (!targetItem) {
        newGrid[targetIndex] = { ...sourceItem }
        newGrid[sourceIndex] = null
      } else if (
        sourceItem.level === targetItem.level &&
        sourceItem.branch === targetItem.branch &&
        sourceItem.level < state.maxLevel
      ) {
        const newLevel = sourceItem.level + 1
        commit('addScore', newLevel * 10)
        commit('setItemsMerged', state.itemsMerged + 1)
        newGrid[targetIndex] = { branch: sourceItem.branch, level: newLevel }
        newGrid[sourceIndex] = null
      } else {
        const temp = { ...newGrid[sourceIndex] }
        newGrid[sourceIndex] = { ...newGrid[targetIndex] }
        newGrid[targetIndex] = temp
      }
      commit('setGrid', newGrid)
      commit('setDraggedItem', null)
      dispatch('saveGame')
    },
    saveGame({ state }) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        grid: state.grid,
        score: state.score,
        gridSize: state.gridSize,
        expandLevel: state.expandLevel,
        itemsMerged: state.itemsMerged,
        noSpaceCount: state.noSpaceCount
      }))
    },
    loadGame({ dispatch, commit}) {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        commit('setGridSize', data.gridSize || INITIAL_GRID_SIZE)
        commit('setGrid', data.grid || [])
        commit('setScore', data.score || INITIAL_SCORE)
        commit('setExpandLevel', data.expandLevel || 0)
        commit('setItemsMerged', data.itemsMerged || 0)
        commit('setNoSpaceCount', data.noSpaceCount || 0)
      } else {
        dispatch('newGame')
      }
    },
    buyItem ({ state, dispatch, commit }) {
      if (state.score < state.buyCost) return 
      const emptyCells = []
      state.grid.forEach((cell, index) => {
        if (!cell) emptyCells.push(index)
      })
      if (!emptyCells.length) return
      commit('subtractScore', state.buyCost)
      const index = emptyCells[Math.floor(Math.random() * emptyCells.length)]
      const keys = Object.keys(BRANCHES)
      const branch = keys[Math.floor(Math.random() * keys.length)]
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
    spawnFromMax ({ state, commit, dispatch }, index) {
      const cell = state.grid[index]
      if (!cell || cell.level < state.maxLevel) return
      if (state.score < 5) return
      const emptyCells = []
      state.grid.forEach((c, i) => {
        if (!c) emptyCells.push(i)
      })      
      if (!emptyCells.length) return
      commit('subtractScore', 5)
      const newIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)]      
      commit('updateCell', { index: newIndex, value: { branch: cell.branch, level: 0 } })
      dispatch('saveGame')
    },
    expandGrid ({ state, commit, dispatch }) {
      const expandCost = EXPAND_COST_BASE * Math.pow(10, state.expandLevel)
      if (state.score < expandCost) return
      const oldSize = state.gridSize
      const newSize = oldSize + 2
      const oldGrid = [...state.grid]
      const newGrid = Array(newSize * newSize).fill(null)
      oldGrid.forEach((cell, oldIndex) => {
        const oldRow = Math.floor(oldIndex / oldSize)
        const oldCol = oldIndex % oldSize
        const newIndex = (oldRow + 1) * newSize + (oldCol + 1)
        newGrid[newIndex] = cell
      })
      commit('subtractScore', expandCost)
      commit('setExpandLevel', state.expandLevel + 1)
      commit('setGridSize', newSize)
      commit('setGrid', newGrid)
      dispatch('saveGame')
    }
  },
  getters: {
    expandCost: state => EXPAND_COST_BASE * Math.pow(10, state.expandLevel),
    expandScoreRequired: state => EXPAND_SCORE_BASE * Math.pow(10, state.expandLevel),
    cellImage: () => (branch, level) => BRANCHES[branch]?.levels[level] ?? '?' 
  }
})