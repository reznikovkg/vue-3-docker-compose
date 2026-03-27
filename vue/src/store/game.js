export const MUTATIONS = {
  SET_PLAYER_POSITION: 'SET_PLAYER_POSITION',
  SET_MOUSE_POSITION: 'SET_MOUSE_POSITION',
  ADD_ENEMY: 'ADD_ENEMY',
  REMOVE_ENEMY: 'REMOVE_ENEMY',
  UPDATE_ENEMIES: 'UPDATE_ENEMIES',
  ADD_BULLET: 'ADD_BULLET',
  REMOVE_BULLET: 'REMOVE_BULLET',
  UPDATE_BULLETS: 'UPDATE_BULLETS',
  SET_GRID_SIZE: 'SET_GRID_SIZE',
  SET_PAUSE: 'SET_PAUSE',
  UPDATE_STATS: 'UPDATE_STATS',
  ADD_COINS: 'ADD_COINS',
  ADD_ENEMY_BULLET: 'ADD_ENEMY_BULLET',
  UPDATE_ENEMY_BULLETS: 'UPDATE_ENEMY_BULLETS',
  SET_PLAYER_DIRECTION: 'SET_PLAYER_DIRECTION'
}

export default {
  namespaced: true,
  state: {
    player: {
      x: 0,
      y: 0,
      speed: 5,
      direction: 'down'
    },
    mouseX: 0,
    mouseY: 0,
    enemies: [],
    bullets: [],
    enemyBullets: [],
    gridRows: 20,
    gridCols: 20,
    cellSize: 40,
    isPause: false,
    coins: 0,
    playerStats: {
      health: 100,
      maxHealth: 100,
      mana: 50,
      maxMana: 50,
      damage: 1,
      healthPotionCount: 0,
      manaPotionCount: 0
    }
  },
  getters: {
    getPlayer: (state) => state.player,
    getMousePosition: (state) => ({ x: state.mouseX, y: state.mouseY }),
    getEnemies: (state) => state.enemies,
    getBullets: (state) => state.bullets,
    getEnemyBullets: (state) => state.enemyBullets,
    getGridSize: (state) => ({
      rows: state.gridRows,
      cols: state.gridCols,
      cellSize: state.cellSize
    }),
    getPauseState: (state) => state.isPause,
    getCoins: (state) => state.coins,
    getStats: (state) => state.playerStats
  },
  mutations: {
    [MUTATIONS.SET_PLAYER_POSITION](state, { x, y }) {
      state.player.x = x
      state.player.y = y
    },
    [MUTATIONS.SET_MOUSE_POSITION](state, { x, y }) {
      state.mouseX = x
      state.mouseY = y
    },
    [MUTATIONS.ADD_ENEMY](state, enemy) {
      state.enemies.push(enemy)
    },
    [MUTATIONS.REMOVE_ENEMY](state, index) {
      state.enemies.splice(index, 1)
    },
    [MUTATIONS.UPDATE_ENEMIES](state, enemies) {
      state.enemies = enemies
    },
    [MUTATIONS.ADD_BULLET](state, bullet) {
      state.bullets.push(bullet)
    },
    [MUTATIONS.REMOVE_BULLET](state, index) {
      state.bullets.splice(index, 1)
    },
    [MUTATIONS.UPDATE_BULLETS](state, bullets) {
      state.bullets = bullets
    },
    [MUTATIONS.ADD_ENEMY_BULLET](state, bullet) {
      state.enemyBullets.push(bullet)
    },
    [MUTATIONS.UPDATE_ENEMY_BULLETS](state, bullets) {
      state.enemyBullets = bullets
    },
    [MUTATIONS.SET_PAUSE](state, isPaused) {
      state.isPause = isPaused
    },
    [MUTATIONS.UPDATE_STATS](state, stats) {
      state.playerStats = { ...state.playerStats, ...stats }
    },
    [MUTATIONS.ADD_COINS](state, amount) {
      state.coins += amount
    },
    [MUTATIONS.SET_PLAYER_DIRECTION](state, direction) {
      state.player.direction = direction
    }
  },
  actions: {
    setPlayerPosition({ commit }, position) {
      return new Promise((resolve) => {
        commit(MUTATIONS.SET_PLAYER_POSITION, position)
        resolve()
      })
    },
    setPlayerDirection({ commit }, direction){
      return new Promise((resolve) => {
        commit(MUTATIONS.SET_PLAYER_DIRECTION, direction)
        resolve()
      })
    },
    setMousePosition({ commit }, position) {
      return new Promise((resolve) => {
        commit(MUTATIONS.SET_MOUSE_POSITION, position)
        resolve()
      })
    },
    addEnemy({ commit }, enemy) {
      return new Promise((resolve) => {
        commit(MUTATIONS.ADD_ENEMY, enemy)
        resolve()
      })
    },
    updateEnemies({ commit }, enemies) {
      return new Promise((resolve) => {
        commit(MUTATIONS.UPDATE_ENEMIES, enemies)
        resolve()
      })
    },
    addBullet({ commit }, bullet) {
      return new Promise((resolve) => {
        commit(MUTATIONS.ADD_BULLET, bullet)
        resolve()
      })
    },
    updateBullets({ commit }, bullets) {
      return new Promise((resolve) => {
        commit(MUTATIONS.UPDATE_BULLETS, bullets)
        resolve()
      })
    },
    removeEnemy({ commit }, index) {
      return new Promise((resolve) => {
        commit(MUTATIONS.REMOVE_ENEMY, index)
        resolve()
      })
    },
    removeBullet({ commit }, index) {
      return new Promise((resolve) => {
        commit(MUTATIONS.REMOVE_BULLET, index)
        resolve()
      })
    },
    addEnemyBullet({ commit }, bullet){
      return new Promise((resolve) => {
          commit(MUTATIONS.ADD_ENEMY_BULLET, bullet)
          resolve()
      })

    },
    updateEnemyBullets({ commit }, bullets) {
      return new Promise((resolve) => {
        commit(MUTATIONS.UPDATE_ENEMY_BULLETS, bullets)
        resolve()
      })
    },
    setPause({ commit }, isPaused) {
      return new Promise((resolve) => {
        commit(MUTATIONS.SET_PAUSE, isPaused)
        resolve()})
    },
    updateStats({ commit }, stats) {
      return new Promise((resolve) => {
        commit(MUTATIONS.UPDATE_STATS, stats)
        resolve()})
    },
    addCoins({ commit }, amount) {
      return new Promise((resolve) => {
        commit(MUTATIONS.ADD_COINS, amount)
        resolve()})
    },
  }
}