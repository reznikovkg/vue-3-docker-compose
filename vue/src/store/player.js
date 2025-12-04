import { randomTetromino } from '../business/Tetrominoes.js'

const MUTATIONS = {
  SET_PLAYER: 'SET_PLAYER',
  RESET_PLAYER: 'RESET_PLAYER',
  UPDATE_POSITION: 'UPDATE_POSITION',
  SET_COLLIDED: 'SET_COLLIDED',
  SET_FAST_DROPPING: 'SET_FAST_DROPPING',
  INIT_PLAYER: 'INIT_PLAYER'
}

const buildPlayer = (previous, store = null) => {
  let tetrominoes

  if (previous) {
    tetrominoes = [...previous.tetrominoes]
    tetrominoes.unshift(randomTetromino(store))
  } else {
    tetrominoes = Array(5)
      .fill(0)
      .map(() => randomTetromino(store))
  }

  return {
    collided: false,
    isFastDropping: false,
    position: { row: 0, column: 4 },
    tetrominoes,
    tetromino: tetrominoes.pop(),
  }
}

export default {
  namespaced: true,

  state() {
    return {
      player: null,  // ⚠️ Изменено: теперь null вместо buildPlayer()
      initialized: false
    }
  },

  getters: {
    player: (state) => state.player,
    currentTetromino: (state) => state.player?.tetromino,
    position: (state) => state.player?.position,
    tetrominoes: (state) => state.player?.tetrominoes || []
  },

  mutations: {
    // ✨ НОВОЕ: Инициализация с доступом к store
    [MUTATIONS.INIT_PLAYER](state, store) {
      if (!state.initialized) {
        state.player = buildPlayer(null, store)
        state.initialized = true
      }
    },

    [MUTATIONS.SET_PLAYER](state, player) {
      state.player = player
    },

    [MUTATIONS.RESET_PLAYER](state, store = null) {
      state.player = buildPlayer(state.player, store)
    },

    [MUTATIONS.UPDATE_POSITION](state, position) {
      state.player = {
        ...state.player,
        position
      }
    },

    [MUTATIONS.SET_COLLIDED](state, collided) {
      state.player = {
        ...state.player,
        collided
      }
    },

    [MUTATIONS.SET_FAST_DROPPING](state, isFastDropping) {
      state.player = {
        ...state.player,
        isFastDropping
      }
    }
  },

  actions: {
    // ✨ НОВОЕ: Инициализация игрока
    initPlayer({ commit, state }) {
      if (!state.initialized) {
        commit(MUTATIONS.INIT_PLAYER, this)
      }
    },

    setPlayer({ commit, dispatch }, player) {
      commit(MUTATIONS.SET_PLAYER, player)
      dispatch('board/updateBoard', null, { root: true })
    },

    // 🔧 ИСПРАВЛЕНО: передаем this вместо rootState
    resetPlayer({ commit, dispatch }) {
      commit(MUTATIONS.RESET_PLAYER, this)
      dispatch('board/updateBoard', null, { root: true })
    },

    updatePlayer({ commit, dispatch }, updates) {
      commit(MUTATIONS.SET_PLAYER, updates)
      dispatch('board/updateBoard', null, { root: true })
    }
  }
}