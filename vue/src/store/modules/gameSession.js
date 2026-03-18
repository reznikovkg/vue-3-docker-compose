import { rollEncounter } from '@/game-logic/encounter'
import { buildMinigameConfig, stepMinigame } from '@/game-logic/minigame'
import { defineConfig } from '@/utils/defineConfig'

const PHASES = defineConfig({
  IDLE: 'idle',
  CASTING: 'casting',
  WAITING_BITE: 'waitingBite',
  MINIGAME: 'minigame',
  RESULT: 'result',
})

let biteTimeoutId = null
let biteCycleToken = 0
let rafId = null
let rafCycleToken = 0
const GROUNDBAIT_BASE_RADIUS_PCT = 10
const GROUNDBAIT_RADIUS_MULTIPLIER_PER_TIER = 1.1
const GROUNDBAIT_MAX_TIER = 5
const GROUNDBAIT_BASE_CASTS_REMAINING = 5
const GROUNDBAIT_CAST_BONUS_PER_TIER_STEP = 1
const GROUNDBAIT_TIER_WEIGHT_STEP = 0.2
const LANDING_NET_MIN_PROGRESS = 0.825

const MUTATIONS = {
  RESET_SESSION: 'RESET_SESSION',
  SET_ACTIVE_LOCATION_ID: 'SET_ACTIVE_LOCATION_ID',
  SET_PHASE: 'SET_PHASE',
  START_CAST: 'START_CAST',
  UPSERT_GROUNDBAIT_AREA: 'UPSERT_GROUNDBAIT_AREA',
  REMOVE_GROUNDBAIT_AREA: 'REMOVE_GROUNDBAIT_AREA',
  SET_ENCOUNTER: 'SET_ENCOUNTER',
  SET_MINIGAME_STATE: 'SET_MINIGAME_STATE',
  SET_RESULT: 'SET_RESULT',
}

const buildInitialMinigameState = () => ({
  config: null,
  elapsedMs: 0,
  lastTickMs: null,
  greenProgress: 0,
  redProgress: 0,
  durabilityWear: 0,
  isReeling: false,
  isBarrierBlocking: false,
  activeBarrierIndex: 0,
  barrierClicksDone: 0,
})

const buildInitialState = () => ({
  phase: PHASES.IDLE,
  activeLocationId: null,
  castStartedAt: null,
  castAnchor: null,
  groundbaitAreasByLocation: {},
  encounter: null,
  minigame: buildInitialMinigameState(),
  result: null,
})

