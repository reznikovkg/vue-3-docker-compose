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

const MUTATIONS = {
  RESET_SESSION: 'RESET_SESSION',
  SET_ACTIVE_LOCATION_ID: 'SET_ACTIVE_LOCATION_ID',
  SET_PHASE: 'SET_PHASE',
  START_CAST: 'START_CAST',
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
  encounter: null,
  minigame: buildInitialMinigameState(),
  result: null,
})

const getRandomInRange = (min, max) => min + Math.random() * (max - min)
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const normalizeCastAnchor = (castAnchor) => {
  if (
    !castAnchor ||
    !Number.isFinite(castAnchor.x) ||
    !Number.isFinite(castAnchor.y)
  ) {
    return null
  }

  return {
    x: Number(clamp(castAnchor.x, 0, 100).toFixed(2)),
    y: Number(clamp(castAnchor.y, 0, 100).toFixed(2)),
  }
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

const getBiteDelayMs = (rootGetters) => {
  const tuning = rootGetters['content/getTuning']

  const min = tuning?.biteDelayMs?.min || 900
  const max = tuning?.biteDelayMs?.max || 3200

  return Math.floor(getRandomInRange(min, max))
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
    startCast({ state, commit, dispatch }, payload = {}) {
      if (state.phase !== PHASES.IDLE && state.phase !== PHASES.RESULT) {
        return false
      }

      if (!state.activeLocationId) {
        return false
      }

      clearBiteTimeout()
      dispatch('stopMinigameLoop') // synchronous cleanup action
      biteCycleToken += 1
      const currentCycleToken = biteCycleToken
      commit(MUTATIONS.START_CAST, {
        timestamp: Date.now(),
        castAnchor: normalizeCastAnchor(payload.castAnchor),
      })
      dispatch('ui/hideResultPanel', null, { root: true }) // synchronous UI reset
      dispatch('scheduleBite', {
        cycleToken: currentCycleToken,
      }) // synchronous kickoff; timeout handles async
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
        }) // synchronous action call inside timeout
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
      const encounter = rollEncounter(location, fishTables, fishDefinitions)
      if (!encounter) {
        commit(MUTATIONS.SET_PHASE, PHASES.IDLE)
        return false
      }

      commit(MUTATIONS.SET_ENCOUNTER, encounter)
      commit(MUTATIONS.SET_PHASE, PHASES.MINIGAME)
      dispatch('startMinigame', {
        encounter,
      }) // synchronous kickoff; RAF loop is scheduled inside
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

      dispatch('stopMinigameLoop') // synchronous loop reset
      commit(MUTATIONS.SET_MINIGAME_STATE, {
        config,
        elapsedMs: 0,
        lastTickMs: null,
        greenProgress: 0.08,
        redProgress: 0,
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
        }) // synchronous tick action call in RAF
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
        elapsedMs: stepResult.nextState.elapsedMs,
        lastTickMs: timestamp,
        isBarrierBlocking: Boolean(stepResult.meta?.isBarrierBlocking),
      })

      if (stepResult.meta?.isBarrierBlocking && state.minigame.isReeling) {
        commit(MUTATIONS.SET_MINIGAME_STATE, {
          isReeling: false,
        })
      }

      if (stepResult.outcome) {
        dispatch('resolveMinigame', stepResult.outcome) // async chain; no follow-up work here
        return true
      }

      rafId = requestAnimationFrame((nextTimestamp) => {
        dispatch('tickMinigame', {
          timestamp: nextTimestamp,
          loopToken,
        }) // synchronous tick action call in RAF
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
    registerBarrierClick({ state, getters, commit }) {
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
      if (nextClicksDone >= activeBarrier.requiredClicks) {
        commit(MUTATIONS.SET_MINIGAME_STATE, {
          activeBarrierIndex: state.minigame.activeBarrierIndex + 1,
          barrierClicksDone: 0,
          isBarrierBlocking: false,
          isReeling: false,
        })
        return true
      }

      commit(MUTATIONS.SET_MINIGAME_STATE, {
        barrierClicksDone: nextClicksDone,
        isBarrierBlocking: true,
      })
      return true
    },
    resolveMinigame({ state, commit, dispatch }, outcome) {
      dispatch('stopMinigameLoop') // synchronous cleanup action
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
            tier: state.encounter.tier,
          }
        : null

      const progressDispatch = encounterPayload
        ? outcome.status === 'success'
          ? dispatch('progress/recordCatch', encounterPayload, { root: true })
          : dispatch('progress/recordFail', encounterPayload, { root: true })
        : Promise.resolve()

      return progressDispatch.then(() => {
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
      dispatch('stopMinigameLoop') // synchronous cleanup action
      biteCycleToken += 1
      commit(MUTATIONS.RESET_SESSION)
    },
  },
}
