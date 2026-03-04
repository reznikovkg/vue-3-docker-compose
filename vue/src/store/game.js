export const MUTATIONS = {
  SET_PLAYER_INDEX: 'SET_PLAYER_INDEX',
  SET_DIRECTION: 'SET_DIRECTION',
  SET_LAST_KEY: 'SET_LAST_KEY',
  SET_GAME_STATUS: 'SET_GAME_STATUS',
  SET_CURRENT_TIME: 'SET_CURRENT_TIME',
  INCREMENT_TREE_COUNT: 'INCREMENT_TREE_COUNT',
  RESET_GAME: 'RESET_GAME',
  COLLECT_TREE: 'COLLECT_TREE',
  SET_TIMER_INTERVAL: 'SET_TIMER_INTERVAL'
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
    timerInterval: null
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
    isGameActive: (state) => state.gameStatus === 'active'
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
        resolve()
      })
    }
  }
}