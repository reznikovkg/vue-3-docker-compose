import { buildBoard, nextBoard } from '../../business/Board.js'

const MUTATIONS = {
  SET_BOARD: 'SET_BOARD',
  UPDATE_BOARD: 'UPDATE_BOARD',
  RESET_BOARD: 'RESET_BOARD'
}

export default {
  namespaced: true,

  state() {
    return {
      board: buildBoard({ rows: 20, columns: 10 }),
      rows: 20,
      columns: 10
    }
  },

  getters: {
    board: (state) => state.board,
    boardSize: (state) => ({ rows: state.rows, columns: state.columns })
  },

  mutations: {
    [MUTATIONS.SET_BOARD](state, board) {
      state.board = board
    },

    [MUTATIONS.UPDATE_BOARD](state, { player, resetPlayer, addLinesCleared }) {
      state.board = nextBoard({
        board: state.board,
        player,
        resetPlayer,
        addLinesCleared
      })
    },

    [MUTATIONS.RESET_BOARD](state) {
      state.board = buildBoard({ rows: state.rows, columns: state.columns })
    }
  },

  actions: {
    updateBoard({ commit, rootGetters, dispatch }) {
      const player = rootGetters['player/player']
      
      commit(MUTATIONS.UPDATE_BOARD, {
        player,
        resetPlayer: () => dispatch('player/resetPlayer', null, { root: true }),
        addLinesCleared: (lines) => dispatch('game/addLinesCleared', lines, { root: true })
      })
    },

    resetBoard({ commit }) {
      commit(MUTATIONS.RESET_BOARD)
    }
  }
}