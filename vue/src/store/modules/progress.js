import {
  buildDefaultSaveState,
  clear as clearSavedProgress,
  load as loadSavedProgress,
  save as saveProgress,
} from '@/services/saveStorage'

const MUTATIONS = {
  HYDRATE_PROGRESS: 'HYDRATE_PROGRESS',
  SET_SELECTED_LOCATION_ID: 'SET_SELECTED_LOCATION_ID',
  SET_CURRENT_ROD_ID: 'SET_CURRENT_ROD_ID',
  SET_MONEY: 'SET_MONEY',
  ADD_MONEY: 'ADD_MONEY',
  INCREMENT_ATTEMPTS: 'INCREMENT_ATTEMPTS',
  INCREMENT_CATCHES: 'INCREMENT_CATCHES',
  INCREMENT_FAILS: 'INCREMENT_FAILS',
  ADD_CATCH_LOG: 'ADD_CATCH_LOG',
  ADD_INVENTORY_FISH: 'ADD_INVENTORY_FISH',
  REMOVE_INVENTORY_FISH: 'REMOVE_INVENTORY_FISH',
  CLEAR_INVENTORY_FISH: 'CLEAR_INVENTORY_FISH',
}
const DEFAULT_ROD_ID = 'default-rod'
const QUALITY_FACTOR_DIVISOR = 200
const SIZE_FACTOR_DIVISOR = 10

const getFishDefinitionById = (fishDefinitions, fishId) =>
  fishDefinitions.find((fish) => fish.id === fishId) || null

const computeFishSellPrice = (fishDefinition, payload) => {
  const baseValue = Number(fishDefinition?.sellValueBase || 0)
  const quality = Number(payload?.quality || 0)
  const size = Number(payload?.size || 0)
  const scaling =
    1 + quality / QUALITY_FACTOR_DIVISOR + size / SIZE_FACTOR_DIVISOR
  return Math.max(1, Math.round(baseValue * scaling))
}

