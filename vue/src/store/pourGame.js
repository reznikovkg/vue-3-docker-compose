import { MODES, DEFAULT_MODE, MAX_LAYERS, COLORS, FLASK_COUNT, MAX_RECORDS } from './pourGameConfig'

let timerRef = null

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const buildFlasks = () => {
  const allLayers = COLORS.flatMap(color => Array(MAX_LAYERS).fill(color))
  const shuffled = shuffle(allLayers)

  const result = []
  for (let i = 0; i < COLORS.length; i++) {
    result.push(shuffled.slice(i * MAX_LAYERS, (i + 1) * MAX_LAYERS))
  }

  for (let i = 0; i < FLASK_COUNT - COLORS.length; i++) {
    result.push([])
  }

  return result.map(f => [...f])
}

const MUTATIONS = {
  SET_FLASKS: 'SET_FLASKS',
  SET_SELECTED: 'SET_SELECTED',
  SET_DIFFICULTY: 'SET_DIFFICULTY',
  TICK: 'TICK',
  START_TIMER: 'START_TIMER',
  STOP_TIMER: 'STOP_TIMER',
  RESET_TIMER: 'RESET_TIMER',
  LOAD_RECORDS: 'LOAD_RECORDS',
}

export default {
  namespaced: true,
  state () {
    return {
      flasks: [],
      selectedFlaskIdx: null,
      difficulty: DEFAULT_MODE,
      blockedIdx: null,
      timerSeconds: 0,
      timerRunning: false,
      records: {},
    }
  },
  getters: {
    difficulty: (state) => state.difficulty,
    blockedIdx: (state) => state.blockedIdx,
    flasks: (state) => state.flasks,
    selectedFlaskIdx: (state) => state.selectedFlaskIdx,
    isWin: (state) => {
      const nonEmpty = state.flasks.filter(f => f.length > 0)
      if (nonEmpty.length === 0) return false
      return nonEmpty.every(f => new Set(f).size === 1 && f.length === MAX_LAYERS)
    },
    hasValidMoves: (state) => {
      const mode = MODES[state.difficulty]
      const nonEmpty = state.flasks
        .map((f, i) => ({ f, i }))
        .filter(({ f }) => f.length > 0)

      return nonEmpty.some(({ f: from, i: fromIdx }) => {
        const topColor = from[from.length - 1]
        return state.flasks
          .map((t, i) => ({ t, i }))
          .filter(({ i }) => i !== fromIdx && !(i === state.blockedIdx && mode.blockPerMove > 0))
          .some(({ t }) => t.length < MAX_LAYERS && (t.length === 0 || t[t.length - 1] === topColor))
      })
    },
    timerDisplay: (state) => {
      const m = Math.floor(state.timerSeconds / 60).toString().padStart(2, '0')
      const s = (state.timerSeconds % 60).toString().padStart(2, '0')
      return `${m}:${s}`
    },
    records: (state) => state.records[state.difficulty] || [],
    allRecords: (state) => state.records,
  },
  mutations: {
    [MUTATIONS.SET_FLASKS]: (state, { newFlasks, newBlockedIdx, isWin }) => {
      state.flasks = newFlasks
      if (isWin) {
        state.blockedIdx = null
        if (timerRef) {
          clearInterval(timerRef)
          timerRef = null
        }
        state.timerRunning = false
        const modeKey = state.difficulty
        const modeRecords = [...(state.records[modeKey] || []), state.timerSeconds]
        modeRecords.sort((a, b) => a - b)
        state.records = { ...state.records, [modeKey]: modeRecords.slice(0, MAX_RECORDS) }
        localStorage.setItem('pourGameRecords', JSON.stringify(state.records))
      } else {
        state.blockedIdx = newBlockedIdx
      }
    },
    [MUTATIONS.SET_SELECTED]: (state, idx) => {
      state.selectedFlaskIdx = idx
    },
    [MUTATIONS.SET_DIFFICULTY]: (state, difficulty) => {
      state.difficulty = difficulty
    },
    [MUTATIONS.TICK]: (state) => {
      state.timerSeconds++
    },
    [MUTATIONS.START_TIMER]: (state) => {
      state.timerRunning = true
    },
    [MUTATIONS.STOP_TIMER]: (state) => {
      state.timerRunning = false
    },
    [MUTATIONS.RESET_TIMER]: (state) => {
      state.timerSeconds = 0
    },
    [MUTATIONS.LOAD_RECORDS]: (state) => {
      try {
        const raw = localStorage.getItem('pourGameRecords')
        state.records = raw ? JSON.parse(raw) : {}
      } catch {
        state.records = {}
      }
    },
  },
  actions: {
    initGame ({ commit, state }) {
      if (timerRef) {
        clearInterval(timerRef)
        timerRef = null
      }
      commit(MUTATIONS.SET_SELECTED, null)
      commit(MUTATIONS.SET_FLASKS, {
        newFlasks: buildFlasks(),
        newBlockedIdx: null,
        isWin: false,
      })
      commit(MUTATIONS.RESET_TIMER)
      commit(MUTATIONS.STOP_TIMER)
    },
    startTimer ({ commit, state }) {
      if (state.timerRunning) return
      commit(MUTATIONS.START_TIMER)
      timerRef = setInterval(() => {
        commit(MUTATIONS.TICK)
      }, 1000)
    },
    pour ({ state, commit }, { fromIdx, toIdx }) {
      const from = [...state.flasks[fromIdx]]
      const to = [...state.flasks[toIdx]]
      const mode = MODES[state.difficulty]

      if (from.length === 0) return
      if (to.length >= MAX_LAYERS) return
      if (toIdx === state.blockedIdx && mode.blockPerMove > 0) return

      const topColor = from[from.length - 1]
      if (to.length > 0 && to[to.length - 1] !== topColor) return

      let topCount = 0
      for (let i = from.length - 1; i >= 0; i--) {
        if (from[i] === topColor) topCount++
        else break
      }

      const freeSpace = MAX_LAYERS - to.length
      const toPour = Math.min(topCount, freeSpace)

      const newFrom = from.slice(0, from.length - toPour)
      const newTo = [...to, ...Array(toPour).fill(topColor)]

      const newFlasks = state.flasks.map((f, i) => {
        if (i === fromIdx) return newFrom
        if (i === toIdx) return newTo
        return f
      })

      const isWin = newFlasks.filter(f => f.length > 0).every(f => new Set(f).size === 1 && f.length === MAX_LAYERS)

      let newBlockedIdx = null
      if (!isWin && mode.blockPerMove > 0) {
        const candidates = newFlasks
          .map((f, i) => ({ f, i }))
          .filter(({ f, i }) => f.length > 0 && i !== fromIdx)
          .map(({ i }) => i)
        if (candidates.length > 0) {
          newBlockedIdx = candidates[Math.floor(Math.random() * candidates.length)]
        }
      }

      if (!state.timerRunning) {
        commit(MUTATIONS.START_TIMER)
        timerRef = setInterval(() => {
          commit(MUTATIONS.TICK)
        }, 1000)
      }

      commit(MUTATIONS.SET_FLASKS, { newFlasks, newBlockedIdx, isWin })
    },
    loadRecords ({ commit }) {
      commit(MUTATIONS.LOAD_RECORDS)
    },
  },
}