const getRandomInRange = (min, max) => min + Math.random() * (max - min)
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const roundValue = (value, precision = 2) => Number(value.toFixed(precision))
const normalizeCastAnchor = (castAnchor) => {
  if (
    !castAnchor ||
    !Number.isFinite(castAnchor.x) ||
    !Number.isFinite(castAnchor.y)
  ) {
    return null
  }

  return {
    x: roundValue(clamp(castAnchor.x, 0, 100)),
    y: roundValue(clamp(castAnchor.y, 0, 100)),
  }
}
const getGroundbaitAreaByLocationId = (state, locationId) => {
  if (!locationId) {
    return null
  }

  return state.groundbaitAreasByLocation?.[locationId] || null
}
const isAnchorInsideGroundbaitArea = (anchor, area) => {
  if (
    !anchor ||
    !area ||
    !Number.isFinite(anchor.x) ||
    !Number.isFinite(anchor.y) ||
    !Number.isFinite(area.center?.x) ||
    !Number.isFinite(area.center?.y) ||
    !Number.isFinite(area.radiusPct) ||
    area.radiusPct <= 0
  ) {
    return false
  }

  const dx = anchor.x - area.center.x
  const dy = anchor.y - area.center.y
  return dx * dx + dy * dy <= area.radiusPct * area.radiusPct
}
const buildNewGroundbaitArea = (definition, anchor) => ({
  baitId: definition.id,
  baitName: definition.name,
  targetFishId: definition.targetFishId,
  tier: 1,
  center: anchor,
  radiusPct: GROUNDBAIT_BASE_RADIUS_PCT,
  castsRemaining: GROUNDBAIT_BASE_CASTS_REMAINING,
})
const getNextGroundbaitArea = (currentArea, definition, anchor) => {
  if (!currentArea) {
    return buildNewGroundbaitArea(definition, anchor)
  }

  if (currentArea.baitId !== definition.id) {
    return buildNewGroundbaitArea(definition, anchor)
  }

  if (!isAnchorInsideGroundbaitArea(anchor, currentArea)) {
    return buildNewGroundbaitArea(definition, anchor)
  }

  const canTierUp = currentArea.tier < GROUNDBAIT_MAX_TIER
  const nextTier = canTierUp ? currentArea.tier + 1 : currentArea.tier
  const nextRadius = canTierUp
    ? roundValue(currentArea.radiusPct * GROUNDBAIT_RADIUS_MULTIPLIER_PER_TIER)
    : currentArea.radiusPct
  const castBonus = canTierUp ? GROUNDBAIT_CAST_BONUS_PER_TIER_STEP : 0

  return {
    ...currentArea,
    tier: nextTier,
    center: anchor,
    radiusPct: nextRadius,
    castsRemaining: currentArea.castsRemaining + castBonus,
  }
}
const consumeGroundbaitCastFromArea = (area) => {
  if (!area) {
    return null
  }

  const remaining = Math.max(0, Number(area.castsRemaining || 0) - 1)
  if (remaining <= 0) {
    return null
  }

  return {
    ...area,
    castsRemaining: remaining,
  }
}
const buildGroundbaitWeightMultipliers = (castAnchor, area) => {
  if (!isAnchorInsideGroundbaitArea(castAnchor, area)) {
    return null
  }

  const tier = Math.max(
    1,
    Math.min(Number(area.tier || 1), GROUNDBAIT_MAX_TIER),
  )
  const multiplier = roundValue(1 + (tier - 1) * GROUNDBAIT_TIER_WEIGHT_STEP)
  if (!area.targetFishId) {
    return null
  }

  return {
    [area.targetFishId]: multiplier,
  }
}
const getDurabilityFailReason = (encounter, rng = Math.random) => {
  const tier = Number(encounter?.tier || 1)
  if (tier === 3 && rng() < 0.4) {
    return 'rod_broke'
  }

  return 'line_snapped'
}
const canUseLandingNetForMinigame = (state, rootGetters) => {
  if (state.phase !== PHASES.MINIGAME) {
    return false
  }

  const encounterSize = Number(state.encounter?.size)
  if (!Number.isFinite(encounterSize)) {
    return false
  }

  const greenProgress = Number(state.minigame?.greenProgress || 0)
  if (greenProgress < LANDING_NET_MIN_PROGRESS) {
    return false
  }

  const landingNetId = rootGetters['progress/getCurrentLandingNetId']
  if (!landingNetId) {
    return false
  }

  const landingNet = rootGetters['content/getLandingNetById'](landingNetId)
  if (!landingNet) {
    return false
  }

  return true
}

const clearBiteTimeout = () => {
  if (biteTimeoutId !== null) {
    clearTimeout(biteTimeoutId)
    biteTimeoutId = null
  }
}

const clearRafLoop = () => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

const buildGearContext = (rootGetters) => {
  const currentRodId = rootGetters['progress/getCurrentRodId']
  const currentLineId = rootGetters['progress/getCurrentLineId']
  const currentBaitId = rootGetters['progress/getCurrentBaitId']

  return {
    rod: rootGetters['content/getGearBySlotAndId']('rods', currentRodId),
    line: rootGetters['content/getGearBySlotAndId']('lines', currentLineId),
    bait: rootGetters['content/getGearBySlotAndId']('bait', currentBaitId),
  }
}

const getBiteDelayMs = (rootGetters) => {
  const tuning = rootGetters['content/getTuning']

  const min = tuning?.biteDelayMs?.min || 900
  const max = tuning?.biteDelayMs?.max || 3200

  return Math.floor(getRandomInRange(min, max))
}

const applyLocationQualityBoost = (encounter, isBoostedLocation) => {
  if (!encounter) {
    return null
  }

  const baseQuality = Number(encounter.quality || 0)
  if (!isBoostedLocation) {
    return {
      ...encounter,
      baseQuality,
      isLocationBoosted: false,
    }
  }

  return {
    ...encounter,
    baseQuality,
    quality: Number((baseQuality * 2).toFixed(2)),
    isLocationBoosted: true,
  }
}

