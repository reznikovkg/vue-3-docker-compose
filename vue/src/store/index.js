import { createStore } from 'vuex'

const STORAGE_KEYS = {
  RECORDS: 'water-sort-records-top-10'
}

const MUTATIONS = {
  SET_IS_STARTED_GAME: 'SET_IS_STARTED_GAME',
  SET_IS_GAME_WON: 'SET_IS_GAME_WON',
  SET_QTY_FLASKS: 'SET_QTY_FLASKS',
  SET_QTY_COLORS: 'SET_QTY_COLORS',
  SET_MAX_QTY_LAYERS: 'SET_MAX_QTY_LAYERS',

  SET_ACTIVE_FLASK: 'SET_ACTIVE_FLASK',
  RESET_ACTIVE_FLASK: 'RESET_ACTIVE_FLASK',
  SET_TARGET_FLASK: 'SET_TARGET_FLASK',
  RESET_TARGET_FLASK: 'RESET_TARGET_FLASK',
  INCREMENT_CLICKS: 'INCREMENT_CLICKS',
  RESET_CLICKS: 'RESET_CLICKS',

  SET_LAYERS_ACTIVE: 'SET_LAYERS_ACTIVE',
  SET_LIMITS_RANDOM: 'SET_LIMITS_RANDOM',
  SET_IS_READY_FLASKS: 'SET_IS_READY_FLASKS',
  SET_FLASKS: 'SET_FLASKS',
  UPDATE_FLASK_LAYERS: 'UPDATE_FLASK_LAYERS',

  SET_HARD_MODE: 'SET_HARD_MODE',
  SET_NUMBER_BLOCKED_FLASK: 'SET_NUMBER_BLOCKED_FLASK',
  SET_TIME: 'SET_TIME',

  SET_RECORDS: 'SET_RECORDS',
  SET_DRAGGED_FLASK_INDEX: 'SET_DRAGGED_FLASK_INDEX'
}

function loadRecordsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Ошибка чтения рекордов из localStorage', error)
    return []
  }
}

function saveRecordsToStorage(records) {
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records))
  } catch (error) {
    console.error('Ошибка сохранения рекордов в localStorage', error)
  }
}

function calculateScore({ time, qtyFlasks, qtyColors, maxQtyLayers, hardMode }) {
  const safeTime = Math.max(time, 1)
  const complexity = qtyColors * 100 + maxQtyLayers * 40 + qtyFlasks * 15 + (hardMode ? 120 : 0)

  return Number((complexity / safeTime).toFixed(4))
}

function normalizeRecord(record) {
  return {
    time: Number(record.time) || 0,
    qtyFlasks: Number(record.qtyFlasks) || 0,
    qtyColors: Number(record.qtyColors) || 0,
    maxQtyLayers: Number(record.maxQtyLayers) || 0,
    hardMode: Boolean(record.hardMode),
    score: Number(record.score) || 0,
    createdAt: record.createdAt || new Date().toISOString()
  }
}

