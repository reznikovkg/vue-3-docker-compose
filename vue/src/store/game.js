export const MUTATIONS = {
  SET_PLAYER_POSITION: 'SET_PLAYER_POSITION',
  SET_MOUSE_POSITION: 'SET_MOUSE_POSITION',
  ADD_ENEMY: 'ADD_ENEMY',
  REMOVE_ENEMY: 'REMOVE_ENEMY',
  UPDATE_ENEMIES: 'UPDATE_ENEMIES',
  ADD_BULLET: 'ADD_BULLET',
  REMOVE_BULLET: 'REMOVE_BULLET',
  UPDATE_BULLETS: 'UPDATE_BULLETS',
  SET_GRID_SIZE: 'SET_GRID_SIZE'
}

export default {
  namespaced: true,
  state: {
    player: {
      x: 0,
      y: 0,
      speed: 5
    },
    mouseX: 0,
    mouseY: 0,
    enemies: [],
    bullets: [],
    gridRows: 20,
    gridCols: 20,
    cellSize: 40
  },
  getters: {
    getPlayer: (state) => state.player,
    getMousePosition: (state) => ({ x: state.mouseX, y: state.mouseY }),
    getEnemies: (state) => state.enemies,
    getBullets: (state) => state.bullets,
    getGridSize: (state) => ({
      rows: state.gridRows,
      cols: state.gridCols,
      cellSize: state.cellSize
    })
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
    }
  },
  actions: {
    setPlayerPosition({ commit }, position) {
      return new Promise((resolve) => {
        commit(MUTATIONS.SET_PLAYER_POSITION, position)
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
    }
  }
}