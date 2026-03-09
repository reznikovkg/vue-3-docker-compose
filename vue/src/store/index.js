import { createStore } from 'vuex'

import {
  ARTILLERY_COST,
  BARRIER_CATALOG,
  SELLBACK_RATIO,
  SQUAD_COST,
  TOOL_MODES,
  TURRET_INSTALL_COST,
  createBarrier,
  createBattleSnapshot,
  createShell,
  createSquad,
  createTurret,
  getBarrierPrice,
  getMissionById,
  getTurretUpgradePrice,
  recalcArenaGeometry,
  runBattleTick,
  spend,
} from '@/game/battleEngine'

let animationFrameId = null
let lastFrameTime = 0

const state = () => ({
  mission: null,
  arenaSize: null,
  routePixels: [],
  reverseRoutePixels: [],
  budget: 0,
  toolMode: TOOL_MODES.TURRET,
  barrierMaterial: BARRIER_CATALOG[0].id,
  selectedTurretId: null,
  turrets: [],
  hostiles: [],
  squads: [],
  barriers: [],
  shells: [],
  wave: {
    queue: [],
    cursor: 0,
    timer: 0,
    interval: 1200,
  },
  result: null,
})

const mutations = {
  SET_ARENA_SIZE(currentState, arenaSize) {
    const next = recalcArenaGeometry(currentState, arenaSize)
    currentState.arenaSize = next.arenaSize
    currentState.routePixels = next.routePixels
    currentState.reverseRoutePixels = next.reverseRoutePixels
    currentState.turrets = next.turrets
    currentState.hostiles = next.hostiles
    currentState.squads = next.squads
    currentState.barriers = next.barriers
    currentState.shells = next.shells
  },
  LOAD_MISSION(currentState, mission) {
    currentState.mission = mission
    currentState.budget = mission.startBudget
    currentState.toolMode = TOOL_MODES.TURRET
    currentState.barrierMaterial = BARRIER_CATALOG[0].id
    currentState.selectedTurretId = null
    currentState.turrets = []
    currentState.hostiles = []
    currentState.squads = []
    currentState.barriers = []
    currentState.shells = []
    currentState.result = null
    currentState.wave = {
      queue: [...mission.waveOrder],
      cursor: 0,
      timer: 0,
      interval: mission.waveInterval,
    }
  },
  APPLY_TICK(currentState, nextState) {
    currentState.turrets = nextState.turrets
    currentState.hostiles = nextState.hostiles
    currentState.squads = nextState.squads
    currentState.barriers = nextState.barriers
    currentState.shells = nextState.shells
    currentState.budget = nextState.budget
    currentState.wave = nextState.wave
    currentState.result = nextState.result
    if (
      currentState.selectedTurretId &&
      !currentState.turrets.some((turret) => turret.id === currentState.selectedTurretId)
    ) {
      currentState.selectedTurretId = null
    }
  },
  SET_TOOL_MODE(currentState, toolMode) {
    currentState.toolMode = toolMode
  },
  SET_BARRIER_MATERIAL(currentState, barrierMaterial) {
    currentState.barrierMaterial = barrierMaterial
  },
  SELECT_TURRET(currentState, turretId) {
    currentState.selectedTurretId = turretId
  },
  PLACE_TURRET(currentState, turret) {
    currentState.turrets = [...currentState.turrets, turret]
    currentState.budget -= TURRET_INSTALL_COST
    currentState.selectedTurretId = turret.id
  },
  REPLACE_TURRET(currentState, turret) {
    currentState.turrets = currentState.turrets.map((entry) =>
      entry.id === turret.id ? turret : entry
    )
  },
  REMOVE_TURRET(currentState, turretId) {
    const turret = currentState.turrets.find((entry) => entry.id === turretId)
    currentState.turrets = currentState.turrets.filter((entry) => entry.id !== turretId)
    currentState.selectedTurretId = null
    if (turret) {
      currentState.budget += Math.floor(turret.invested * SELLBACK_RATIO)
    }
  },
  CHARGE(currentState, amount) {
    currentState.budget -= amount
  },
  PLACE_BARRIER(currentState, barrier) {
    currentState.barriers = [...currentState.barriers, barrier]
    currentState.budget -= getBarrierPrice(barrier.material)
  },
  FIRE_SHELL(currentState, shell) {
    currentState.shells = [...currentState.shells, shell]
    currentState.budget -= ARTILLERY_COST
  },
  DEPLOY_SQUAD(currentState, squad) {
    currentState.squads = [...currentState.squads, squad]
    currentState.budget -= SQUAD_COST
  },
  RESET_AFTER_RESULT(currentState) {
    if (!currentState.mission) return
    const mission = currentState.mission
    currentState.budget = mission.startBudget
    currentState.selectedTurretId = null
    currentState.turrets = []
    currentState.hostiles = []
    currentState.squads = []
    currentState.barriers = []
    currentState.shells = []
    currentState.result = null
    currentState.wave = {
      queue: [...mission.waveOrder],
      cursor: 0,
      timer: 0,
      interval: mission.waveInterval,
    }
  },
}