const buildFishInventoryEntry = (payload, fishDefinition) => ({
  id: `${payload.fishId}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
  fishId: payload.fishId,
  fishName: payload.fishName || fishDefinition?.name || payload.fishId,
  tier: Number(payload.tier || fishDefinition?.tier || 0),
  size: Number(payload.size || 0),
  quality: Number(payload.quality || 0),
  sellPrice: computeFishSellPrice(fishDefinition, payload),
  caughtAt: Date.now(),
})

const buildInitialState = () => ({
  selectedLocationId: null,
  currentRodId: DEFAULT_ROD_ID,
  money: 0,
  catchLog: [],
  inventoryFish: [],
  stats: {
    attempts: 0,
    catches: 0,
    fails: 0,
  },
})

const buildSaveState = (state) => ({
  version: 1,
  selectedLocationId: state.selectedLocationId,
  currentRodId: state.currentRodId,
  money: state.money,
  stats: {
    attempts: state.stats.attempts,
    catches: state.stats.catches,
    fails: state.stats.fails,
  },
  catchLog: state.catchLog,
  inventoryFish: state.inventoryFish,
})

export default {
  namespaced: true,
  state() {
    return buildInitialState()
  },
  getters: {
    getSelectedLocationId: (state) => state.selectedLocationId,
    getCurrentRodId: (state) => state.currentRodId,
    getMoney: (state) => state.money,
    getCatchLog: (state) => state.catchLog,
    getInventoryFish: (state) => state.inventoryFish,
    getStats: (state) => state.stats,
    getCatchRate: (state) => {
      if (state.stats.attempts === 0) {
        return 0
      }

      return Number((state.stats.catches / state.stats.attempts).toFixed(2))
    },
  },
  mutations: {
    [MUTATIONS.HYDRATE_PROGRESS]: (state, payload) => {
      state.selectedLocationId = payload.selectedLocationId ?? null
      state.currentRodId = payload.currentRodId ?? DEFAULT_ROD_ID
      state.money = payload.money ?? 0
      state.catchLog = Array.isArray(payload.catchLog) ? payload.catchLog : []
      state.inventoryFish = Array.isArray(payload.inventoryFish)
        ? payload.inventoryFish
        : []
      state.stats = {
        attempts: payload.stats?.attempts ?? 0,
        catches: payload.stats?.catches ?? 0,
        fails: payload.stats?.fails ?? 0,
      }
    },
    [MUTATIONS.SET_SELECTED_LOCATION_ID]: (state, locationId) => {
      state.selectedLocationId = locationId
    },
    [MUTATIONS.SET_CURRENT_ROD_ID]: (state, rodId) => {
      state.currentRodId = rodId
    },
    [MUTATIONS.SET_MONEY]: (state, money) => {
      state.money = Math.max(0, Number(money || 0))
    },
    [MUTATIONS.ADD_MONEY]: (state, value) => {
      state.money += Math.max(0, Number(value || 0))
    },
    [MUTATIONS.INCREMENT_ATTEMPTS]: (state) => {
      state.stats.attempts += 1
    },
    [MUTATIONS.INCREMENT_CATCHES]: (state) => {
      state.stats.catches += 1
    },
    [MUTATIONS.INCREMENT_FAILS]: (state) => {
      state.stats.fails += 1
    },
    [MUTATIONS.ADD_CATCH_LOG]: (state, payload) => {
      state.catchLog.unshift(payload)
    },
    [MUTATIONS.ADD_INVENTORY_FISH]: (state, payload) => {
      state.inventoryFish.unshift(payload)
    },
    [MUTATIONS.REMOVE_INVENTORY_FISH]: (state, inventoryFishId) => {
      state.inventoryFish = state.inventoryFish.filter(
        (item) => item.id !== inventoryFishId,
      )
    },
    [MUTATIONS.CLEAR_INVENTORY_FISH]: (state) => {
      state.inventoryFish = []
    },
  },
  actions: {
    hydrateProgress({ commit }, payload) {
      commit(MUTATIONS.HYDRATE_PROGRESS, payload || buildInitialState())
    },
    bootstrapProgress({ dispatch }) {
      const saved = loadSavedProgress()
      return dispatch('hydrateProgress', saved || buildDefaultSaveState()).then(
        () =>
          dispatch(
            'gameSession/setActiveLocation',
            saved?.selectedLocationId || null,
            {
              root: true,
            },
          ),
      )
    },
    persistProgress({ state }) {
      saveProgress(buildSaveState(state))
    },
    selectLocation({ commit, dispatch }, locationId) {
      commit(MUTATIONS.SET_SELECTED_LOCATION_ID, locationId)
      return dispatch('gameSession/setActiveLocation', locationId, {
        root: true,
      }).then(() => dispatch('persistProgress'))
    },
    recordAttempt({ commit, dispatch }) {
      commit(MUTATIONS.INCREMENT_ATTEMPTS)
      return dispatch('persistProgress')
    },
    recordCatch({ commit, dispatch, rootGetters }, payload) {
      const fishDefinitions = rootGetters['content/getFishDefinitions'] || []
      const fishDefinition = getFishDefinitionById(
        fishDefinitions,
        payload.fishId,
      )
      const inventoryFishEntry = buildFishInventoryEntry(
        payload,
        fishDefinition,
      )

      commit(MUTATIONS.INCREMENT_ATTEMPTS)
      commit(MUTATIONS.INCREMENT_CATCHES)
      commit(MUTATIONS.ADD_CATCH_LOG, {
        ...payload,
        result: 'caught',
        timestamp: Date.now(),
      })
      commit(MUTATIONS.ADD_INVENTORY_FISH, inventoryFishEntry)
      return dispatch(
        'ui/showResultPanel',
        {
          isSuccess: true,
          message: 'Fish caught.',
        },
        { root: true },
      ).then(() => dispatch('persistProgress'))
    },
    sellFishByInstanceId({ state, commit, dispatch }, inventoryFishId) {
      const fishEntry = state.inventoryFish.find(
        (item) => item.id === inventoryFishId,
      )
      if (!fishEntry) {
        return Promise.resolve(false)
      }

      commit(MUTATIONS.REMOVE_INVENTORY_FISH, inventoryFishId)
      commit(MUTATIONS.ADD_MONEY, fishEntry.sellPrice)

      return dispatch('persistProgress').then(() =>
        dispatch(
          'ui/pushNotification',
          {
            type: 'success',
            message: `Sold ${fishEntry.fishName} for ${fishEntry.sellPrice}.`,
          },
          { root: true },
        ).then(() => true),
      )
    },
    sellAllFish({ state, commit, dispatch }) {
      if (!state.inventoryFish.length) {
        return Promise.resolve(false)
      }

      const totalSellValue = state.inventoryFish.reduce(
        (sum, fishEntry) => sum + Number(fishEntry.sellPrice || 0),
        0,
      )
      const soldCount = state.inventoryFish.length

      commit(MUTATIONS.CLEAR_INVENTORY_FISH)
      commit(MUTATIONS.ADD_MONEY, totalSellValue)

      return dispatch('persistProgress').then(() =>
        dispatch(
          'ui/pushNotification',
          {
            type: 'success',
            message: `Sold ${soldCount} fish for ${totalSellValue}.`,
          },
          { root: true },
        ).then(() => true),
      )
    },
    recordFail({ commit, dispatch }, payload) {
      const failReason = payload?.reason || 'caught_up'
      const isRodBreak = failReason === 'rod_broke'

      if (isRodBreak) {
        commit(MUTATIONS.SET_CURRENT_ROD_ID, DEFAULT_ROD_ID)
      }

      commit(MUTATIONS.INCREMENT_ATTEMPTS)
      commit(MUTATIONS.INCREMENT_FAILS)
      commit(MUTATIONS.ADD_CATCH_LOG, {
        ...payload,
        result: 'failed',
        timestamp: Date.now(),
      })

      const message = isRodBreak
        ? 'Rod broke. Switched to default rod. Fish escaped.'
        : failReason === 'line_snapped'
          ? 'Line snapped. Fish escaped.'
          : 'Fish escaped.'

      return dispatch(
        'ui/showResultPanel',
        {
          isSuccess: false,
          message,
        },
        { root: true },
      ).then(() => dispatch('persistProgress'))
    },
    resetProgress({ commit, dispatch }) {
      commit(MUTATIONS.HYDRATE_PROGRESS, buildInitialState())
      clearSavedProgress()
      return dispatch('gameSession/setActiveLocation', null, { root: true })
    },
  },
}
