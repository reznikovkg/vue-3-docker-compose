import { createStore } from 'vuex'
import list from './list'
import {MUTATIONS} from "@/store/constants.js";

export const DEFAULT_SIZE = 4

export default createStore({
  state () {
    return {
      count: 0,
      gameWidth: DEFAULT_SIZE,
      gameHeight: DEFAULT_SIZE,
      gameBoard: [],
      showWinModal: false
    }
  },
  getters: {
    getCount: (state) => state.count,
    getCount2: (state) => state.count * 2,
    getGameWidth: state => state.gameWidth,
    getGameHeight: state => state.gameHeight,
    getGameBoard: state => state.gameBoard,
    getShowWinModal: state => state.showWinModal
  },
  mutations: {
    [MUTATIONS.INCREMENT]: (state, value) => {
      state.count += value
    },
    [MUTATIONS.SET_COUNT]: (state, value) => {
      state.count = value
    },
    [MUTATIONS.SET_GAME_WIDTH]: (state, width) => {
      state.gameWidth = width
    },
    [MUTATIONS.SET_GAME_HEIGHT]: (state, height) => {
      state.gameHeight = height
    },
    [MUTATIONS.SET_GAME_SIZE]: (state, { width, height }) => {
      state.gameWidth = width
      state.gameHeight = height
    },
    [MUTATIONS.SET_GAME_BOARD]: (state, board) => {
      state.gameBoard = board
    },
    [MUTATIONS.SET_GAME_WIN]: (state, value) => {
      state.showWinModal = value
    },
    [MUTATIONS.RESET_GAME]: (state) => {
      state.showWinModal = false
    }
  },
  actions: {
    runIncrement: (store, value) => {
      store.commit(MUTATIONS.INCREMENT, value)
    },
    setCount: (store, payload) => {
      const { value, timeout = 0 } = payload
      setTimeout(() => {
        store.commit(MUTATIONS.SET_COUNT, value)
      }, timeout)
    },
    updateGameSize: ({ commit }, sizeData) => {
      commit(MUTATIONS.SET_GAME_SIZE, sizeData)
    },
    initGame: ({ state, commit }) => {
      const width = state.gameWidth
      const height = state.gameHeight
      const total = width * height

        const winBoard = []
        for (let i = 1; i < total; i++) {
            winBoard.push(i)
        }
        winBoard.push(0)

      let board = [...winBoard]
      for (let i = 0; i < 200; i++) {
        const zeroIndex = board.indexOf(0)
        const row = Math.floor(zeroIndex / width)
        const col = zeroIndex % width
        const neighbors = []

        if (row > 0) neighbors.push(zeroIndex - width)
        if (row < height - 1) neighbors.push(zeroIndex + width)
        if (col > 0) neighbors.push(zeroIndex - 1)
        if (col < width - 1) neighbors.push(zeroIndex + 1)

        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)]
        ;[board[zeroIndex], board[randomNeighbor]] = [board[randomNeighbor], board[zeroIndex]]
      }

      commit(MUTATIONS.SET_GAME_BOARD, board)
      commit(MUTATIONS.RESET_GAME)
    },
    moveTile: ({ state, commit, dispatch }, index) => {
      const board = [...state.gameBoard]
      const zeroIndex = board.indexOf(0)
      const width = state.gameWidth
      const height = state.gameHeight

      const row1 = Math.floor(index / width)
      const col1 = index % width
      const row2 = Math.floor(zeroIndex / width)
      const col2 = zeroIndex % width

      const isAdjacent = Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1

      if (isAdjacent) {
        [board[index], board[zeroIndex]] = [board[zeroIndex], board[index]]
        commit(MUTATIONS.SET_GAME_BOARD, board)

        const total = width * height
        const isWin = board.every((value, idx) =>
            idx === total - 1 ? value === 0 : value === idx + 1
        )

        if (isWin) {
          return dispatch('showWinModal')
        }
      }
    },
    showWinModal: ({ commit }) => {
      commit(MUTATIONS.SET_GAME_WIN, true)
    },
    hideWinModal: ({ commit }) => {
      commit(MUTATIONS.SET_GAME_WIN, false)
    },
    resetGame: ({ dispatch }) => {
      return dispatch('initGame')
    }
  },
  modules: {
    list
  }
})
