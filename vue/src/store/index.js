import { createStore } from 'vuex'

const MUTATIONS = {
  SET_IS_STARTED_GAME: 'SET_IS_STARTED_GAME',
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
  SET_IS_GAME_WON: 'SET_IS_GAME_WON',
  SET_FLASKS: 'SET_FLASKS',
  SET_FLASK_LAYERS: 'SET_FLASK_LAYERS'
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
      flasks: []
    }
  },
  getters: {
    getIsStartedGame: state => state.isStartedGame,
    getQtyFlasks: state => state.qtyFlasks,
    getQtyColors: state => state.qtyColors,
    getMaxQtyLayers: state => state.maxQtyLayers,
    getActiveFlask: state => state.isActiveFlask,
    getTargetFlask: state => state.isTargetFlask,
    getClicks: state => state.clicks,
    getLayersActive: state => state.layersActive,
    getLimitsForRandom: state => state.limitsForRandom,
    getIsReadyFlasks: state => state.isReadyFlasks,
    getIsGameWon: state => state.isGameWon,
    getFlasks: state => state.flasks,
  },
  mutations: {
    [MUTATIONS.SET_IS_STARTED_GAME](state, value) {
      state.isStartedGame = value
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
    [MUTATIONS.SET_IS_GAME_WON](state, value) {
      state.isGameWon = value
    },
    [MUTATIONS.SET_FLASKS](state, value) {
      state.flasks = value
    },
    [MUTATIONS.SET_FLASK_LAYERS](state, { index, layers }) {
      state.flasks[index - 1] = layers
    }
  },
  actions: {
    startGame(store, { isStartedGame, qtyFlasks, qtyColors, maxQtyLayers }) {
      store.commit(MUTATIONS.SET_IS_STARTED_GAME, isStartedGame)
      store.commit(MUTATIONS.SET_QTY_FLASKS, qtyFlasks)
      store.commit(MUTATIONS.SET_QTY_COLORS, qtyColors)
      store.commit(MUTATIONS.SET_MAX_QTY_LAYERS, maxQtyLayers)
      store.commit(MUTATIONS.SET_LAYERS_ACTIVE, [])
      store.commit(MUTATIONS.SET_ACTIVE_FLASK, 0)
      store.commit(MUTATIONS.SET_TARGET_FLASK, 0)
      store.commit(MUTATIONS.RESET_CLICKS)
      store.commit(MUTATIONS.SET_LIMITS_RANDOM, Array(qtyColors).fill(0))
      store.commit(MUTATIONS.SET_IS_READY_FLASKS, Array.from({ length: qtyFlasks }, () => []))
      store.commit(MUTATIONS.SET_IS_GAME_WON, 0)
      store.commit(MUTATIONS.SET_FLASKS, Array.from({ length: qtyFlasks }, () => []))
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
      store.commit(MUTATIONS.SET_FLASK_LAYERS, { index, layers })
    }
  }
})