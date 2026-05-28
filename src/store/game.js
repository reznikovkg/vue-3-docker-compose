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
    spawnEnemy: ({commit, state}, levelId) => {
      const level = levels.find(l => l.id === levelId)
      if (!level || level.path.length === 0) return
      const start = level.path[0]
      commit(MUTATIONS.SPAWN_ENEMY, {
        id: Date.now() + Math.random(),
        x: start.x,
        y: start.y,
        pathIndex: 0,
        progress: 0
      })
    },
    startSpawner: ({state, dispatch, commit}, levelId) => new Promise((resolve) => {
      setTimeout(() => {
        dispatch('spawnEnemy', levelId)
        // Рекурсивный вызов каждые 1.5 сек
        dispatch('startSpawner', levelId).then(resolve)
      }, 1500)
    }),
    gameLoop: ({state, commit}) => {
      commit(MUTATIONS.UPDATE_COOLDOWN)
      
      // Движение врагов по пути
      const level = levels.find(l => l.id === state.curLevelMap)
      if (level) {
        state.activeEnemies.forEach(enemy => {
          if (enemy.pathIndex < level.path.length - 1) {
            enemy.progress += 0.4 // скорость врага
            if (enemy.progress >= 1) {
              enemy.progress = 0
              enemy.pathIndex += 1
            }
            const p1 = level.path[enemy.pathIndex]
            const p2 = level.path[enemy.pathIndex + 1]
            enemy.x = p1.x + (p2.x - p1.x) * enemy.progress
            enemy.y = p1.y + (p2.y - p1.y) * enemy.progress
          } else {
            // Враг дошел до конца пути → удаляем
            state.activeEnemies = state.activeEnemies.filter(e => e.id !== enemy.id)
          }
        })
      }

      state.activeTowers.forEach(tower => {
        if (tower.coolDown  >= 1000 / tower.speed) {
          const targets = state.activeEnemies.filter(e => {
            const dist = Math.sqrt(Math.pow(e.x - tower.x, 2) + Math.pow(e.y - tower.y, 2))
            return dist <= tower.radius
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
        if (!target) {
          return null
        }
        const dx = target.x - b.x
        const dy = target.y - b.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 1) {
          return null
        }
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