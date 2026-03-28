import { createStore } from 'vuex'
import list from './list'
import {MUTATIONS} from "@/store/constants.js";

export const DEFAULT_SIZE = 4
export const RECORDS_KEY = 'records'

const loadRecordsFromStorage = () => {
  const saved = localStorage.getItem(RECORDS_KEY)
  return saved ? JSON.parse(saved) : {}
}

const saveRecordsToStorage = (records) => {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records))
}

export default createStore({
  state () {
    return {
      count: 0,
      gameWidth: DEFAULT_SIZE,
      gameHeight: DEFAULT_SIZE,
      gameBoard: [],
      showWinModal: false,
      blockedMode: false,
      blockedCells: [],
      specialMoveAvailable: false,
      gameTime: 0,
      isPlaying: true,
      gameTimer: null,
      records: loadRecordsFromStorage()
    }
  },
  getters: {
    getCount: (state) => state.count,
    getCount2: (state) => state.count * 2,
    getGameWidth: state => state.gameWidth,
    getGameHeight: state => state.gameHeight,
    getGameBoard: state => state.gameBoard,
    getShowWinModal: state => state.showWinModal,
    getBlockedMode: state => state.blockedMode,
    getBlockedCells: state => state.blockedCells,
    getSpecialMoveAvailable: state => state.specialMoveAvailable,
    getGameTime: state => state.gameTime,
    getIsPlaying: state => state.isPlaying,
    getRecords: state => state.records,
    getFormattedTime: state => {
      const minutes = Math.floor(state.gameTime / 60)
      const seconds = state.gameTime % 60
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
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
      state.gameTime = 0
      state.isPlaying = true
      state.specialMoveAvailable = false
      state.blockedCells = []
    },
    [MUTATIONS.SET_BLOCKED_MODE]: (state, value) => {
      state.blockedMode = value
    },
    [MUTATIONS.SET_BLOCKED_CELLS]: (state, cells) => {
      state.blockedCells = cells
    },
    [MUTATIONS.SET_SPECIAL_MOVE_AVAILABLE]: (state, value) => {
      state.specialMoveAvailable = value
    },
    [MUTATIONS.SET_GAME_TIME]: (state, time) => {
      state.gameTime = time
    },
    [MUTATIONS.SET_IS_PLAYING]: (state, value) => {
      state.isPlaying = value
    },
    [MUTATIONS.SET_RECORDS]: (state, records) => {
      state.records = records
      saveRecordsToStorage(records)
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
    initGame: ({ state, commit, dispatch }) => {
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

      if (state.blockedMode) {
        dispatch('updateBlockedCells')
      }

      dispatch('startTimer')
    },
    startTimer: ({ commit, state }) => {
      if (state.gameTimer) {
        clearInterval(state.gameTimer)
      }

      const timer = setInterval(() => {
        if (state.isPlaying && !state.showWinModal) {
          commit(MUTATIONS.SET_GAME_TIME, state.gameTime + 1)
        }
      }, 1000)

      state.gameTimer = timer
    },
    stopTimer: ({ state }) => {
      if (state.gameTimer) {
        clearInterval(state.gameTimer)
        state.gameTimer = null
      }
    },
    updateBlockedCells: ({ state, commit }) => {
      if (!state.blockedMode) return

      const zeroIndex = state.gameBoard.indexOf(0)
      const width = state.gameWidth
      const height = state.gameHeight
      const row = Math.floor(zeroIndex / width)
      const col = zeroIndex % width

      const possibleMoves = []

      if (row > 0) possibleMoves.push(zeroIndex - width)
      if (row < height - 1) possibleMoves.push(zeroIndex + width)
      if (col > 0) possibleMoves.push(zeroIndex - 1)
      if (col < width - 1) possibleMoves.push(zeroIndex + 1)

      if (possibleMoves.length > 0) {
        const randomIndex = Math.floor(Math.random() * possibleMoves.length)
        const blockedCell = possibleMoves[randomIndex]
        commit(MUTATIONS.SET_BLOCKED_CELLS, [blockedCell])
      } else {
        commit(MUTATIONS.SET_BLOCKED_CELLS, [])
      }
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

      let canMove = isAdjacent

      if (state.blockedMode && state.blockedCells.includes(index)) {
        canMove = false
      }

      if (canMove) {
        [board[index], board[zeroIndex]] = [board[zeroIndex], board[index]]
        commit(MUTATIONS.SET_GAME_BOARD, board)

        if (state.blockedMode) {
          dispatch('updateBlockedCells')
        }

        const total = width * height
        const isWin = board.every((value, idx) =>
            idx === total - 1 ? value === 0 : value === idx + 1
        )

        if (isWin) {
          dispatch('stopTimer')
           .then(() => dispatch('saveRecord'))
           .then(() => dispatch('showWinModal'))
        }
      }
    },
    useSpecialMove: ({ commit, state }) => {
      if (state.specialMoveAvailable && state.blockedMode) {
        return true
      }
      return false
    },
    consumeSpecialMove: ({ commit, state }) => {
      if (state.specialMoveAvailable) {
        commit(MUTATIONS.SET_SPECIAL_MOVE_AVAILABLE, false)
        return true
      }
      return false
    },
    accumulateSpecialMove: ({ commit, state }) => {
      if (state.isPlaying && !state.showWinModal && state.blockedMode) {
        commit(MUTATIONS.SET_SPECIAL_MOVE_AVAILABLE, true)
      }
    },
    saveRecord: ({ state, commit }) => {
      const key = `${state.blockedMode ? 'blocked' : 'normal'}_${state.gameWidth}x${state.gameHeight}`
      const records = { ...state.records }

      if (!records[key] || state.gameTime < records[key]) {
        records[key] = state.gameTime
        commit(MUTATIONS.SET_RECORDS, records)
      }
    },
    showWinModal: ({ commit }) => {
      commit(MUTATIONS.SET_GAME_WIN, true)
    },
    hideWinModal: ({ commit, dispatch }) => {
      commit(MUTATIONS.SET_GAME_WIN, false)
      dispatch('stopTimer')
    },
    resetGame: ({ dispatch }) => {
      return dispatch('initGame')
    },
    setBlockedMode: ({ commit }, value) => {
      commit(MUTATIONS.SET_BLOCKED_MODE, value)
    },
    useSpecialMoveComplete: ({ commit, dispatch }) => {
      commit(MUTATIONS.SET_SPECIAL_MOVE_AVAILABLE, false)
      dispatch('updateBlockedCells')
    },
      activateSpecialMoveMode: ({ commit, state }) => {
          return state.specialMoveAvailable && state.blockedMode
      }
  },
  modules: {
    list
  }
})
