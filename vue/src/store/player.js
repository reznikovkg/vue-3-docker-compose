import { randomTetromino } from '../business/Tetrominoes.js'

const MUTATIONS = {
  SET_PLAYER: 'SET_PLAYER',
  RESET_PLAYER: 'RESET_PLAYER',
  UPDATE_POSITION: 'UPDATE_POSITION',
  SET_COLLIDED: 'SET_COLLIDED',
  SET_FAST_DROPPING: 'SET_FAST_DROPPING',
  INIT_PLAYER: 'INIT_PLAYER'
}

const buildPlayer = (previous, store = null, hardMode = false) => {
  let tetrominoes

  if (previous) {
    tetrominoes = [...previous.tetrominoes]
    tetrominoes.unshift(randomTetromino(store, hardMode))
  } else {
    tetrominoes = Array(5)
      .fill(0)
      .map(() => randomTetromino(store, hardMode))
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
      player: null,
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
    [MUTATIONS.INIT_PLAYER](state, { store, hardMode }) {
      if (!state.initialized) {
        state.player = buildPlayer(null, store, hardMode)
        state.initialized = true
      }
    },

    [MUTATIONS.SET_PLAYER](state, player) {
      state.player = player
    },

    [MUTATIONS.RESET_PLAYER](state, { store, hardMode }) {
      state.player = buildPlayer(state.player, store, hardMode)
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
    initPlayer({ commit, rootGetters }, { hardMode = false } = {}) {
      if (!this.state.player.initialized) {
        commit(MUTATIONS.INIT_PLAYER, { store: this, hardMode })
      }
    },

    setPlayer({ commit, dispatch }, player) {
      commit(MUTATIONS.SET_PLAYER, player)
      dispatch('board/updateBoard', null, { root: true })
    },

    resetPlayer({ commit, dispatch, rootGetters }) {
      const hardMode = rootGetters['game/hardMode']
      commit(MUTATIONS.RESET_PLAYER, { store: this, hardMode })
      dispatch('board/updateBoard', null, { root: true })
    },

    updatePlayer({ commit, dispatch }, updates) {
      commit(MUTATIONS.SET_PLAYER, updates)
      dispatch('board/updateBoard', null, { root: true })
    }
  }
}