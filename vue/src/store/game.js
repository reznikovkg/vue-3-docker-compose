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
  SET_IS_PAUSED: 'SET_IS_PAUSED',
  SET_INTERVAL_ID: 'SET_INTERVAL_ID',
  SET_GAME_TICK_CALLBACK: 'SET_GAME_TICK_CALLBACK',
  CLEAR_PREVIOUS_DROP_TIME: 'CLEAR_PREVIOUS_DROP_TIME',
  SET_TOTAL_LINES_CLEARED: 'SET_TOTAL_LINES_CLEARED'
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
      isPaused: false,
      intervalId: null,
      gameTickCallback: null,
      totalLinesCleared: 0  // Общее количество исчезнувших строк
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
    },

    [MUTATIONS.SET_LINES_COMPLETED](state, lines) {
      state.linesCompleted = lines
    },

    [MUTATIONS.SET_POINTS](state, points) {
      state.points = points
    },

    [MUTATIONS.SET_TOTAL_LINES_CLEARED](state, total) {
      state.totalLinesCleared = total
    },

    [MUTATIONS.ADD_LINES_CLEARED](state, lines) {
      const oldDropTime = state.dropTime
      const oldTotalLines = state.totalLinesCleared
      
      const linesScore = getScoreForLines(lines)
      state.points += linesScore

      // Увеличиваем общее количество исчезнувших строк
      state.totalLinesCleared += lines

      const newLinesCompleted = state.linesCompleted + lines
      
      // Проверяем переход на новый уровень
      if (newLinesCompleted >= state.linesPerLevel) {
        state.level += 1
        state.linesCompleted = newLinesCompleted % state.linesPerLevel
      } else {
        state.linesCompleted = newLinesCompleted
      }

      // Вычисляем новую скорость на основе общего количества исчезнувших строк
      // Каждая строка уменьшает dropTime на 1% от начального значения
      const speedReduction = state.totalLinesCleared * 0.01 // 1% за каждую строку
      const newDropTime = defaultDropTime * (1 - speedReduction)
      
      // Ограничиваем минимальную скорость
      state.dropTime = Math.max(newDropTime, minimumDropTime)
      state.previousDropTime = null

      // ЛОГИРОВАНИЕ
      console.group(' СКОРОСТЬ ИГРЫ ОБНОВЛЕНА');
      console.log(' Исчезло строк:', lines);
      console.log(' Всего строк исчезло:', `${oldTotalLines} → ${state.totalLinesCleared}`);
      console.log(' Ускорение:', `${(speedReduction * 100).toFixed(1)}%`);
      console.log(' Старая скорость (dropTime):', `${oldDropTime}ms`);
      console.log(' Новая скорость (dropTime):', `${state.dropTime}ms`);
      console.log(' Изменение скорости:', `${(oldDropTime - state.dropTime).toFixed(0)}ms быстрее`);
      console.groupEnd();
    },

    [MUTATIONS.RESET_GAME_STATS](state) {
      state.level = 1
      state.linesCompleted = 0
      state.points = 0
      state.dropTime = defaultDropTime
      state.isPaused = false
      state.previousDropTime = null
      state.totalLinesCleared = 0
    },

    [MUTATIONS.SET_DROP_TIME](state, time) {
      state.dropTime = time
    },

    [MUTATIONS.PAUSE_DROP_TIME](state) {
      if (state.dropTime !== null) {
        state.previousDropTime = state.dropTime
        state.dropTime = null
      }
    },

    [MUTATIONS.RESUME_DROP_TIME](state) {
      if (state.previousDropTime !== null) {
        state.dropTime = state.previousDropTime
        state.previousDropTime = null
      }
    },

    [MUTATIONS.SET_IS_PAUSED](state, value) {
      state.isPaused = value
    },

    [MUTATIONS.SET_INTERVAL_ID](state, id) {
      if (state.intervalId && state.intervalId !== id) {
        clearInterval(state.intervalId)
      }
      state.intervalId = id
    },

    [MUTATIONS.SET_GAME_TICK_CALLBACK](state, callback) {
      state.gameTickCallback = callback
    },

    [MUTATIONS.CLEAR_PREVIOUS_DROP_TIME](state) {
      state.previousDropTime = null
    }
  },

  actions: {
    setGameOver({ commit, dispatch }, value) {
      commit(MUTATIONS.SET_GAME_OVER, value)
      if (value) {
        dispatch('stopGameLoop')
      }
    },

    async startGame({ commit, dispatch }) {
      commit(MUTATIONS.RESET_GAME_OVER)
      commit(MUTATIONS.RESET_GAME_STATS)
      
      //  Сначала инициализируем игрока с загруженными фигурами
      await dispatch('player/initPlayer', null, { root: true })
      
      // Теперь сбрасываем игрока
      await dispatch('player/resetPlayer', null, { root: true })
      await dispatch('board/resetBoard', null, { root: true })
    },

    addLinesCleared({ commit, state, dispatch }, lines) {
      if (lines > 0) {
        const oldDropTime = state.dropTime
        
        commit(MUTATIONS.ADD_LINES_CLEARED, lines)
        
        // Если скорость изменилась, перезапускаем игровой цикл
        if (state.dropTime !== oldDropTime) {
          console.log(' Перезапуск игрового цикла с новой скоростью:', state.dropTime + 'ms');
          commit(MUTATIONS.CLEAR_PREVIOUS_DROP_TIME)
          commit(MUTATIONS.SET_IS_PAUSED, false)
          dispatch('restartGameLoop')
        }
      }
    },

    pauseDropTime({ commit, state, dispatch }) {
      if (state.dropTime !== null) {
        commit(MUTATIONS.PAUSE_DROP_TIME)
        commit(MUTATIONS.SET_IS_PAUSED, true)
        dispatch('stopGameLoop')
      }
    },

    resumeDropTime({ commit, state, dispatch }) {
      if (state.previousDropTime !== null) {
        commit(MUTATIONS.RESUME_DROP_TIME)
        commit(MUTATIONS.SET_IS_PAUSED, false)
        dispatch('startGameLoop')
      }
    },

    togglePause({ state, dispatch }) {
      if (state.dropTime !== null) {
        dispatch('pauseDropTime')
      } else {
        dispatch('resumeDropTime')
      }
    },

    startGameLoop({ state, commit }) {
      if (state.intervalId) {
        clearInterval(state.intervalId)
        commit(MUTATIONS.SET_INTERVAL_ID, null)
      }

      if (!state.gameTickCallback || state.dropTime === null || state.gameOver) {
        return
      }

      const callback = state.gameTickCallback
      const currentDropTime = state.dropTime
      
      const id = setInterval(() => {
        if (!state.isPaused && !state.gameOver && callback) {
          callback()
        }
      }, currentDropTime)
      
      commit(MUTATIONS.SET_INTERVAL_ID, id)
    },

    stopGameLoop({ state, commit }) {
      if (state.intervalId) {
        clearInterval(state.intervalId)
        commit(MUTATIONS.SET_INTERVAL_ID, null)
      }
    },

    restartGameLoop({ dispatch }) {
      dispatch('stopGameLoop')
      setTimeout(() => {
        dispatch('startGameLoop')
      }, 10)
    },

    registerGameTick({ commit }, callback) {
      commit(MUTATIONS.SET_GAME_TICK_CALLBACK, callback)
    }
  }
}