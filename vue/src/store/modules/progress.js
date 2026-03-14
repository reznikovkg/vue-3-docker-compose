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
  SET_CURRENT_LINE_ID: 'SET_CURRENT_LINE_ID',
  SET_CURRENT_BAIT_ID: 'SET_CURRENT_BAIT_ID',
  SET_MONEY: 'SET_MONEY',
  ADD_MONEY: 'ADD_MONEY',
  SPEND_MONEY: 'SPEND_MONEY',
  INCREMENT_ATTEMPTS: 'INCREMENT_ATTEMPTS',
  INCREMENT_CATCHES: 'INCREMENT_CATCHES',
  INCREMENT_FAILS: 'INCREMENT_FAILS',
  ADD_CATCH_LOG: 'ADD_CATCH_LOG',
  ADD_INVENTORY_FISH: 'ADD_INVENTORY_FISH',
  REMOVE_INVENTORY_FISH: 'REMOVE_INVENTORY_FISH',
  CLEAR_INVENTORY_FISH: 'CLEAR_INVENTORY_FISH',
  SET_GEAR_INVENTORY_COUNT: 'SET_GEAR_INVENTORY_COUNT',
  SET_BOOSTED_LOCATION_ID: 'SET_BOOSTED_LOCATION_ID',
  SET_BOOSTED_CASTS_REMAINING: 'SET_BOOSTED_CASTS_REMAINING',
}
const DEFAULT_ROD_ID = 'spinning'
const DEFAULT_LINE_ID = 'monofilament'
const DEFAULT_BAIT_ID = 'worm'
const QUALITY_FACTOR_DIVISOR = 125
const SIZE_FACTOR_DIVISOR = 10
const FISH_SELL_PRICE_MULTIPLIER = 2
const BOOSTED_CASTS_MIN = 2
const BOOSTED_CASTS_MAX = 4

const getFishDefinitionById = (fishDefinitions, fishId) =>
  fishDefinitions.find((fish) => fish.id === fishId) || null

const getGearInventoryKey = (slot) => {
  if (slot === 'rods') {
    return 'inventoryRods'
  }

  if (slot === 'lines') {
    return 'inventoryLines'
  }

  return 'inventoryBait'
}

const getCurrentGearIdBySlot = (state, slot) => {
  if (slot === 'rods') {
    return state.currentRodId
  }

  if (slot === 'lines') {
    return state.currentLineId
  }

  return state.currentBaitId
}

const getDefaultGearIdBySlot = (slot) => {
  if (slot === 'rods') {
    return DEFAULT_ROD_ID
  }

  if (slot === 'lines') {
    return DEFAULT_LINE_ID
  }

  return DEFAULT_BAIT_ID
}

const getGearDefinition = (rootGetters, slot, id) =>
  rootGetters['content/getGearBySlotAndId'](slot, id)

const getOwnedCount = (state, slot, id) => {
  const inventoryKey = getGearInventoryKey(slot)
  return Number(state[inventoryKey]?.[id] || 0)
}

const getRandomIntInRange = (min, max, rng = Math.random) =>
  Math.floor(rng() * (max - min + 1)) + min

const pickRandomBoostLocationId = (
  locations,
  excludedLocationId = null,
  rng = Math.random,
) => {
  if (!Array.isArray(locations) || !locations.length) {
    return null
  }

  const candidates =
    locations.length > 1
      ? locations.filter((location) => location?.id !== excludedLocationId)
      : locations
  if (!candidates.length) {
    return null
  }

  const randomIndex = Math.floor(rng() * candidates.length)
  return candidates[randomIndex]?.id || null
}

const computeFishSellPrice = (fishDefinition, payload) => {
  const baseValue = Number(fishDefinition?.sellValueBase || 0)
  const quality = Number(payload?.quality || 0)
  const size = Number(payload?.size || 0)
  const scaling =
    1 + quality / QUALITY_FACTOR_DIVISOR + size / SIZE_FACTOR_DIVISOR
  return Math.max(
    1,
    Math.round(baseValue * scaling * FISH_SELL_PRICE_MULTIPLIER),
  )
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
  currentLineId: DEFAULT_LINE_ID,
  currentBaitId: DEFAULT_BAIT_ID,
  money: 0,
  catchLog: [],
  inventoryFish: [],
  inventoryRods: {},
  inventoryLines: {},
  inventoryBait: {},
  boostedLocationId: null,
  boostedCastsRemaining: 0,
  stats: {
    attempts: 0,
    catches: 0,
    fails: 0,
  },
})

