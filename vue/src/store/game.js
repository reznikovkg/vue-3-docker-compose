export const MUTATIONS = {
  SET_PLAYER_INDEX: 'SET_PLAYER_INDEX',
  SET_DIRECTION: 'SET_DIRECTION',
  SET_LAST_KEY: 'SET_LAST_KEY',
  SET_GAME_STATUS: 'SET_GAME_STATUS',
  SET_CURRENT_TIME: 'SET_CURRENT_TIME',
  INCREMENT_TREE_COUNT: 'INCREMENT_TREE_COUNT',
  RESET_GAME: 'RESET_GAME',
  COLLECT_TREE: 'COLLECT_TREE',
  SET_TIMER_INTERVAL: 'SET_TIMER_INTERVAL',
  SET_CLOUD_INDEX: 'SET_CLOUD_INDEX',
  SET_CLOUD_DIRECTION: 'SET_CLOUD_DIRECTION',
  SET_GAME_OVER: 'SET_GAME_OVER',
  REMOVE_SPARK: 'REMOVE_SPARK',
  SET_SPARKS: 'SET_SPARKS',
  SET_LAST_SHOT_TIME: 'SET_LAST_SHOT_TIME'
}
// 0 - empty, 1 - tree, 2 - wall
const getInitialGrid = () => [
  { t: 0 }, { t: 1 }, { t: 1 }, { t: 1 }, { t: 1 }, { t: 1 }, { t: 2 }, { t: 1 }, { t: 2 }, { t: 2 },
  { t: 2 }, { t: 2 }, { t: 1 }, { t: 2 }, { t: 2 }, { t: 1 }, { t: 2 }, { t: 1 }, { t: 1 }, { t: 1 },
  { t: 1 }, { t: 1 }, { t: 1 }, { t: 1 }, { t: 2 }, { t: 1 }, { t: 2 }, { t: 1 }, { t: 2 }, { t: 1 },
  { t: 1 }, { t: 2 }, { t: 2 }, { t: 1 }, { t: 2 }, { t: 1 }, { t: 1 }, { t: 1 }, { t: 2 }, { t: 1 },
  { t: 1 }, { t: 1 }, { t: 1 }, { t: 1 }, { t: 2 }, { t: 2 }, { t: 1 }, { t: 2 }, { t: 2 }, { t: 1 },
  { t: 2 }, { t: 2 }, { t: 2 }, { t: 1 }, { t: 1 }, { t: 1 }, { t: 1 }, { t: 1 }, { t: 1 }, { t: 1 },
  { t: 1 }, { t: 1 }, { t: 1 }, { t: 1 }, { t: 2 }, { t: 1 }, { t: 2 }, { t: 2 }, { t: 2 }, { t: 2 },
  { t: 2 }, { t: 1 }, { t: 2 }, { t: 1 }, { t: 2 }, { t: 1 }, { t: 1 }, { t: 1 }, { t: 1 }, { t: 1 },
  { t: 1 }, { t: 1 }, { t: 2 }, { t: 1 }, { t: 1 }, { t: 1 }, { t: 2 }, { t: 1 }, { t: 2 }, { t: 1 },
  { t: 2 }, { t: 1 }, { t: 1 }, { t: 1 }, { t: 2 }, { t: 1 }, { t: 1 }, { t: 1 }, { t: 1 }, { t: 1 }
]
export default {
  namespaced: true,
  state: {
    grid: getInitialGrid(),
    playerIndex: 0,
    direction: 'right',
    lastKey: null,
    gameStatus: 'paused',
    currentTime: 0,
    treeCount: 0,
    rows: 10,
    cols: 10,
    timerInterval: null,
    cloudIndex: null,
    cloudDirection: null,
    gameOver: false,
    sparks: [],
    lastShotTime: 0
  },
  getters: {
    getGrid: (state) => state.grid,
    getPlayerIndex: (state) => state.playerIndex,
    getDirection: (state) => state.direction,
    getGameStatus: (state) => state.gameStatus,
    getCurrentTime: (state) => state.currentTime,
    getTreeCount: (state) => state.treeCount,
    getRemainingTrees: (state) => state.grid.filter(cell => cell.t === 1).length,
    getTotalTrees: (state) => state.grid.filter(cell => cell.t === 1).length,
    getRows: (state) => state.rows,
    getCols: (state) => state.cols,
    isGameActive: (state) => state.gameStatus === 'active',
    getCloudIndex: (state) => state.cloudIndex,
    getCloudDirection: (state) => state.cloudDirection,
    isGameOver: (state) => state.gameOver,
    getSparks: (state) => state.sparks,
    getLastShotTime: (state) => state.lastShotTime
  },
  mutations: {
    [MUTATIONS.SET_PLAYER_INDEX](state, index) {
      if (index >= 0 && index < state.rows * state.cols) {
        state.playerIndex = index
      }
    },
    [MUTATIONS.SET_DIRECTION](state, direction) {
      if (['up', 'down', 'left', 'right'].includes(direction)) {
        state.direction = direction
      }
    },
    [MUTATIONS.SET_LAST_KEY](state, key) {
      if (key === null || ['up', 'down', 'left', 'right'].includes(key)) {
        state.lastKey = key
      }
    },
    [MUTATIONS.SET_GAME_STATUS](state, status) {
      if (['active', 'paused', 'win', 'lose'].includes(status)) {
        state.gameStatus = status
      }
    },
    [MUTATIONS.SET_CURRENT_TIME](state, time) {
      state.currentTime = time
    },
    [MUTATIONS.INCREMENT_TREE_COUNT](state) {
      state.treeCount++
    },
    [MUTATIONS.RESET_GAME](state) {
      if (state.timerInterval) {
        clearInterval(state.timerInterval)
        state.timerInterval = null
      }
      state.grid = getInitialGrid()
      state.playerIndex = 0
      state.direction = 'right'
      state.lastKey = null
      state.gameStatus = 'paused'
      state.currentTime = 0
      state.treeCount = 0
    },
    [MUTATIONS.COLLECT_TREE](state, index) {
      if (state.grid[index].t === 1) {
        const newGrid = state.grid.map((cell, i) => 
          i === index ? { t: 0 } : cell
        )
        state.grid = newGrid
        state.treeCount++
      }
    },
    [MUTATIONS.SET_TIMER_INTERVAL](state, interval) {
      state.timerInterval = interval
    },
        [MUTATIONS.SET_CLOUD_INDEX](state, index) {
      if (index === null || (index >= 0 && index < state.rows * state.cols)) {
        state.cloudIndex = index
      }
    },
    [MUTATIONS.SET_CLOUD_DIRECTION](state, direction) {
      if (direction === null || ['up', 'down', 'left', 'right'].includes(direction)) {
        state.cloudDirection = direction
      }
    },
    [MUTATIONS.SET_GAME_OVER](state, value) {
      state.gameOver = value
    },
    [MUTATIONS.SET_SPARKS](state, sparks) {
      state.sparks = sparks
    },
    [MUTATIONS.SET_LAST_SHOT_TIME](state, time) {
      state.lastShotTime = time
    },
    [MUTATIONS.REMOVE_SPARK](state, sparkId) {
      state.sparks = state.sparks.filter(s => s.id !== sparkId)
    }
  },
  actions: {
    setPlayerIndex({ commit }, index) {
      return new Promise((resolve) => {
        commit(MUTATIONS.SET_PLAYER_INDEX, index)
        resolve()
      })
    },
    setDirection({ commit }, direction) {
      return new Promise((resolve) => {
        commit(MUTATIONS.SET_DIRECTION, direction)
        resolve()
      })
    },
    setLastKey({ commit }, key) {
      return new Promise((resolve) => {
        commit(MUTATIONS.SET_LAST_KEY, key)
        resolve()
      })
    },
    setGameStatus({ commit, state }, status) {
      return new Promise((resolve) => {
        commit(MUTATIONS.SET_GAME_STATUS, status)
        if (status === 'active') {
          if (!state.timerInterval) {
            const interval = setInterval(() => {
              commit(MUTATIONS.SET_CURRENT_TIME, state.currentTime + 1)
            }, 1000)
            commit(MUTATIONS.SET_TIMER_INTERVAL, interval)
          }
        } else {
          if (state.timerInterval) {
            clearInterval(state.timerInterval)
            commit(MUTATIONS.SET_TIMER_INTERVAL, null)
          }
        }
        resolve()
      })
    },
    setCurrentTime({ commit }, time) {
      return new Promise((resolve) => {
        commit(MUTATIONS.SET_CURRENT_TIME, time)
        resolve()
      })
    },
    collectTree({ commit, getters, state }, index) {
      return new Promise((resolve) => {
        commit(MUTATIONS.COLLECT_TREE, index)
        const remainingTrees = getters.getRemainingTrees
        if (remainingTrees === 0) {
          setTimeout(() => {
            if (state.timerInterval) {
              clearInterval(state.timerInterval)
              commit(MUTATIONS.SET_TIMER_INTERVAL, null)
            }
            commit(MUTATIONS.SET_GAME_STATUS, 'win')
            resolve()
          }, 200)
        } else {
          resolve()
        }
      })
    },
    resetGame({ commit, state }) {
      return new Promise((resolve) => {
        if (state.timerInterval) {
          clearInterval(state.timerInterval)
          commit(MUTATIONS.SET_TIMER_INTERVAL, null)
        }
        commit(MUTATIONS.RESET_GAME)
        commit(MUTATIONS.SET_CLOUD_INDEX, null)
        commit(MUTATIONS.SET_CLOUD_DIRECTION, null)
        commit(MUTATIONS.SET_GAME_OVER, false)
        commit(MUTATIONS.SET_SPARKS, [])
        commit(MUTATIONS.SET_LAST_SHOT_TIME, 0)
        resolve()
      })
    },
        setCloudIndex({ commit }, index) {
      return new Promise((resolve) => {
        commit(MUTATIONS.SET_CLOUD_INDEX, index)
        resolve()
      })
    },
    setCloudDirection({ commit }, direction) {
      return new Promise((resolve) => {
        commit(MUTATIONS.SET_CLOUD_DIRECTION, direction)
        resolve()
      })
    },
    setGameOver({ commit, state }, value) {
      return new Promise((resolve) => {
        if (value === true) {
          if (state.timerInterval) {
            clearInterval(state.timerInterval)
            commit(MUTATIONS.SET_TIMER_INTERVAL, null)
          }
        }
        commit(MUTATIONS.SET_GAME_OVER, value)
        resolve()
      })
    },
    initCloud({ commit, state }) {
    return new Promise((resolve) => {
    try {
      if (!state.grid || !Array.isArray(state.grid)) {
        console.warn('Grid is not available for cloud initialization')
        commit(MUTATIONS.SET_CLOUD_INDEX, null)
        commit(MUTATIONS.SET_CLOUD_DIRECTION, null)
        resolve()
        return
      }
      if (state.gameStatus !== 'active') {
        resolve()
        return
      }
      const treeIndices = state.grid.reduce((indices, cell, index) => {
        if (cell && typeof cell.t === 'number' && cell.t === 1) {
          indices.push(index)
        }
        return indices
      }, [])
      if (treeIndices.length > 0) {
        const randomIndex = treeIndices[Math.floor(Math.random() * treeIndices.length)]
        if (randomIndex >= 0 && randomIndex < state.rows * state.cols) {
          commit(MUTATIONS.SET_CLOUD_INDEX, randomIndex)
          commit(MUTATIONS.SET_CLOUD_DIRECTION, null)
        } else {
          console.warn('Invalid cloud index generated')
          commit(MUTATIONS.SET_CLOUD_INDEX, null)
        }
      } else {
        commit(MUTATIONS.SET_CLOUD_INDEX, null)
      }
      resolve()
    } catch (error) {
      console.error('Error in initCloud:', error)
      commit(MUTATIONS.SET_CLOUD_INDEX, null)
      commit(MUTATIONS.SET_CLOUD_DIRECTION, null)
    }
  })
},
    moveCloud({ commit, getters, state }) {
      return new Promise((resolve) => {
        if (state.cloudIndex === null || state.gameStatus !== 'active' || state.gameOver) {
          resolve()
          return
        }
        const currentIndex = state.cloudIndex
        const currentDirection = state.cloudDirection
        const rows = state.rows
        const cols = state.cols
        const grid = state.grid
        const getAvailableDirections = () => {
          const row = Math.floor(currentIndex / cols)
          const col = currentIndex % cols
          const directions = []
          const moves = {
            'up': { row: row - 1, col: col, opposite: 'down' },
            'down': { row: row + 1, col: col, opposite: 'up' },
            'left': { row: row, col: col - 1, opposite: 'right' },
            'right': { row: row, col: col + 1, opposite: 'left' }
          }
          Object.entries(moves).forEach(([dir, pos]) => {
            if (pos.row >= 0 && pos.row < rows && pos.col >= 0 && pos.col < cols) {
              const cellIndex = pos.row * cols + pos.col
              if (grid[cellIndex].t !== 2) {
                if (currentDirection !== pos.opposite) {
                  directions.push(dir)
                }
              }
            }
          })
          if (directions.length === 0 && currentDirection) {
            const oppositeDir = currentDirection === 'up' ? 'down' :
                                currentDirection === 'down' ? 'up' :
                                currentDirection === 'left' ? 'right' : 'left'
            const pos = moves[oppositeDir]
            if (pos && pos.row >= 0 && pos.row < rows && pos.col >= 0 && pos.col < cols) {
              const cellIndex = pos.row * cols + pos.col
              if (grid[cellIndex].t !== 2) {
                directions.push(oppositeDir)
              }
            }
          }
          return directions
        }
        const availableDirections = getAvailableDirections()
        if (availableDirections.length === 0) {
          resolve()
          return
        }
        const newDirection = availableDirections[Math.floor(Math.random() * availableDirections.length)]        
        const row = Math.floor(currentIndex / cols)
        const col = currentIndex % cols
        let newRow = row
        let newCol = col
        switch (newDirection) {
          case 'up': newRow--; break
          case 'down': newRow++; break
          case 'left': newCol--; break
          case 'right': newCol++; break
        }
        const newIndex = newRow * cols + newCol
        commit(MUTATIONS.SET_CLOUD_DIRECTION, newDirection)
        commit(MUTATIONS.SET_CLOUD_INDEX, newIndex)
        if (newIndex === state.playerIndex) {
          commit(MUTATIONS.SET_GAME_OVER, true)
          if (state.timerInterval) {
            clearInterval(state.timerInterval)
            commit(MUTATIONS.SET_TIMER_INTERVAL, null)
          }
          commit(MUTATIONS.SET_GAME_STATUS, 'lose')
          commit(MUTATIONS.SET_CLOUD_INDEX, null)
        }
        resolve()
      })
    },
    addSpark({ commit, getters, state }, { index, direction }) {
      return new Promise((resolve) => {
        const now = Date.now()
        const timeSinceLastShot = now - state.lastShotTime
        
        if (timeSinceLastShot < 3000) {
          resolve()
          return
        }
        const sparkId = now + Math.random()
        const spark = {
          id: sparkId,
          index: index,
          direction: direction
        }
        const currentSparks = [...state.sparks, spark]
        commit(MUTATIONS.SET_SPARKS, currentSparks)
        commit(MUTATIONS.SET_LAST_SHOT_TIME, now)
        resolve()
      })
    },
    removeSpark({ commit, state }, sparkId) {
      return new Promise((resolve) => {
        const filteredSparks = state.sparks.filter(spark => spark.id !== sparkId)
        commit(MUTATIONS.SET_SPARKS, filteredSparks)
        resolve()
      })
    },
    moveAllSparks({ commit, getters, state }) {
      return new Promise((resolve) => {
        if (state.gameStatus !== 'active' || state.sparks.length === 0) {
          resolve()
          return
        }
        const rows = state.rows
        const cols = state.cols
        const grid = state.grid
        let cloudIndex = state.cloudIndex
        const sparksToRemove = []
        const updatedSparks = []
        for (const spark of state.sparks) {
          const row = Math.floor(spark.index / cols)
          const col = spark.index % cols
          let newRow = row
          let newCol = col
          switch (spark.direction) {
            case 'up': newRow--; break
            case 'down': newRow++; break
            case 'left': newCol--; break
            case 'right': newCol++; break
          }
          if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) {
            sparksToRemove.push(spark.id)
            continue
          }
          const newIndex = newRow * cols + newCol
          if (grid[newIndex].t === 2) {
            sparksToRemove.push(spark.id)
            continue
          }
          if (newIndex === cloudIndex) {
            sparksToRemove.push(spark.id)
            cloudIndex = null
            commit(MUTATIONS.SET_CLOUD_INDEX, null)
            continue
          }
          updatedSparks.push({
            ...spark,
            index: newIndex
          })
        }
        commit(MUTATIONS.SET_SPARKS, updatedSparks)
        for (const sparkId of sparksToRemove) {
          commit(MUTATIONS.REMOVE_SPARK, sparkId)
        }
        resolve()
      })
    },
    setLastShotTime({ commit }, time) {
      return new Promise((resolve) => {
        commit(MUTATIONS.SET_LAST_SHOT_TIME, time)
        resolve()
      })
    },
  }
}