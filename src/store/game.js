import {levels} from '../data/levels'
import {characteristics} from '../data/characteristics'

const MUTATIONS = {
  SET_LEVEL: 'SET_LEVEL',
  SET_TOWER: 'SET_TOWER',
  UPDATE_TOWER: 'UPDATE_TOWER',
  DELETE_TOWER: 'DELETE_TOWER',
  CREATE_BULLET: 'CREATE_BULLET',
  FLIGHT_BULLET: 'FLIGHT_BULLET',
  UPDATE_ENEMY_POS: 'UPDATE_ENEMY_POS',
  UPDATE_COOLDOWN: 'UPDATE_COOLDOWN',
  RESET_COOLDOWN: 'RESET_COOLDOWN',
  CLEAR_STATE: 'CLEAR_STATE',
  SPAWN_ENEMY: 'SPAWN_ENEMY'
}

export default {
  namespaced: true,
  state () {
    return {
      curLevelMap: 1,
      activeTowers: [],
      activeEnemies: [],
      activeBullets: [],
    }
  },
  getters: {
    getCurLevelMap: (state) => state.curLevelMap,
    getActiveTowers: (state) => state.activeTowers,
    getCurLevelData: (state) => levels.find(l => l.id === state.curLevelMap),
    getActiveEnemies: (state) => state.activeEnemies,
    getActiveBullets: (state) => state.activeBullets,
  },
  mutations: {
    [MUTATIONS.SET_LEVEL]: (state, payload) => {
      state.curLevelMap = payload
      state.activeTowers = []
    },
    [MUTATIONS.SET_TOWER]: (state, payload) => {
      state.activeTowers.push(payload)
    },
    [MUTATIONS.UPDATE_TOWER]: (state, payload) => {
      state.activeTowers[payload.index] = payload.data
    },
    [MUTATIONS.DELETE_TOWER]: (state, payload) => {
      state.activeTowers = state.activeTowers.filter(t => t.id !== payload)
    },
    [MUTATIONS.CREATE_BULLET]: (state, payload) => {
      state.activeBullets.push(payload)
    },
    [MUTATIONS.FLIGHT_BULLET]: (state, payload) => {
      state.activeBullets = payload
    },
    [MUTATIONS.UPDATE_ENEMY_POS]: (state, payload) => {
      const enemy = state.activeEnemies.find(e => e.id === payload.id)
      if (enemy) {
        enemy.x = payload.x
        enemy.y = payload.y
      }
    },
    [MUTATIONS.UPDATE_COOLDOWN]: (state) => {
      state.activeTowers.forEach(tower => {
        tower.coolDown += 1
      })
    },
    [MUTATIONS.RESET_COOLDOWN]: (state, payload) => {
      const tower = state.activeTowers.find(t => t.id === payload.id)
      if (tower) {
        tower.coolDown = 0
      }
    },
    [MUTATIONS.CLEAR_STATE]: (state) => {
      state.activeEnemies = []
      state.activeBullets = []
    },
    [MUTATIONS.SPAWN_ENEMY]: (state, payload) => {
      state.activeEnemies.push(payload)
    }
  },
  actions: {
    initLevel: ({commit}, payload) => {
      commit(MUTATIONS.SET_LEVEL, payload)
    },
    buildTower: ({state, commit}, {slotId, levelId}) => {
      const stats = characteristics.find(c => c.id === levelId)
      const levelData = levels.find(l => l.id === state.curLevelMap)
      if (!levelData) return
      const slot = levelData.slots.find(s => s.id === slotId)
      commit(MUTATIONS.SET_TOWER, {
        ...stats,
        ...slot,
        levelId: levelId,
        coolDown: 0
      })
    },
    upgradeTower: ({state, commit}, slotId) => {
      const index = state.activeTowers.findIndex(t => t.id === slotId)
      const curTower = state.activeTowers[index]
      const nextLevel = curTower.levelId + 1
      const newStats = characteristics.find(c => c.id === nextLevel)
      commit(MUTATIONS.UPDATE_TOWER, {
        index,
        data: {...curTower, ...newStats, levelId: nextLevel, id: curTower.id, coolDown: 0}
      })
    },
    deleteTower: ({commit}, payload) => {
      commit(MUTATIONS.DELETE_TOWER, payload)
    },
    moveEnemy: ({commit}, payload) => {
      commit(MUTATIONS.UPDATE_ENEMY_POS, payload)
    },
    clearGameState: ({commit}) => {
      commit(MUTATIONS.CLEAR_STATE)
    },
    spawnEnemies: ({commit, state}, levelId) => {
      const level = levels.find(l => l.id === levelId)
      if (!level || level.path.length === 0) return
      const start = level.path[0]
      // Спавним ровно 2 врага в начале пути
      for (let i = 0; i < 2; i++) {
        commit(MUTATIONS.SPAWN_ENEMY, {
          id: Date.now() + Math.random(),
          x: start.x,
          y: start.y
          // pathIndex и progress больше не нужны
        })
      }
    },
    gameLoop: ({state, commit}) => {
      commit(MUTATIONS.UPDATE_COOLDOWN)
      
      // ← УБРАНО: автоматическое движение врагов
      // Враги теперь двигаются только через drag (moveEnemy)

      state.activeTowers.forEach(tower => {
        const speed = tower.speed || 1
        const radius = tower.radius || 50
        
        if (tower.coolDown >= 1000 / speed) {
          const targets = state.activeEnemies.filter(e => {
            const dist = Math.sqrt(Math.pow(e.x - tower.x, 2) + Math.pow(e.y - tower.y, 2))
            return dist <= radius
          })
          if (targets.length > 0) {
            targets.forEach(target => {
              commit(MUTATIONS.CREATE_BULLET, {
                id: Math.random(),
                x: tower.x,
                y: tower.y,
                targetId: target.id
              })
            })
            commit(MUTATIONS.RESET_COOLDOWN, {id: tower.id})
          }
        }
      })
      
      const moveBullets = state.activeBullets.map(b => {
        const target = state.activeEnemies.find(e => e.id === b.targetId)
        if (!target) return null
        const dx = target.x - b.x
        const dy = target.y - b.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 1) return null
        return {
          ...b, 
          x: b.x + (dx / dist) * 2,
          y: b.y + (dy / dist) * 2,
        }
      }).filter(b => b != null)
      commit(MUTATIONS.FLIGHT_BULLET, moveBullets)
    }
  },
}