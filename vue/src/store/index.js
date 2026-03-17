import { createStore } from 'vuex'
export const MUTATIONS = {
  SET_CELLS: 'SET_CELLS',
  SET_MOVES: 'SET_MOVES',
  SET_SIZE: 'SET_SIZE',
  INCREMENT_SECONDS: 'INCREMENT_SECONDS',
  SET_PENALTY_SECONDS: 'SET_PENALTY_SECONDS',
  SET_RECORDS: 'SET_RECORDS'
}
export const ACTIONS = {
  NEW_GAME: 'newGame',
  MOVE_CELL: 'moveCell',
  CHANGE_SIZE: 'changeSize',
  LOAD_RECORDS: 'loadRecords',
  TICK_TIMER: 'tickTimer',
  SAVE_RECORD: 'saveRecord'
}
export const GETTERS = {
  EMPTY_INDEX: 'emptyIndex',
  IS_SOLVED: 'isSolved',
  FORMATTED_TIME: 'formattedTime'
}
const store = createStore({
  state: {
    cells: [],
    moves: 0,
    size: 3,
    seconds: 0,
    penaltySeconds: 0,
    records: []
  },
  getters: {
    [GETTERS.EMPTY_INDEX]: (state) => {
      return state.cells.indexOf(state.size * state.size)
    },
    [GETTERS.IS_SOLVED]: (state) => {
      if (!state.cells.length) return false
      return state.cells.every((cell, index) => {
        if (index === state.cells.length - 1) {
          return cell === state.size * state.size
        }
        return cell === index + 1
      })
    },
    [GETTERS.FORMATTED_TIME]: (state) => {
      const totalSeconds = state.seconds + state.penaltySeconds
      const m = Math.floor(totalSeconds / 60)
      const s = totalSeconds % 60
      return `${m}:${s.toString().padStart(2, '0')}`
    },
    cells: (state) => state.cells,
    moves: (state) => state.moves,
    size: (state) => state.size,
    seconds: (state) => state.seconds,
    penaltySeconds: (state) => state.penaltySeconds,
    records: (state) => state.records
  },
  mutations: {
    [MUTATIONS.SET_CELLS]: (state, cells) => {
      state.cells = cells
    },
    [MUTATIONS.SET_MOVES]: (state, moves) => {
      state.moves = moves
    },
    [MUTATIONS.SET_SIZE]: (state, size) => {
      state.size = size
    },
    [MUTATIONS.INCREMENT_SECONDS]: (state) => {
      state.seconds += 1
    },
    [MUTATIONS.SET_PENALTY_SECONDS]: (state, penalty) => {
      state.penaltySeconds = penalty
    },
    [MUTATIONS.SET_RECORDS]: (state, records) => {
      state.records = records
    }
  },
  actions: {
    [ACTIONS.NEW_GAME]: ({ commit, state }) => {
      const arr = Array.from({ length: state.size * state.size }, (_, i) => i + 1)
      let shuffled
      do {
        shuffled = [...arr].sort(() => Math.random() - 0.5)
      } while (shuffled[state.size * state.size - 1] !== state.size * state.size)
      commit(MUTATIONS.SET_CELLS, shuffled)
      commit(MUTATIONS.SET_MOVES, 0)
      commit(MUTATIONS.SET_PENALTY_SECONDS, 0)
    },
    [ACTIONS.MOVE_CELL]: ({ commit, state, getters, dispatch }, index) => {
      if (getters[GETTERS.IS_SOLVED]) return
      const empty = getters[GETTERS.EMPTY_INDEX]
      const newCells = [...state.cells]
      newCells[empty] = newCells[index]
      newCells[index] = state.size * state.size
      commit(MUTATIONS.SET_CELLS, newCells)
      commit(MUTATIONS.SET_MOVES, state.moves + 1)
      if (getters[GETTERS.IS_SOLVED]) {
        dispatch(ACTIONS.SAVE_RECORD)
      }
    },
    [ACTIONS.CHANGE_SIZE]: ({ commit, dispatch }, size) => {
      let newSize = size
      if (newSize < 3) newSize = 3
      if (newSize > 10) newSize = 10
      commit(MUTATIONS.SET_SIZE, newSize)
      dispatch(ACTIONS.NEW_GAME)
    },
    [ACTIONS.LOAD_RECORDS]: ({ commit }) => {
      const saved = localStorage.getItem('puzzleRecords')
      if (saved) {
        try {
          commit(MUTATIONS.SET_RECORDS, JSON.parse(saved))
        } catch {}
      }
    },
    [ACTIONS.TICK_TIMER]: ({ commit, getters }) => {
      if (!getters[GETTERS.IS_SOLVED]) {
        commit(MUTATIONS.INCREMENT_SECONDS)
      }
    },
    [ACTIONS.SAVE_RECORD]: ({ state, commit }) => {
      const totalSeconds = state.seconds + state.penaltySeconds
      const newRecord = {
        size: state.size,
        time: totalSeconds,
        moves: state.moves,
        date: Date.now()
      }
      const sameSize = state.records.filter(r => r.size === state.size)
      sameSize.push(newRecord)
      sameSize.sort((a, b) => a.time - b.time)
      const otherSizes = state.records.filter(r => r.size !== state.size)
      const newRecords = [...otherSizes, ...sameSize.slice(0, 5)]
      commit(MUTATIONS.SET_RECORDS, newRecords)
      localStorage.setItem('puzzleRecords', JSON.stringify(newRecords))
    }
  }
})

export default store