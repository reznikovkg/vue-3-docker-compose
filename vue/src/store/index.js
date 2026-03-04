import { createStore } from 'vuex'

const TOWER_LEVELS = [
  { level: 1, damage: 10,  hp: 100, fireRate: 2000, range: 80,  cost: 50,  upgradeCost: 75  },
  { level: 2, damage: 20,  hp: 180, fireRate: 1600, range: 100, cost: 50,  upgradeCost: 120 },
  { level: 3, damage: 35,  hp: 280, fireRate: 1200, range: 125, cost: 50,  upgradeCost: 200 },
  { level: 4, damage: 55,  hp: 400, fireRate: 900,  range: 155, cost: 50,  upgradeCost: 300 },
  { level: 5, damage: 80,  hp: 550, fireRate: 600,  range: 190, cost: 50,  upgradeCost: null },
]

const LEVELS = [
  {
    id: 1,
    name: 'Лесная тропа',
    mapWidth: 900,
    mapHeight: 600,
    path: [
      { x: 0,   y: 100 },
      { x: 200, y: 100 },
      { x: 200, y: 400 },
      { x: 500, y: 400 },
      { x: 500, y: 200 },
      { x: 750, y: 200 },
      { x: 750, y: 500 },
      { x: 900, y: 500 },
    ],
    towerSlots: [
      { id: 's1', x: 100, y: 250 },
      { id: 's2', x: 350, y: 250 },
      { id: 's3', x: 350, y: 500 },
      { id: 's4', x: 650, y: 350 },
      { id: 's5', x: 850, y: 350 },
    ],
    enemySpawns: [
      { x: 80,  y: 100 },
      { x: 160, y: 100 },
    ],
  },
  {
    id: 2,
    name: 'Пустынный перевал',
    mapWidth: 900,
    mapHeight: 600,
    path: [
      { x: 0,   y: 300 },
      { x: 150, y: 300 },
      { x: 150, y: 100 },
      { x: 400, y: 100 },
      { x: 400, y: 500 },
      { x: 650, y: 500 },
      { x: 650, y: 200 },
      { x: 900, y: 200 },
    ],
    towerSlots: [
      { id: 's1', x: 280, y: 200 },
      { id: 's2', x: 280, y: 400 },
      { id: 's3', x: 530, y: 300 },
      { id: 's4', x: 780, y: 350 },
    ],
    enemySpawns: [
      { x: 50,  y: 300 },
      { x: 120, y: 300 },
      { x: 50,  y: 360 },
    ],
  },
]

let _enemyIdCounter = 1

export default createStore({
  state: () => ({
    gold: 300,
    currentLevelId: 1,
    towers: {},
    enemies: [],
    selectedTowerSlotId: null,
    draggingEnemyId: null,
  }),

  getters: {
    currentLevel: s => LEVELS.find(l => l.id === s.currentLevelId),
    allLevels: () => LEVELS,
    towerLevelsConfig: () => TOWER_LEVELS,
    towerInSlot: s => slotId => s.towers[slotId] || null,
    selectedTower: s => s.towers[s.selectedTowerSlotId] || null,
    selectedSlotId: s => s.selectedTowerSlotId,
  },

  mutations: {
    SET_LEVEL (state, levelId) {
      state.currentLevelId = levelId
      state.towers = {}
      state.selectedTowerSlotId = null

      const lvl = LEVELS.find(l => l.id === levelId)
      state.enemies = lvl.enemySpawns.map(spawn => ({
        id: _enemyIdCounter++,
        x: spawn.x,
        y: spawn.y,
        hp: 100,
        maxHp: 100,
      }))
    },

    BUILD_TOWER (state, slotId) {
      if (state.gold < TOWER_LEVELS[0].cost) return
      if (state.towers[slotId]) return
      state.gold -= TOWER_LEVELS[0].cost
      state.towers[slotId] = {
        slotId,
        level: 1,
        ...TOWER_LEVELS[0],
      }
    },

    UPGRADE_TOWER (state, slotId) {
      const tower = state.towers[slotId]
      if (!tower) return
      const nextCfg = TOWER_LEVELS[tower.level]
      if (!nextCfg) return
      if (state.gold < nextCfg.upgradeCost) return
      state.gold -= nextCfg.upgradeCost ?? 0
      state.towers[slotId] = {
        slotId,
        level: nextCfg.level,
        ...nextCfg,
      }
    },

    REMOVE_TOWER (state, slotId) {
      if (!state.towers[slotId]) return
      state.gold += Math.floor(TOWER_LEVELS[0].cost / 2)
      delete state.towers[slotId]
      if (state.selectedTowerSlotId === slotId) state.selectedTowerSlotId = null
    },

    SELECT_SLOT (state, slotId) {
      state.selectedTowerSlotId = state.selectedTowerSlotId === slotId ? null : slotId
    },

    MOVE_ENEMY_KEYBOARD (state, { id, dx, dy }) {
      const e = state.enemies.find(e => e.id === id)
      if (!e) return
      e.x += dx
      e.y += dy
    },

    MOVE_ENEMY_DRAG (state, { id, x, y }) {
      const e = state.enemies.find(e => e.id === id)
      if (!e) return
      e.x = x
      e.y = y
    },

    DAMAGE_ENEMY (state, { id, damage }) {
      const e = state.enemies.find(e => e.id === id)
      if (!e) return
      e.hp = Math.max(0, e.hp - damage)
    },

    SET_DRAGGING_ENEMY (state, id) {
      state.draggingEnemyId = id
    },

    ADD_ENEMY (state) {
      const lvl = LEVELS.find(l => l.id === state.currentLevelId)
      state.enemies.push({
        id: _enemyIdCounter++,
        x: lvl.path[0].x + 10,
        y: lvl.path[0].y,
        hp: 100,
        maxHp: 100,
      })
    },

    REMOVE_ENEMY (state, id) {
      state.enemies = state.enemies.filter(e => e.id !== id)
    },

    KILL_REWARD (state, reward) {
      state.gold += reward
    },

    ADD_GOLD (state, amount) {
      state.gold += amount
    },
  },

  actions: {
    loadLevel ({ commit }, levelId) {
      commit('SET_LEVEL', levelId)
    },
    buildTower ({ commit }, slotId) {
      commit('BUILD_TOWER', slotId)
    },
    upgradeTower ({ commit }, slotId) {
      commit('UPGRADE_TOWER', slotId)
    },
    removeTower ({ commit }, slotId) {
      commit('REMOVE_TOWER', slotId)
    },
    selectSlot ({ commit }, slotId) {
      commit('SELECT_SLOT', slotId)
    },
    moveEnemyKeyboard ({ commit }, payload) {
      commit('MOVE_ENEMY_KEYBOARD', payload)
    },
    moveEnemyDrag ({ commit }, payload) {
      commit('MOVE_ENEMY_DRAG', payload)
    },
    setDraggingEnemy ({ commit }, id) {
      commit('SET_DRAGGING_ENEMY', id)
    },
    addEnemy ({ commit }) {
      commit('ADD_ENEMY')
    },
    removeEnemy ({ commit }, id) {
      commit('REMOVE_ENEMY', id)
    },
    damageEnemy ({ commit }, payload) {
      commit('DAMAGE_ENEMY', payload)
    },
    cheatGold ({ commit }) {
      commit('ADD_GOLD', 200)
    },
  },
})