export default {
  namespaced: true,
  state() {
    return buildInitialState()
  },
  getters: {
    getPhases: () => PHASES,
    getPhase: (state) => state.phase,
    getActiveLocationId: (state) => state.activeLocationId,
    getCastStartedAt: (state) => state.castStartedAt,
    getCastAnchor: (state) => state.castAnchor,
    getGroundbaitAreasByLocation: (state) => state.groundbaitAreasByLocation,
    getGroundbaitAreaByLocation: (state) => (locationId) =>
      getGroundbaitAreaByLocationId(state, locationId),
    getActiveGroundbaitArea: (state) =>
      getGroundbaitAreaByLocationId(state, state.activeLocationId),
    getEncounter: (state) => state.encounter,
    getMinigameState: (state) => state.minigame,
    getActiveBarrier: (state) =>
      state.minigame.config?.barriers?.[state.minigame.activeBarrierIndex] ||
      null,
    getBarrierRemainingClicks: (state, getters) => {
      const activeBarrier = getters.getActiveBarrier
      if (!activeBarrier) {
        return 0
      }

      return Math.max(
        activeBarrier.requiredClicks - state.minigame.barrierClicksDone,
        0,
      )
    },
    getIsBarrierBlocking: (state) => state.minigame.isBarrierBlocking,
    getResult: (state) => state.result,
  },
  mutations: {
    [MUTATIONS.RESET_SESSION]: (state) => {
      const initialState = buildInitialState()
      state.phase = initialState.phase
      state.activeLocationId = initialState.activeLocationId
      state.castStartedAt = initialState.castStartedAt
      state.castAnchor = initialState.castAnchor
      state.groundbaitAreasByLocation = initialState.groundbaitAreasByLocation
      state.encounter = initialState.encounter
      state.minigame = initialState.minigame
      state.result = initialState.result
    },
    [MUTATIONS.SET_ACTIVE_LOCATION_ID]: (state, locationId) => {
      state.activeLocationId = locationId
    },
    [MUTATIONS.SET_PHASE]: (state, phase) => {
      state.phase = phase

      if (phase !== PHASES.MINIGAME) {
        state.minigame.isReeling = false
      }
    },
    [MUTATIONS.START_CAST]: (state, payload) => {
      const { timestamp, castAnchor } = payload
      state.phase = PHASES.CASTING
      state.castStartedAt = timestamp
      state.castAnchor = castAnchor
      state.result = null
      state.encounter = null
      state.minigame = buildInitialMinigameState()
    },
    [MUTATIONS.UPSERT_GROUNDBAIT_AREA]: (state, payload) => {
      state.groundbaitAreasByLocation = {
        ...state.groundbaitAreasByLocation,
        [payload.locationId]: payload.area,
      }
    },
    [MUTATIONS.REMOVE_GROUNDBAIT_AREA]: (state, locationId) => {
      const nextAreas = {
        ...state.groundbaitAreasByLocation,
      }
      delete nextAreas[locationId]
      state.groundbaitAreasByLocation = nextAreas
    },
    [MUTATIONS.SET_ENCOUNTER]: (state, encounter) => {
      state.encounter = encounter
    },
    [MUTATIONS.SET_MINIGAME_STATE]: (state, nextState) => {
      state.minigame = {
        ...state.minigame,
        ...nextState,
      }
    },
    [MUTATIONS.SET_RESULT]: (state, result) => {
      state.result = result
      state.phase = PHASES.RESULT
    },
  },
  actions: {
    setActiveLocation({ commit }, locationId) {
      commit(MUTATIONS.SET_ACTIVE_LOCATION_ID, locationId)
    },
    enterPhase({ commit }, phase) {
      commit(MUTATIONS.SET_PHASE, phase)
    },
    attemptLandingNetCatch({ state, rootGetters, dispatch }) {
      if (!canUseLandingNetForMinigame(state, rootGetters)) {
        return Promise.resolve(false)
      }

      const encounterSize = Number(state.encounter?.size || 0)
      const landingNetId = rootGetters['progress/getCurrentLandingNetId']
      const landingNet = rootGetters['content/getLandingNetById'](landingNetId)
      const capacityKg = Number(landingNet?.capacityKg || 0)
      if (encounterSize <= capacityKg) {
        return dispatch('resolveMinigame', {
          status: 'success',
          reason: 'landing_net',
        }).then(() => true)
      }

      return dispatch('progress/consumeEquippedLandingNetOnBreak', null, {
        root: true,
      }).then(() => false)
    },
    startCast({ state, commit, dispatch }, payload = {}) {
      if (state.phase !== PHASES.IDLE && state.phase !== PHASES.RESULT) {
        return false
      }

      if (!state.activeLocationId) {
        return false
      }

      clearBiteTimeout()
      dispatch('stopMinigameLoop') // synchronous action body; immediate loop cleanup
      biteCycleToken += 1
      const currentCycleToken = biteCycleToken
      commit(MUTATIONS.START_CAST, {
        timestamp: Date.now(),
        castAnchor: normalizeCastAnchor(payload.castAnchor),
      })
      dispatch('progress/consumeLocationBoostCast', state.activeLocationId, {
        root: true,
      }) // Promise-returning action; fire-and-forget is intentional
      dispatch('ui/hideResultPanel', null, { root: true }) // synchronous action body; immediate UI reset
      dispatch('scheduleBite', {
        cycleToken: currentCycleToken,
      }) // synchronous action body; schedules timeout-driven flow
      return true
    },
    throwGroundbait({ state, rootGetters, commit, dispatch }, payload = {}) {
      if (state.phase !== PHASES.IDLE && state.phase !== PHASES.RESULT) {
        return Promise.resolve(false)
      }

      if (!state.activeLocationId) {
        return Promise.resolve(false)
      }

      const baitId = payload?.baitId
      const castAnchor = normalizeCastAnchor(payload?.castAnchor)
      if (!baitId || !castAnchor) {
        return Promise.resolve(false)
      }

      const definition = rootGetters['content/getGroundbaitById'](baitId)
      if (!definition) {
        return Promise.resolve(false)
      }

      return dispatch('progress/consumeGroundbaitUse', baitId, {
        root: true,
      }).then((didConsume) => {
        if (!didConsume) {
          return dispatch(
            'ui/pushNotification',
            {
              type: 'error',
              message: `${definition.name} is out of stock.`,
            },
            { root: true },
          ).then(() => false)
        }

        const currentArea = getGroundbaitAreaByLocationId(
          state,
          state.activeLocationId,
        )
        const nextArea = getNextGroundbaitArea(
          currentArea,
          definition,
          castAnchor,
        )
        commit(MUTATIONS.UPSERT_GROUNDBAIT_AREA, {
          locationId: state.activeLocationId,
          area: nextArea,
        })

        return dispatch(
          'ui/pushNotification',
          {
            type: 'success',
            message: `${definition.name} deployed.`,
          },
          { root: true },
        ).then(() => true)
      })
    },
    consumeGroundbaitAreaCast({ state, commit }, locationId) {
      if (!locationId) {
        return false
      }

      const currentArea = getGroundbaitAreaByLocationId(state, locationId)
      if (!currentArea) {
        return false
      }

      const nextArea = consumeGroundbaitCastFromArea(currentArea)
      if (!nextArea) {
        commit(MUTATIONS.REMOVE_GROUNDBAIT_AREA, locationId)
        return true
      }

      commit(MUTATIONS.UPSERT_GROUNDBAIT_AREA, {
        locationId,
        area: nextArea,
      })
      return true
    },
    scheduleBite({ state, rootGetters, commit, dispatch }, payload = {}) {
      if (!state.activeLocationId) {
        return false
      }

      const cycleToken = payload.cycleToken || biteCycleToken
      clearBiteTimeout()
      const delayMs = getBiteDelayMs(rootGetters)
      commit(MUTATIONS.SET_PHASE, PHASES.WAITING_BITE)
      biteTimeoutId = setTimeout(() => {
        dispatch('triggerBite', {
          cycleToken,
        }) // synchronous action body called from timeout
      }, delayMs)

      return true
    },
    triggerBite({ state, rootGetters, commit, dispatch }, payload = {}) {
      if (payload.cycleToken && payload.cycleToken !== biteCycleToken) {
        return false
      }

      if (state.phase !== PHASES.WAITING_BITE) {
        return false
      }

      clearBiteTimeout()
      const location = rootGetters['content/getLocationById'](
        state.activeLocationId,
      )
      const fishTables = rootGetters['content/getFishTables']
      const fishDefinitions = rootGetters['content/getFishDefinitions']
      const gearContext = buildGearContext(rootGetters)
      const groundbaitArea = getGroundbaitAreaByLocationId(
        state,
        state.activeLocationId,
      )
      const fishWeightMultipliers = buildGroundbaitWeightMultipliers(
        state.castAnchor,
        groundbaitArea,
      )
      dispatch('consumeGroundbaitAreaCast', state.activeLocationId) // synchronous action body; consume after this cast snapshots multiplier
      const rolledEncounter = rollEncounter(
        location,
        fishTables,
        fishDefinitions,
        gearContext,
        fishWeightMultipliers,
      )
      if (!rolledEncounter) {
        commit(MUTATIONS.SET_PHASE, PHASES.IDLE)
        return false
      }
      const isBoostedLocation = rootGetters['progress/getIsLocationBoosted'](
        state.activeLocationId,
      )
      const encounter = applyLocationQualityBoost(
        rolledEncounter,
        isBoostedLocation,
      )

      dispatch('progress/consumeEquippedBaitOnHook', null, { root: true }) // Promise-returning action; no immediate minigame dependency
      commit(MUTATIONS.SET_ENCOUNTER, encounter)
      commit(MUTATIONS.SET_PHASE, PHASES.MINIGAME)
      dispatch('startMinigame', {
        encounter,
      }) // synchronous action body; schedules RAF loop internally
      return true
    },
    startMinigame({ state, rootGetters, commit, dispatch }, payload = {}) {
      if (state.phase !== PHASES.MINIGAME) {
        return false
      }

      const encounter = payload.encounter || state.encounter
      if (!encounter) {
        commit(MUTATIONS.SET_PHASE, PHASES.IDLE)
        return false
      }

      const tuning = rootGetters['content/getTuning']
      const config = buildMinigameConfig(encounter, tuning)
      if (!config) {
        commit(MUTATIONS.SET_PHASE, PHASES.IDLE)
        return false
      }

      dispatch('stopMinigameLoop') // synchronous action body; immediate loop reset
      commit(MUTATIONS.SET_MINIGAME_STATE, {
        config,
        elapsedMs: 0,
        lastTickMs: null,
        greenProgress: 0.08,
        redProgress: 0,
        durabilityWear: 0,
        isReeling: false,
        isBarrierBlocking: false,
        activeBarrierIndex: 0,
        barrierClicksDone: 0,
      })

      rafCycleToken += 1
      const loopToken = rafCycleToken
      rafId = requestAnimationFrame((timestamp) => {
        dispatch('tickMinigame', {
          timestamp,
          loopToken,
        }) // synchronous action body called from RAF
      })

      return true
    },
    tickMinigame({ state, commit, dispatch }, payload = {}) {
      const { timestamp = performance.now(), loopToken } = payload
      if (loopToken && loopToken !== rafCycleToken) {
        return false
      }

      if (state.phase !== PHASES.MINIGAME || !state.minigame.config) {
        clearRafLoop()
        return false
      }

      const lastTickMs = state.minigame.lastTickMs
      const dtMs = Math.max(
        0,
        Math.min(lastTickMs === null ? 16 : timestamp - lastTickMs, 50),
      )
      const runtimeState = {
        greenProgress: state.minigame.greenProgress,
        redProgress: state.minigame.redProgress,
        durabilityWear: state.minigame.durabilityWear,
        elapsedMs: state.minigame.elapsedMs,
        activeBarrierIndex: state.minigame.activeBarrierIndex,
        barrierClicksDone: state.minigame.barrierClicksDone,
      }
      const inputState = {
        isReeling: state.minigame.isReeling,
      }

      const stepResult = stepMinigame(
        runtimeState,
        dtMs,
        inputState,
        state.minigame.config,
      )
      commit(MUTATIONS.SET_MINIGAME_STATE, {
        greenProgress: stepResult.nextState.greenProgress,
        redProgress: stepResult.nextState.redProgress,
        durabilityWear: stepResult.nextState.durabilityWear,
        elapsedMs: stepResult.nextState.elapsedMs,
        lastTickMs: timestamp,
        isBarrierBlocking: Boolean(stepResult.meta?.isBarrierBlocking),
      })

      if (stepResult.meta?.isBarrierBlocking && state.minigame.isReeling) {
        commit(MUTATIONS.SET_MINIGAME_STATE, {
          isReeling: false,
        })
      }

      if (stepResult.outcome?.status === 'success') {
        dispatch('resolveMinigame', stepResult.outcome) // Promise-returning action; no dependent work in this tick
        return true
      }

      if (stepResult.nextState.durabilityWear >= 1) {
        dispatch('resolveMinigame', {
          status: 'fail',
          reason: getDurabilityFailReason(state.encounter),
        }) // Promise-returning action; no dependent work in this tick
        return true
      }

      if (stepResult.outcome) {
        dispatch('resolveMinigame', stepResult.outcome) // Promise-returning action; no dependent work in this tick
        return true
      }

      rafId = requestAnimationFrame((nextTimestamp) => {
        dispatch('tickMinigame', {
          timestamp: nextTimestamp,
          loopToken,
        }) // synchronous action body called from RAF
      })

      return true
    },
    setReeling({ state, commit, getters }, isReeling) {
      if (isReeling && state.phase !== PHASES.MINIGAME) {
        return false
      }

      if (isReeling && getters.getIsBarrierBlocking) {
        return false
      }

      commit(MUTATIONS.SET_MINIGAME_STATE, {
        isReeling: Boolean(isReeling),
      })
      return true
    },
    registerBarrierClick({ state, getters, commit, dispatch }) {
      if (state.phase !== PHASES.MINIGAME) {
        return false
      }

      const activeBarrier = getters.getActiveBarrier
      if (!activeBarrier) {
        return false
      }

      if (!getters.getIsBarrierBlocking) {
        return false
      }

      const nextClicksDone = state.minigame.barrierClicksDone + 1
      const nextDurabilityWear = clamp(
        (state.minigame.durabilityWear || 0) +
          (state.minigame.config?.barrierClickWear || 0),
        0,
        1,
      )

      if (nextClicksDone >= activeBarrier.requiredClicks) {
        commit(MUTATIONS.SET_MINIGAME_STATE, {
          activeBarrierIndex: state.minigame.activeBarrierIndex + 1,
          barrierClicksDone: 0,
          durabilityWear: nextDurabilityWear,
          isBarrierBlocking: false,
          isReeling: false,
        })
      } else {
        commit(MUTATIONS.SET_MINIGAME_STATE, {
          barrierClicksDone: nextClicksDone,
          durabilityWear: nextDurabilityWear,
          isBarrierBlocking: true,
        })
      }

      if (nextDurabilityWear >= 1) {
        dispatch('resolveMinigame', {
          status: 'fail',
          reason: getDurabilityFailReason(state.encounter),
        }) // Promise-returning action; no dependent work in this click handler
        return true
      }

      return true
    },
    resolveMinigame({ state, commit, dispatch }, outcome) {
      dispatch('stopMinigameLoop') // synchronous action body; immediate loop cleanup
      commit(MUTATIONS.SET_MINIGAME_STATE, {
        isReeling: false,
        isBarrierBlocking: false,
      })

      const encounterPayload = state.encounter
        ? {
            locationId: state.activeLocationId,
            fishId: state.encounter.fishId,
            fishName: state.encounter.fishName,
            size: state.encounter.size,
            quality: state.encounter.quality,
            tier: state.encounter.tier,
            reason: outcome.reason,
          }
        : null

      const progressDispatch = encounterPayload
        ? outcome.status === 'success'
          ? dispatch('progress/recordCatch', encounterPayload, { root: true })
          : dispatch('progress/recordFail', encounterPayload, { root: true })
        : Promise.resolve()

      return progressDispatch
        .then(() =>
          outcome.status === 'fail'
            ? dispatch('progress/consumeBrokenGearOnFail', outcome.reason, {
                root: true,
              })
            : Promise.resolve(),
        )
        .then(() => {
          commit(MUTATIONS.SET_RESULT, {
            status: outcome.status,
            reason: outcome.reason,
            encounter: state.encounter,
          })
        })
    },
    stopMinigameLoop() {
      clearRafLoop()
      rafCycleToken += 1
    },
    setEncounter({ commit }, encounter) {
      commit(MUTATIONS.SET_ENCOUNTER, encounter)
    },
    setMinigameState({ commit }, nextState) {
      commit(MUTATIONS.SET_MINIGAME_STATE, nextState)
    },
    setResult({ commit }, result) {
      commit(MUTATIONS.SET_RESULT, result)
    },
    resetSession({ commit, dispatch }) {
      clearBiteTimeout()
      dispatch('stopMinigameLoop') // synchronous action body; immediate loop cleanup
      biteCycleToken += 1
      commit(MUTATIONS.RESET_SESSION)
    },
  },
}
