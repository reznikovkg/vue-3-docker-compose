const MUTATIONS = {
  SET_GAME_OVER: 'SET_GAME_OVER',
  RESET_GAME_OVER: 'RESET_GAME_OVER',
  SET_LEVEL: 'SET_LEVEL',
  SET_LINES_COMPLETED: 'SET_LINES_COMPLETED',
  SET_POINTS: 'SET_POINTS',
  ADD_LINES_CLEARED: 'ADD_LINES_CLEARED',
  RESET_GAME_STATS: 'RESET_GAME_STATS',
  SET_DROP_TIME: 'SET_DROP_TIME',
  PAUSE_DROP_TIME: 'PAUSE_DROP_TIME',
  RESUME_DROP_TIME: 'RESUME_DROP_TIME',
  SET_IS_PAUSED: 'SET_IS_PAUSED'
}

const getScoreForLines = (lines) => {
  switch (lines) {
    case 1: return 100
    case 2: return 300
    case 3: return 500
    case 4: return 800
    default: return 0
  }
}

const defaultDropTime = 1000
const minimumDropTime = 100
const speedIncrement = 50

export default {
  namespaced: true,
  
  state() {
    return {
      gameOver: true,
      level: 1,
      linesCompleted: 0,
      linesPerLevel: 10,
      points: 0,
      dropTime: defaultDropTime,
      previousDropTime: null,
      isPaused: false
    }
  },

  getters: {
    gameOver: (state) => state.gameOver,
    gameStats: (state) => ({
      level: state.level,
      linesCompleted: state.linesCompleted,
      linesPerLevel: state.linesPerLevel,
      points: state.points
    }),
    dropTime: (state) => state.dropTime,
    isPaused: (state) => state.isPaused,
    linesToLevel: (state) => state.linesPerLevel - state.linesCompleted
  },

  mutations: {
    [MUTATIONS.SET_GAME_OVER](state, value) {
      state.gameOver = value
    },

    [MUTATIONS.RESET_GAME_OVER](state) {
      state.gameOver = false
    },

    [MUTATIONS.SET_LEVEL](state, level) {
      state.level = level
      // Обновляем dropTime при смене уровня
      const speed = speedIncrement * (level - 1)
      state.dropTime = Math.max(defaultDropTime - speed, minimumDropTime)
    },

    [MUTATIONS.SET_LINES_COMPLETED](state, lines) {
      state.linesCompleted = lines
    },

    [MUTATIONS.SET_POINTS](state, points) {
      state.points = points
    },

    [MUTATIONS.ADD_LINES_CLEARED](state, lines) {
      const linesScore = getScoreForLines(lines)
      state.points += linesScore

      const newLinesCompleted = state.linesCompleted + lines
      
      if (newLinesCompleted >= state.linesPerLevel) {
        state.level += 1
        state.linesCompleted = newLinesCompleted % state.linesPerLevel
        
        // Обновляем скорость падения
        const speed = speedIncrement * (state.level - 1)
        state.dropTime = Math.max(defaultDropTime - speed, minimumDropTime)
      } else {
        state.linesCompleted = newLinesCompleted
      }
    },

    [MUTATIONS.RESET_GAME_STATS](state) {
      state.level = 1
      state.linesCompleted = 0
      state.points = 0
      state.dropTime = defaultDropTime
      state.isPaused = false
    },

    [MUTATIONS.SET_DROP_TIME](state, time) {
      state.dropTime = time
    },

    [MUTATIONS.PAUSE_DROP_TIME](state) {
      if (state.dropTime) {
        state.previousDropTime = state.dropTime
        state.dropTime = null
      }
    },

    [MUTATIONS.RESUME_DROP_TIME](state) {
      if (state.previousDropTime) {
        state.dropTime = state.previousDropTime
        state.previousDropTime = null
      }
    },

    [MUTATIONS.SET_IS_PAUSED](state, value) {
      state.isPaused = value
    }
  },

  actions: {
    setGameOver({ commit }, value) {
      commit(MUTATIONS.SET_GAME_OVER, value)
    },

    startGame({ commit, dispatch }) {
      commit(MUTATIONS.RESET_GAME_OVER)
      commit(MUTATIONS.RESET_GAME_STATS)
      dispatch('player/resetPlayer', null, { root: true })
      dispatch('board/resetBoard', null, { root: true })
    },

    addLinesCleared({ commit }, lines) {
      if (lines > 0) {
        commit(MUTATIONS.ADD_LINES_CLEARED, lines)
      }
    },

    pauseDropTime({ commit, state }) {
      if (state.dropTime !== null) {
        commit(MUTATIONS.PAUSE_DROP_TIME)
        commit(MUTATIONS.SET_IS_PAUSED, true)
      }
    },

    resumeDropTime({ commit, state }) {
      if (state.dropTime === null && state.previousDropTime) {
        commit(MUTATIONS.RESUME_DROP_TIME)
        commit(MUTATIONS.SET_IS_PAUSED, false)
      }
    },

    togglePause({ state, dispatch }) {
      if (state.dropTime !== null) {
        dispatch('pauseDropTime')
      } else {
        dispatch('resumeDropTime')
      }
    }
  }
}