const buildSaveState = (state) => ({
  version: 3,
  selectedLocationId: state.selectedLocationId,
  currentRodId: state.currentRodId,
  currentLineId: state.currentLineId,
  currentBaitId: state.currentBaitId,
  money: state.money,
  stats: {
    attempts: state.stats.attempts,
    catches: state.stats.catches,
    fails: state.stats.fails,
  },
  catchLog: state.catchLog,
  inventoryFish: state.inventoryFish,
  inventoryRods: state.inventoryRods,
  inventoryLines: state.inventoryLines,
  inventoryBait: state.inventoryBait,
  boostedLocationId: state.boostedLocationId,
  boostedCastsRemaining: state.boostedCastsRemaining,
})

export default {
  namespaced: true,
  state() {
    return buildInitialState()
  },
  getters: {
    getSelectedLocationId: (state) => state.selectedLocationId,
    getCurrentRodId: (state) => state.currentRodId,
    getCurrentLineId: (state) => state.currentLineId,
    getCurrentBaitId: (state) => state.currentBaitId,
    getEquippedGear: (state) => ({
      rodId: state.currentRodId,
      lineId: state.currentLineId,
      baitId: state.currentBaitId,
    }),
    getMoney: (state) => state.money,
    getCatchLog: (state) => state.catchLog,
    getInventoryFish: (state) => state.inventoryFish,
    getInventoryRods: (state) => state.inventoryRods,
    getInventoryLines: (state) => state.inventoryLines,
    getInventoryBait: (state) => state.inventoryBait,
    getBoostedLocationId: (state) => state.boostedLocationId,
    getBoostedCastsRemaining: (state) => state.boostedCastsRemaining,
    getIsLocationBoosted: (state) => (locationId) =>
      Boolean(
        locationId &&
        state.boostedLocationId === locationId &&
        state.boostedCastsRemaining > 0,
      ),
    getGearInventoryCount: (state) => (slot, id) =>
      getOwnedCount(state, slot, id),
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
      state.currentLineId = payload.currentLineId ?? DEFAULT_LINE_ID
      state.currentBaitId = payload.currentBaitId ?? DEFAULT_BAIT_ID
      state.money = payload.money ?? 0
      state.catchLog = Array.isArray(payload.catchLog) ? payload.catchLog : []
      state.inventoryFish = Array.isArray(payload.inventoryFish)
        ? payload.inventoryFish
        : []
      state.inventoryRods =
        payload.inventoryRods && typeof payload.inventoryRods === 'object'
          ? payload.inventoryRods
          : {}
      state.inventoryLines =
        payload.inventoryLines && typeof payload.inventoryLines === 'object'
          ? payload.inventoryLines
          : {}
      state.inventoryBait =
        payload.inventoryBait && typeof payload.inventoryBait === 'object'
          ? payload.inventoryBait
          : {}
      state.boostedLocationId = payload.boostedLocationId ?? null
      state.boostedCastsRemaining = payload.boostedCastsRemaining ?? 0
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
    [MUTATIONS.SET_CURRENT_LINE_ID]: (state, lineId) => {
      state.currentLineId = lineId
    },
    [MUTATIONS.SET_CURRENT_BAIT_ID]: (state, baitId) => {
      state.currentBaitId = baitId
    },
    [MUTATIONS.SET_MONEY]: (state, money) => {
      state.money = Math.max(0, Number(money || 0))
    },
    [MUTATIONS.ADD_MONEY]: (state, value) => {
      state.money += Math.max(0, Number(value || 0))
    },
    [MUTATIONS.SPEND_MONEY]: (state, value) => {
      state.money = Math.max(0, state.money - Math.max(0, Number(value || 0)))
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
    [MUTATIONS.SET_GEAR_INVENTORY_COUNT]: (state, payload) => {
      const inventoryKey = getGearInventoryKey(payload.slot)
      const nextInventory = {
        ...state[inventoryKey],
      }

      if (payload.count > 0) {
        nextInventory[payload.id] = payload.count
      } else {
        delete nextInventory[payload.id]
      }

      state[inventoryKey] = nextInventory
    },
    [MUTATIONS.SET_BOOSTED_LOCATION_ID]: (state, locationId) => {
      state.boostedLocationId = locationId
    },
    [MUTATIONS.SET_BOOSTED_CASTS_REMAINING]: (state, castsRemaining) => {
      state.boostedCastsRemaining = Math.max(0, Number(castsRemaining || 0))
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
          ).then(() => dispatch('initializeLocationBoost')),
      )
    },
    initializeLocationBoost({ state, commit, dispatch, rootGetters }) {
      const locations = rootGetters['content/getLocations'] || []
      const hasValidBoostLocation = locations.some(
        (location) => location?.id === state.boostedLocationId,
      )
      if (
        hasValidBoostLocation &&
        state.boostedLocationId &&
        state.boostedCastsRemaining > 0
      ) {
        return Promise.resolve(false)
      }

      const nextLocationId = pickRandomBoostLocationId(locations)
      if (!nextLocationId) {
        commit(MUTATIONS.SET_BOOSTED_LOCATION_ID, null)
        commit(MUTATIONS.SET_BOOSTED_CASTS_REMAINING, 0)
        return dispatch('persistProgress').then(() => false)
      }

      commit(MUTATIONS.SET_BOOSTED_LOCATION_ID, nextLocationId)
      commit(
        MUTATIONS.SET_BOOSTED_CASTS_REMAINING,
        getRandomIntInRange(BOOSTED_CASTS_MIN, BOOSTED_CASTS_MAX),
      )
      return dispatch('persistProgress').then(() => true)
    },
    consumeLocationBoostCast({ state, commit, dispatch }, locationId) {
      if (
        !locationId ||
        state.boostedLocationId !== locationId ||
        state.boostedCastsRemaining <= 0
      ) {
        return Promise.resolve(false)
      }

      const nextRemaining = Math.max(0, state.boostedCastsRemaining - 1)
      commit(MUTATIONS.SET_BOOSTED_CASTS_REMAINING, nextRemaining)
      if (nextRemaining > 0) {
        return dispatch('persistProgress').then(() => true)
      }

      return dispatch('rotateLocationBoost', state.boostedLocationId)
    },
    rotateLocationBoost({ commit, dispatch, rootGetters }, excludedLocationId) {
      const locations = rootGetters['content/getLocations'] || []
      const nextLocationId = pickRandomBoostLocationId(
        locations,
        excludedLocationId,
      )
      if (!nextLocationId) {
        commit(MUTATIONS.SET_BOOSTED_LOCATION_ID, null)
        commit(MUTATIONS.SET_BOOSTED_CASTS_REMAINING, 0)
        return dispatch('persistProgress').then(() => false)
      }

      commit(MUTATIONS.SET_BOOSTED_LOCATION_ID, nextLocationId)
      commit(
        MUTATIONS.SET_BOOSTED_CASTS_REMAINING,
        getRandomIntInRange(BOOSTED_CASTS_MIN, BOOSTED_CASTS_MAX),
      )
      return dispatch('persistProgress').then(() => true)
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
    buyGearItem({ state, commit, dispatch, rootGetters }, payload) {
      const slot = payload?.slot
      const itemId = payload?.itemId
      const gearDefinition = getGearDefinition(rootGetters, slot, itemId)
      if (!gearDefinition) {
        return Promise.resolve(false)
      }

      if (gearDefinition.isDefault || gearDefinition.isUnlimited) {
        return Promise.resolve(false)
      }

      const price = Number(gearDefinition.price || 0)
      if (state.money < price) {
        return dispatch(
          'ui/pushNotification',
          {
            type: 'error',
            message: `Not enough money for ${gearDefinition.name}.`,
          },
          { root: true },
        ).then(() => false)
      }

      const ownedCount = getOwnedCount(state, slot, itemId)
      commit(MUTATIONS.SPEND_MONEY, price)
      commit(MUTATIONS.SET_GEAR_INVENTORY_COUNT, {
        slot,
        id: itemId,
        count: ownedCount + 1,
      })

      return dispatch('persistProgress').then(() =>
        dispatch(
          'ui/pushNotification',
          {
            type: 'success',
            message: `Bought ${gearDefinition.name} for ${price}.`,
          },
          { root: true },
        ).then(() => true),
      )
    },
    equipGearItem({ state, commit, dispatch, rootGetters }, payload) {
      const slot = payload?.slot
      const itemId = payload?.itemId
      const gearDefinition = getGearDefinition(rootGetters, slot, itemId)
      if (!gearDefinition) {
        return Promise.resolve(false)
      }

      const ownedCount = getOwnedCount(state, slot, itemId)
      if (!gearDefinition.isUnlimited && ownedCount <= 0) {
        return Promise.resolve(false)
      }

      if (slot === 'rods') {
        commit(MUTATIONS.SET_CURRENT_ROD_ID, itemId)
      } else if (slot === 'lines') {
        commit(MUTATIONS.SET_CURRENT_LINE_ID, itemId)
      } else {
        commit(MUTATIONS.SET_CURRENT_BAIT_ID, itemId)
      }

      return dispatch('persistProgress').then(() =>
        dispatch(
          'ui/pushNotification',
          {
            type: 'success',
            message: `Equipped ${gearDefinition.name}.`,
          },
          { root: true },
        ).then(() => true),
      )
    },
    consumeEquippedBaitOnHook({ state, commit, dispatch, rootGetters }) {
      const currentBaitId = state.currentBaitId
      const baitDefinition = getGearDefinition(
        rootGetters,
        'bait',
        currentBaitId,
      )
      if (!baitDefinition || baitDefinition.isUnlimited) {
        return Promise.resolve(false)
      }

      const ownedCount = getOwnedCount(state, 'bait', currentBaitId)
      const nextCount = Math.max(0, ownedCount - 1)
      commit(MUTATIONS.SET_GEAR_INVENTORY_COUNT, {
        slot: 'bait',
        id: currentBaitId,
        count: nextCount,
      })

      if (nextCount > 0) {
        return dispatch('persistProgress').then(() => true)
      }

      commit(MUTATIONS.SET_CURRENT_BAIT_ID, getDefaultGearIdBySlot('bait'))
      return dispatch('persistProgress').then(() =>
        dispatch(
          'ui/pushNotification',
          {
            type: 'info',
            message: 'Bait depleted. Switched to Worm.',
          },
          { root: true },
        ).then(() => true),
      )
    },
    consumeBrokenGearOnFail({ dispatch }, failReason) {
      if (failReason === 'rod_broke') {
        return dispatch('consumeEquippedGearBySlot', 'rods')
      }

      if (failReason === 'line_snapped') {
        return dispatch('consumeEquippedGearBySlot', 'lines')
      }

      return Promise.resolve(false)
    },
    consumeEquippedGearBySlot({ state, commit, dispatch, rootGetters }, slot) {
      const currentItemId = getCurrentGearIdBySlot(state, slot)
      const gearDefinition = getGearDefinition(rootGetters, slot, currentItemId)
      if (!gearDefinition || gearDefinition.isUnlimited) {
        return Promise.resolve(false)
      }

      const ownedCount = getOwnedCount(state, slot, currentItemId)
      const nextCount = Math.max(0, ownedCount - 1)
      commit(MUTATIONS.SET_GEAR_INVENTORY_COUNT, {
        slot,
        id: currentItemId,
        count: nextCount,
      })

      if (nextCount > 0) {
        return dispatch('persistProgress').then(() =>
          dispatch(
            'ui/pushNotification',
            {
              type: 'warning',
              message: `${gearDefinition.name} was lost.`,
            },
            { root: true },
          ).then(() => true),
        )
      }

      const defaultGearId = getDefaultGearIdBySlot(slot)
      if (slot === 'rods') {
        commit(MUTATIONS.SET_CURRENT_ROD_ID, defaultGearId)
      } else if (slot === 'lines') {
        commit(MUTATIONS.SET_CURRENT_LINE_ID, defaultGearId)
      } else {
        commit(MUTATIONS.SET_CURRENT_BAIT_ID, defaultGearId)
      }

      const fallbackDefinition = getGearDefinition(
        rootGetters,
        slot,
        defaultGearId,
      )
      return dispatch('persistProgress').then(() =>
        dispatch(
          'ui/pushNotification',
          {
            type: 'warning',
            message: `${gearDefinition.name} was lost. Switched to ${fallbackDefinition?.name || defaultGearId}.`,
          },
          { root: true },
        ).then(() => true),
      )
    },
    recordFail({ commit, dispatch }, payload) {
      const failReason = payload?.reason || 'caught_up'

      commit(MUTATIONS.INCREMENT_ATTEMPTS)
      commit(MUTATIONS.INCREMENT_FAILS)
      commit(MUTATIONS.ADD_CATCH_LOG, {
        ...payload,
        result: 'failed',
        timestamp: Date.now(),
      })

      const message =
        failReason === 'rod_broke'
          ? 'Rod broke. Fish escaped.'
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
      return dispatch('gameSession/setActiveLocation', null, {
        root: true,
      }).then(() => dispatch('initializeLocationBoost'))
    },
  },
}