export default createStore({
  state() {
    return {
      isStartedGame: 0,
      isGameWon: 0,

      qtyFlasks: 0,
      qtyColors: 0,
      maxQtyLayers: 0,

      isActiveFlask: 0,
      isTargetFlask: 0,
      clicks: 0,

      layersActive: [],
      limitsForRandom: [],
      isReadyFlasks: [],
      flasks: [],

      hardMode: false,
      numberBlockedFlask: 0,
      time: 0,

      records: [],
      draggedFlaskIndex: 0
    }
  },

  getters: {
    getIsStartedGame: state => state.isStartedGame,
    getIsGameWon: state => state.isGameWon,

    getQtyFlasks: state => state.qtyFlasks,
    getQtyColors: state => state.qtyColors,
    getMaxQtyLayers: state => state.maxQtyLayers,

    getActiveFlask: state => state.isActiveFlask,
    getTargetFlask: state => state.isTargetFlask,
    getClicks: state => state.clicks,

    getLayersActive: state => state.layersActive,
    getLimitsForRandom: state => state.limitsForRandom,
    getIsReadyFlasks: state => state.isReadyFlasks,
    getFlasks: state => state.flasks,

    getHardMode: state => state.hardMode,
    getNumberBlockedFlask: state => state.numberBlockedFlask,
    getTime: state => state.time,

    getRecords: state => state.records,
    getTopRecords: state => state.records,
    getDraggedFlaskIndex: state => state.draggedFlaskIndex
  },

  mutations: {
    [MUTATIONS.SET_IS_STARTED_GAME](state, value) {
      state.isStartedGame = value
    },
    [MUTATIONS.SET_IS_GAME_WON](state, value) {
      state.isGameWon = value
    },
    [MUTATIONS.SET_QTY_FLASKS](state, value) {
      state.qtyFlasks = value
    },
    [MUTATIONS.SET_QTY_COLORS](state, value) {
      state.qtyColors = value
    },
    [MUTATIONS.SET_MAX_QTY_LAYERS](state, value) {
      state.maxQtyLayers = value
    },

    [MUTATIONS.SET_ACTIVE_FLASK](state, value) {
      state.isActiveFlask = value
    },
    [MUTATIONS.RESET_ACTIVE_FLASK](state) {
      state.isActiveFlask = 0
    },
    [MUTATIONS.SET_TARGET_FLASK](state, value) {
      state.isTargetFlask = value
    },
    [MUTATIONS.RESET_TARGET_FLASK](state) {
      state.isTargetFlask = 0
    },
    [MUTATIONS.INCREMENT_CLICKS](state) {
      state.clicks += 1
    },
    [MUTATIONS.RESET_CLICKS](state) {
      state.clicks = 0
    },

    [MUTATIONS.SET_LAYERS_ACTIVE](state, value) {
      state.layersActive = value
    },
    [MUTATIONS.SET_LIMITS_RANDOM](state, value) {
      state.limitsForRandom = value
    },
    [MUTATIONS.SET_IS_READY_FLASKS](state, value) {
      state.isReadyFlasks = value
    },
    [MUTATIONS.SET_FLASKS](state, value) {
      state.flasks = value
    },
    [MUTATIONS.UPDATE_FLASK_LAYERS](state, { index, layers }) {
      state.flasks[index - 1] = layers
    },

    [MUTATIONS.SET_HARD_MODE](state, value) {
      state.hardMode = value
    },
    [MUTATIONS.SET_NUMBER_BLOCKED_FLASK](state, value) {
      state.numberBlockedFlask = value
    },
    [MUTATIONS.SET_TIME](state, value) {
      state.time = value
    },

    [MUTATIONS.SET_RECORDS](state, value) {
      state.records = value
    },

    [MUTATIONS.SET_DRAGGED_FLASK_INDEX](state, value) {
      state.draggedFlaskIndex = value
    }
  },

  actions: {
    startGame(store, { isStartedGame, qtyFlasks, qtyColors, maxQtyLayers, hardMode }) {
      store.commit(MUTATIONS.SET_IS_STARTED_GAME, isStartedGame)
      store.commit(MUTATIONS.SET_IS_GAME_WON, 0)

      store.commit(MUTATIONS.SET_QTY_FLASKS, qtyFlasks)
      store.commit(MUTATIONS.SET_QTY_COLORS, qtyColors)
      store.commit(MUTATIONS.SET_MAX_QTY_LAYERS, maxQtyLayers)

      store.commit(MUTATIONS.SET_ACTIVE_FLASK, 0)
      store.commit(MUTATIONS.SET_TARGET_FLASK, 0)
      store.commit(MUTATIONS.RESET_CLICKS)
      store.commit(MUTATIONS.SET_LAYERS_ACTIVE, [])

      store.commit(MUTATIONS.SET_LIMITS_RANDOM, Array(qtyColors).fill(0))
      store.commit(MUTATIONS.SET_IS_READY_FLASKS, Array.from({ length: qtyFlasks }, () => []))
      store.commit(MUTATIONS.SET_FLASKS, Array.from({ length: qtyFlasks }, () => []))

      store.commit(MUTATIONS.SET_HARD_MODE, hardMode)
      store.commit(MUTATIONS.SET_NUMBER_BLOCKED_FLASK, 0)
      store.commit(MUTATIONS.SET_TIME, 0)
      store.commit(MUTATIONS.SET_DRAGGED_FLASK_INDEX, 0)
    },

    pickActiveFlask(store, { isActiveFlask }) {
      store.commit(MUTATIONS.SET_ACTIVE_FLASK, isActiveFlask)
      store.commit(MUTATIONS.INCREMENT_CLICKS)
    },

    updateActiveFlask(store, { layersActive }) {
      store.commit(MUTATIONS.SET_LAYERS_ACTIVE, layersActive)
    },

    pickTargetFlask(store, { isTargetFlask }) {
      store.commit(MUTATIONS.SET_TARGET_FLASK, isTargetFlask)
      store.commit(MUTATIONS.RESET_CLICKS)
    },

    resetFlasks(store) {
      store.commit(MUTATIONS.RESET_ACTIVE_FLASK)
      store.commit(MUTATIONS.RESET_TARGET_FLASK)
      store.commit(MUTATIONS.SET_NUMBER_BLOCKED_FLASK, 0)
    },

    updateLimitsRandom(store, { limitsForRandom }) {
      store.commit(MUTATIONS.SET_LIMITS_RANDOM, limitsForRandom)
    },

    updateReadyFlasks(store, { isReadyFlasks }) {
      store.commit(MUTATIONS.SET_IS_READY_FLASKS, isReadyFlasks)
    },

    updateIsGameWon(store, { isGameWon }) {
      store.commit(MUTATIONS.SET_IS_GAME_WON, isGameWon)
    },

    updateFlaskLayers(store, { index, layers }) {
      store.commit(MUTATIONS.UPDATE_FLASK_LAYERS, { index, layers })
    },

    setHardMode(store, { hardMode }) {
      store.commit(MUTATIONS.SET_HARD_MODE, hardMode)
    },

    setNumberBlockedFlask(store, { numberBlockedFlask }) {
      store.commit(MUTATIONS.SET_NUMBER_BLOCKED_FLASK, numberBlockedFlask)
    },

    setTime(store, { time }) {
      store.commit(MUTATIONS.SET_TIME, time)
    },

    loadRecords(store) {
      const records = loadRecordsFromStorage().map(normalizeRecord)
      store.commit(MUTATIONS.SET_RECORDS, records)
    },

    saveRecord(store) {
      const record = normalizeRecord({
        time: store.state.time,
        qtyFlasks: store.state.qtyFlasks,
        qtyColors: store.state.qtyColors,
        maxQtyLayers: store.state.maxQtyLayers,
        hardMode: store.state.hardMode,
        score: calculateScore({
          time: store.state.time,
          qtyFlasks: store.state.qtyFlasks,
          qtyColors: store.state.qtyColors,
          maxQtyLayers: store.state.maxQtyLayers,
          hardMode: store.state.hardMode
        }),
        createdAt: new Date().toISOString()
      })

      const records = [...store.state.records, record]
        .sort((first, second) => {
          if (first.time !== second.time) {
            return first.time - second.time
          }

          return second.score - first.score
        })
        .slice(0, 10)

      store.commit(MUTATIONS.SET_RECORDS, records)
      saveRecordsToStorage(records)
    },

    setDraggedFlaskIndex(store, { index }) {
      store.commit(MUTATIONS.SET_DRAGGED_FLASK_INDEX, index)
    },

    reorderFlasks(store, { fromIndex, toIndex }) {
      if (!fromIndex || !toIndex || fromIndex === toIndex) {
        return
      }

      const flasks = [...store.state.flasks]
      const readyFlasks = [...store.state.isReadyFlasks]

      const fromPosition = fromIndex - 1
      const toPosition = toIndex - 1

      const [movedFlask] = flasks.splice(fromPosition, 1)
      flasks.splice(toPosition, 0, movedFlask)

      const [movedReadyFlask] = readyFlasks.splice(fromPosition, 1)
      readyFlasks.splice(toPosition, 0, movedReadyFlask)

      store.commit(MUTATIONS.SET_FLASKS, flasks)
      store.commit(MUTATIONS.SET_IS_READY_FLASKS, readyFlasks)

      if (store.state.isActiveFlask === fromIndex) {
        store.commit(MUTATIONS.SET_ACTIVE_FLASK, toIndex)
      } else if (store.state.isActiveFlask > 0) {
        let nextActiveIndex = store.state.isActiveFlask

        if (fromIndex < store.state.isActiveFlask && toIndex >= store.state.isActiveFlask) {
          nextActiveIndex -= 1
        } else if (fromIndex > store.state.isActiveFlask && toIndex <= store.state.isActiveFlask) {
          nextActiveIndex += 1
        }

        store.commit(MUTATIONS.SET_ACTIVE_FLASK, nextActiveIndex)
      }

      if (store.state.numberBlockedFlask === fromIndex) {
        store.commit(MUTATIONS.SET_NUMBER_BLOCKED_FLASK, toIndex)
      } else if (store.state.numberBlockedFlask > 0) {
        let nextBlockedIndex = store.state.numberBlockedFlask

        if (fromIndex < store.state.numberBlockedFlask && toIndex >= store.state.numberBlockedFlask) {
          nextBlockedIndex -= 1
        } else if (fromIndex > store.state.numberBlockedFlask && toIndex <= store.state.numberBlockedFlask) {
          nextBlockedIndex += 1
        }

        store.commit(MUTATIONS.SET_NUMBER_BLOCKED_FLASK, nextBlockedIndex)
      }

      store.commit(MUTATIONS.SET_DRAGGED_FLASK_INDEX, 0)
    }
  }
})