import { reactive } from 'vue'
const STORAGE_KEY = 'mergeGame'

const state = reactive({
  gridSize: 8,
  grid: [],
  score: 0
})

export default {
  install(app) {
    const createEmptyGrid = () => {
      return Array(state.gridSize).fill().map(
        () => Array(state.gridSize).fill(null)
      )
    }

    const findEmptyCells = () => {
      const empty = []
      for (let i = 0; i < state.gridSize; i++) {
        for (let j = 0; j < state.gridSize; j++) {
          if (!state.grid[i]?.[j]) empty.push({ row: i, col: j })
        }
      }
      return empty
    }

    const getRandomLevel = () => {
      const rand = Math.random()
      if (rand < 0.7) return 1
      if (rand < 0.9) return 2
      return 3
    }

    const addRandomItem = () => {
      const emptyCells = findEmptyCells()
      if (emptyCells.length > 0) {
        const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)]
        if (!state.grid[row]) state.grid[row] = []
        state.grid[row][col] = { level: getRandomLevel() }
      }
    }

    const newGame = () => {
      state.grid = createEmptyGrid()
      state.score = 0
      for (let i = 0; i < 5; i++) {
        addRandomItem() 
    }
  }

    const saveGame = () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        grid: state.grid,
        score: state.score,
        gridSize: state.gridSize
      }))
    }

    const loadGame = () => {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        state.gridSize = data.gridSize || 8
        state.grid = data.grid || createEmptyGrid()
        state.score = data.score || 0
      } else {
        newGame()  
      }
    }
    loadGame()
    const store = {
      gridSize: state.gridSize,
      grid: state.grid,
      score: state.score,
      addRandomItem, 
      newGame,
      saveGame,
      loadGame
    }
    app.provide('store', store)
    app.config.globalProperties.$store = store
  }
}