const actions = {
  loadMission({ commit, dispatch }, missionId) {
    const mission = getMissionById(missionId)
    if (!mission) return false

    commit('LOAD_MISSION', mission)
    dispatch('refreshArena')
    dispatch('restartLoop')
    return true
  },
  setArenaSize({ commit }, arenaSize) {
    commit('SET_ARENA_SIZE', arenaSize)
  },
  refreshArena({ state, commit }) {
    if (!state.arenaSize) return
    commit('SET_ARENA_SIZE', state.arenaSize)
  },
  chooseTool({ commit }, toolMode) {
    commit('SET_TOOL_MODE', toolMode)
  },
  chooseBarrierMaterial({ commit }, barrierMaterial) {
    commit('SET_BARRIER_MATERIAL', barrierMaterial)
  },
  pressPad({ state, commit }, padId) {
    if (!state.mission) return

    const existingTurret = state.turrets.find((turret) => turret.padId === padId)
    if (existingTurret) {
      commit('SELECT_TURRET', existingTurret.id)
      return
    }

    if (state.toolMode !== TOOL_MODES.TURRET || state.budget < TURRET_INSTALL_COST) return

    const pad = state.mission.pads.find((entry) => entry.id === padId)
    if (!pad || !state.arenaSize) return

    commit(
      'PLACE_TURRET',
      createTurret({
        id: pad.id,
        x: (pad.x / 100) * state.arenaSize.width,
        y: (pad.y / 100) * state.arenaSize.height,
      })
    )
  },
  upgradeSelectedTurret({ state, commit }) {
    const turret = state.turrets.find((entry) => entry.id === state.selectedTurretId)
    if (!turret) return

    const price = getTurretUpgradePrice(turret.level)
    if (!spend(state.budget, price)) return

    commit('CHARGE', price)
    commit('REPLACE_TURRET', {
      ...turret,
      ...createBattleSnapshot.turretLevel(turret.level + 1),
      level: turret.level + 1,
      health: createBattleSnapshot.turretLevel(turret.level + 1).maxHealth,
      invested: turret.invested + price,
    })
  },
  sellSelectedTurret({ state, commit }) {
    if (!state.selectedTurretId) return
    commit('REMOVE_TURRET', state.selectedTurretId)
  },
  pressBarrierSlot({ state, commit }, slotId) {
    if (!state.mission || state.toolMode !== TOOL_MODES.BARRIER) return

    const slot = state.mission.barrierSlots.find((entry) => entry.id === slotId)
    const occupied = state.barriers.some((barrier) => barrier.slotId === slotId)
    const price = getBarrierPrice(state.barrierMaterial)

    if (!slot || !state.arenaSize || occupied || !spend(state.budget, price)) return

    commit(
      'PLACE_BARRIER',
      createBarrier(
        {
          id: slot.id,
          x: (slot.x / 100) * state.arenaSize.width,
          y: (slot.y / 100) * state.arenaSize.height,
          width: (slot.width / 100) * state.arenaSize.width,
          angle: slot.angle,
        },
        state.barrierMaterial
      )
    )
  },
  fireArtillery({ state, commit }, point) {
    if (!state.mission || state.toolMode !== TOOL_MODES.ARTILLERY) return
    if (!spend(state.budget, ARTILLERY_COST)) return

    commit('FIRE_SHELL', createShell(point))
  },
  deploySquad({ state, commit }) {
    if (!state.reverseRoutePixels.length || !spend(state.budget, SQUAD_COST)) return
    commit('DEPLOY_SQUAD', createSquad(state.reverseRoutePixels[0]))
  },
  selectTurret({ commit }, turretId) {
    commit('SELECT_TURRET', turretId)
  },
  tick({ state, commit }, deltaTime) {
    if (!state.mission || !state.routePixels.length || !state.reverseRoutePixels.length) return
    commit('APPLY_TICK', runBattleTick(state, deltaTime))
  },
  startLoop({ dispatch }) {
    if (animationFrameId) return

    lastFrameTime = performance.now()

    const step = (timestamp) => {
      const deltaTime = Math.min(48, timestamp - lastFrameTime)
      lastFrameTime = timestamp
      dispatch('tick', deltaTime)
      animationFrameId = requestAnimationFrame(step)
    }

    animationFrameId = requestAnimationFrame(step)
  },
  stopLoop() {
    if (!animationFrameId) return
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  },
  restartLoop({ dispatch }) {
    dispatch('stopLoop')
    dispatch('startLoop')
  },
  restartMission({ commit, dispatch }) {
    commit('RESET_AFTER_RESULT')
    dispatch('restartLoop')
  },
}

const getters = {
  mission: (currentState) => currentState.mission,
  budget: (currentState) => currentState.budget,
  toolMode: (currentState) => currentState.toolMode,
  barrierMaterial: (currentState) => currentState.barrierMaterial,
  routePixels: (currentState) => currentState.routePixels,
  turrets: (currentState) => currentState.turrets,
  hostiles: (currentState) => currentState.hostiles,
  squads: (currentState) => currentState.squads,
  barriers: (currentState) => currentState.barriers,
  shells: (currentState) => currentState.shells,
  wave: (currentState) => currentState.wave,
  result: (currentState) => currentState.result,
  turretInstallCost: () => TURRET_INSTALL_COST,
  artilleryCost: () => ARTILLERY_COST,
  squadCost: () => SQUAD_COST,
  barrierCatalog: () => BARRIER_CATALOG,
  selectedTurret: (currentState) =>
    currentState.turrets.find((turret) => turret.id === currentState.selectedTurretId) ?? null,
}

export default createStore({
  state,
  mutations,
  actions,
  getters,
})
