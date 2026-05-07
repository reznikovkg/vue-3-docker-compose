const SAVE_KEY = 'number-merge-save'
const FIELD_SIZE = 8
const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8]
const POINTS_TABLE = [10, 25, 50, 100, 200, 400, 800, 1600]

const MUTATIONS = {
  SET_CELLS: 'SET_CELLS',
  SET_SCORE: 'SET_SCORE',
  SET_CELL: 'SET_CELL',
  ADD_SCORE: 'ADD_SCORE',
}

export default {
  namespaced: true,
  state: () => ({
    cells: [],
    scrore: 0,
    gridSize: FIELD_SIZE,
  }),
  getters: {
    getCells: (state) => state.cells,
    getScore: (state) => state.scrore,
    getGridSize: (state) => state.gridSize,
    getNumbers: () => NUMBERS,
    getPointsTable: () => POINTS_TABLE,
  },
  mutations: {
    [MUTATIONS.SET_CELLS]: (state, payload) => {
      state.cells = payload
    },
    [MUTATIONS.SET_SCORE]: (state, payload) => {
      state.scrore = payload
    },
    [MUTATIONS.SET_CELL]: (state, { idx, value }) => {
      state.cells[idx] = value
    },
    [MUTATIONS.ADD_SCORE]: (state, payload) => {
      state.scrore += payload
    },
  },
  actions: {
    persistState: ({ state }) => {
      const data = { cells: state.cells, scrore: state.scrore }
      localStorage.setItem(SAVE_KEY, JSON.stringify(data))
    },
    loadState: ({ commit, dispatch }) => {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) {
        dispatch('createField')
        return
      }
      try {
        const parsed = JSON.parse(raw)
        commit(MUTATIONS.SET_CELLS, parsed.cells)
        commit(MUTATIONS.SET_SCORE, parsed.scrore)
      } catch {
        dispatch('createField')
      }
    },
    createField: ({ state, commit, dispatch }) => {
      commit(MUTATIONS.SET_CELLS, new Array(state.gridSize * state.gridSize).fill(null))
      commit(MUTATIONS.SET_SCORE, 0)
      for (let k = 0; k < 8; k++) {
        dispatch('spawnNumber')
      }
      dispatch('persistState')
    },
    spawnNumber: ({ state, commit, dispatch }) => {
      const free = []
      state.cells.forEach((c, i) => {
        if (c === null) free.push(i)
      })
      if (free.length === 0) {
        alert('Поле заполнено!')
        return
      }
      const pos = free[Math.floor(Math.random() * free.length)]
      const lvl = Math.floor(Math.random() * 3)
      commit(MUTATIONS.SET_CELL, {
        idx: pos,
        value: { tier: lvl, val: NUMBERS[lvl] },
      })
      dispatch('persistState')
    },
    tryMerge: ({ state, commit, dispatch }, { from, to }) => {
      const itemFrom = state.cells[from]
      const itemTo = state.cells[to]
      if (!itemFrom) return
      if (!itemTo) {
        commit(MUTATIONS.SET_CELL, { idx: to, value: itemFrom })
        commit(MUTATIONS.SET_CELL, { idx: from, value: null })
        dispatch('persistState')
        return
      }
      if (itemFrom.tier === itemTo.tier) {
        const nextTier = Math.min(itemFrom.tier + 1, NUMBERS.length - 1)
        commit(MUTATIONS.ADD_SCORE, POINTS_TABLE[nextTier])
        commit(MUTATIONS.SET_CELL, {
          idx: to,
          value: { tier: nextTier, val: NUMBERS[nextTier] },
        })
        commit(MUTATIONS.SET_CELL, { idx: from, value: null })
      } else {
        const tmp = state.cells[from]
        commit(MUTATIONS.SET_CELL, { idx: from, value: state.cells[to] })
        commit(MUTATIONS.SET_CELL, { idx: to, value: tmp })
      }
      dispatch('persistState')
    },
  },
}