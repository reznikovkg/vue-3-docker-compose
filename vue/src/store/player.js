import { randomTetromino } from '../business/Tetrominoes.js'

const MUTATIONS = {
  SET_PLAYER: 'SET_PLAYER',
  RESET_PLAYER: 'RESET_PLAYER',
  UPDATE_POSITION: 'UPDATE_POSITION',
  SET_COLLIDED: 'SET_COLLIDED',
  SET_FAST_DROPPING: 'SET_FAST_DROPPING'
}

const buildPlayer = (previous) => {
  let tetrominoes

  if (previous) {
    tetrominoes = [...previous.tetrominoes]
    tetrominoes.unshift(randomTetromino())
  } else {
    tetrominoes = Array(5)
      .fill(0)
      .map(() => randomTetromino())
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
      player: buildPlayer()
    }
  },

  getters: {
    player: (state) => state.player,
    currentTetromino: (state) => state.player.tetromino,
    position: (state) => state.player.position,
    tetrominoes: (state) => state.player.tetrominoes
  },

  mutations: {
    [MUTATIONS.SET_PLAYER](state, player) {
      state.player = player
    },

    [MUTATIONS.RESET_PLAYER](state) {
      state.player = buildPlayer(state.player)
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
    setPlayer({ commit, dispatch }, player) {
      commit(MUTATIONS.SET_PLAYER, player)
      // После обновления игрока автоматически обновляем доску
      dispatch('board/updateBoard', null, { root: true })
    },

    resetPlayer({ commit, dispatch }) {
      commit(MUTATIONS.RESET_PLAYER)
      // После сброса игрока обновляем доску
      dispatch('board/updateBoard', null, { root: true })
    },

    updatePlayer({ commit, dispatch }, updates) {
      commit(MUTATIONS.SET_PLAYER, updates)
      // После обновления игрока обновляем доску
      dispatch('board/updateBoard', null, { root: true })
    }
  }
}