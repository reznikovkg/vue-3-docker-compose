const MUTATIONS = {
  SET_LEVEL: 'SET_LEVEL',
  SET_TOWERS: 'SET_TOWERS',
  ADD_TOWER: 'ADD_TOWER',
  REMOVE_TOWER: 'REMOVE_TOWER',
  UPGRADE_TOWER: 'UPGRADE_TOWER',
  SET_ENEMIES: 'SET_ENEMIES',
  ADD_ENEMY: 'ADD_ENEMY',
  MOVE_ENEMY: 'MOVE_ENEMY',
  SET_SELECTED_TOWER: 'SET_SELECTED_TOWER',
  SET_GAME_COINS: 'SET_GAME_COINS',
  DECREMENT_LIVES: 'DECREMENT_LIVES',
  RESET_GAME: 'RESET_GAME',
  SET_GAME_OVER: 'SET_GAME_OVER',
}

const ENEMY_TYPES = [
  {
    name: 'basic',
    health: 70,
    speed: 0.4,
    reward: 10,
  },
  {
    name: 'tank',
    health: 150,
    speed: 0.5,
    reward: 25,
  },
  {
    name: 'fast',
    health: 80,
    speed: 1.0,
    reward: 15,
  },
]

export default {
  namespaced: true,
  state() {
    return {
      level: {
        routes: [],
        towerPositions: [],
      },
      towers: [],
      enemies: [],
      selectedTower: null,
      coins: 100,
      isGameOver: false,
    }
  },
  getters: {
    getLevel: (state) => state.level,
    getTowers: (state) => state.towers,
    getEnemies: (state) => state.enemies,
    getSelectedTower: (state) => state.selectedTower,
    getCoins: (state) => state.coins,
    getTowerPositions: (state) => state.level.towerPositions,
    isGameOver: (state) => state.isGameOver,
  },
  mutations: {
    [MUTATIONS.SET_LEVEL]: (state, payload) => {
      state.level = payload
    },
    [MUTATIONS.SET_TOWERS]: (state, payload) => {
      state.towers = payload
    },
    [MUTATIONS.ADD_TOWER]: (state, payload) => {
      state.towers.push(payload)
    },
    [MUTATIONS.REMOVE_TOWER]: (state, payload) => {
      state.towers = state.towers.filter((t) => t.id !== payload)
    },
    [MUTATIONS.UPGRADE_TOWER]: (state, payload) => {
      const tower = state.towers.find((t) => t.id === payload.id)
      if (tower) {
        Object.assign(tower, payload.upgrades)
      }
    },
    [MUTATIONS.SET_ENEMIES]: (state, payload) => {
      state.enemies = payload
    },
    [MUTATIONS.ADD_ENEMY]: (state, payload) => {
      if (!payload) return;
      const typeData = ENEMY_TYPES.find(t => t.name === payload.type) || ENEMY_TYPES[0]
      const enemy = {
        id: Date.now() + Math.random(),
        x: payload.x,
        y: payload.y,
        type: payload.type || 'basic',
        health: payload.health || typeData.health,
        maxHealth: typeData.health,
        speed: typeData.speed|| 0.2,
        routeId: payload.routeId || 1,
        currentPointIndex: payload.currentPointIndex ?? 0,
        reward: typeData.reward,
      }
      state.enemies.push(enemy)
    },
    [MUTATIONS.MOVE_ENEMY]: (state, payload) => {
      const enemy = state.enemies.find((e) => e.id === payload.id)
      if (enemy) {
        enemy.x = payload.x
        enemy.y = payload.y
      }
    },
    [MUTATIONS.SET_SELECTED_TOWER]: (state, payload) => {
      state.selectedTower = payload
    },
    [MUTATIONS.SET_GAME_COINS]: (state, payload) => {
      state.coins = payload
    },
    [MUTATIONS.SET_GAME_OVER]: (state) => {
      state.isGameOver = true
    },
    [MUTATIONS.RESET_GAME]: (state) => {
      state.level = { routes: [], towerPositions: [] }
      state.towers = []
      state.enemies = []
      state.selectedTower = null
      state.coins = 100
      state.isGameOver = false
    },
  },
  actions: {
    setLevel({ commit }, payload) {
      commit(MUTATIONS.SET_LEVEL, payload)
    },
    addTower({ commit, state }, towerData) {
      const cost = towerData.cost || 50
      if (state.coins >= cost) {
        const tower = {
          id: Date.now(),
          x: towerData.x,
          y: towerData.y,
          damage: towerData.damage || 10,
          health: towerData.health || 100,
          fireRate: towerData.fireRate || 1000,
          range: towerData.range || 150,
          level: 1,
          cost: cost,
        }
        commit(MUTATIONS.ADD_TOWER, tower)
        commit(MUTATIONS.SET_GAME_COINS, state.coins - cost)
      }
    },
    removeTower({ commit, state }, towerId) {
      commit(MUTATIONS.REMOVE_TOWER, towerId)
      commit(MUTATIONS.SET_GAME_COINS, state.coins + 25)
    },
    upgradeTower({ commit, state }, { towerId, upgradeType }) {
      const tower = state.towers.find((t) => t.id === towerId)
      if (!tower) {
        console.warn('Такой башни нет:', towerId)
        return
      }

      const upgradeCost = tower.level * 30
      if (state.coins < upgradeCost) return

      const upgrades = {}
      if (upgradeType === 'damage') {
        upgrades.damage = tower.damage + 5
      } else if (upgradeType === 'health') {
        upgrades.health = tower.health + 20
      } else if (upgradeType === 'fireRate') {
        upgrades.fireRate = Math.max(200, tower.fireRate - 100)
      } else if (upgradeType === 'range') {
        upgrades.range = tower.range + 20
      }

      upgrades.level = tower.level + 1
      commit(MUTATIONS.UPGRADE_TOWER, { id: towerId, upgrades })
      commit(MUTATIONS.SET_GAME_COINS, state.coins - upgradeCost)
    },
    addEnemy({ commit }, enemy) {
      commit(MUTATIONS.ADD_ENEMY, enemy)
    },
    moveEnemy({ commit }, { enemyId, x, y }) {
      commit(MUTATIONS.MOVE_ENEMY, { id: enemyId, x, y })
    },
    selectTower({ commit }, tower) {
      commit(MUTATIONS.SET_SELECTED_TOWER, tower)
    },
    setEnemies({ commit }, enemies) {
      commit(MUTATIONS.SET_ENEMIES, enemies)
    },
    addCoins({ commit, state }, amount) {
      commit(MUTATIONS.SET_GAME_COINS, state.coins + amount)
    },

    setGameOver({ commit }) {
      commit(MUTATIONS.SET_GAME_OVER)
    },
    resetGame({ commit }) {
      commit(MUTATIONS.RESET_GAME)
    },
  },
}