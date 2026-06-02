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
  SPAWN_ENEMY: 'SPAWN_ENEMY',
  MOVE_ENEMIES: 'MOVE_ENEMIES',
  SET_GAME_OVER: 'SET_GAME_OVER',
  SET_MONEY: 'SET_MONEY',
  SET_POINTS: 'SET_POINTS',
  DAMAGE_ENEMY: 'DAMAGE_ENEMY',
  KILL_ENEMY: 'KILL_ENEMY'
}

export default {
  namespaced: true,
  state () {
    return {
      curLevelMap: 1,
      activeTowers: [],
      activeEnemies: [],
      activeBullets: [],
      isGameOver: false,
      money: 100,
      points: 0,
    }
  },
  getters: {
    getCurLevelMap: (state) => state.curLevelMap,
    getActiveTowers: (state) => state.activeTowers,
    getCurLevelData: (state) => levels.find(l => l.id === state.curLevelMap),
    getActiveEnemies: (state) => state.activeEnemies,
    getActiveBullets: (state) => state.activeBullets,
    getIsGameOver: (state) => state.isGameOver,
    getMoney: (state) => state.money,
    getPoints: (state) => state.points,
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
    },
    [MUTATIONS.MOVE_ENEMIES]: (state, {path, speed}) => {
      state.activeEnemies = state.activeEnemies.filter(enemy => {
        if (enemy.pathIndex >= path.length - 1 && enemy.progress >= 1) {
          return false
        }
        enemy.progress += speed
        if (enemy.progress >= 1) {
          enemy.progress = 0
          enemy.pathIndex += 1
        }
        if (enemy.pathIndex < path.length - 1) {
          const p1 = path[enemy.pathIndex]
          const p2 = path[enemy.pathIndex + 1]
          enemy.x = p1.x + (p2.x - p1.x) * enemy.progress
          enemy.y = p1.y + (p2.y - p1.y) * enemy.progress
        }
        return true
      })
    },
    [MUTATIONS.SET_GAME_OVER]: (state, payload) => {
      state.isGameOver = payload
    },
    [MUTATIONS.SET_MONEY]: (state, payload) => {
      state.money = payload
    },
    [MUTATIONS.SET_POINTS]: (state, payload) => {
      state.points = payload
    },
    [MUTATIONS.DAMAGE_ENEMY]: (state, { id, damage }) => {
      const enemy = state.activeEnemies.find(e => e.id === id)
      if (enemy) {
        enemy.hp -= damage
      }
    },
    [MUTATIONS.KILL_ENEMY]: (state, id) => {
      const enemyIndex = state.activeEnemies.findIndex(e => e.id === id)
      if (enemyIndex !== -1) {
        const enemy = state.activeEnemies[enemyIndex]
        state.money += enemy.reward
        state.points += enemy.reward
        state.activeEnemies.splice(enemyIndex, 1)
      }
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
      if (state.money < stats.cost) return
      commit(MUTATIONS.SET_TOWER, {
        ...stats,
        ...slot,
        levelId: levelId,
        coolDown: 0
      })
      commit(MUTATIONS.SET_MONEY, state.money - stats.cost)
    },
    upgradeTower: ({state, commit}, slotId) => {
      const index = state.activeTowers.findIndex(t => t.id === slotId)
      const curTower = state.activeTowers[index]
      const nextLevel = curTower.levelId + 1
      const newStats = characteristics.find(c => c.id === nextLevel)
      if (!newStats || state.money < newStats.cost) return
      commit(MUTATIONS.UPDATE_TOWER, {
        index,
        data: {...curTower, ...newStats, levelId: nextLevel, id: curTower.id, coolDown: 0}
      })
      commit(MUTATIONS.SET_MONEY, state.money - newStats.cost)
    },
    deleteTower: ({commit}, payload) => {
      commit(MUTATIONS.DELETE_TOWER, payload)
    },
    moveEnemy: ({commit}, payload) => {
      commit(MUTATIONS.UPDATE_ENEMY_POS, payload)
    },
    clearGameState: ({commit}) => {
      commit(MUTATIONS.CLEAR_STATE)
      commit(MUTATIONS.SET_GAME_OVER, false)
      commit(MUTATIONS.SET_MONEY, 100)
      commit(MUTATIONS.SET_POINTS, 0)
    },
    restartGame: ({commit, dispatch, state}) => {
      commit(MUTATIONS.SET_GAME_OVER, false)
      commit(MUTATIONS.CLEAR_STATE)
      commit(MUTATIONS.SET_MONEY, 100)
      commit(MUTATIONS.SET_POINTS, 0)
      setTimeout(() => {
        dispatch('spawnEnemies', state.curLevelMap)
      }, 100)
    },
    spawnEnemies: ({commit}, levelId) => {
      const level = levels.find(l => l.id === levelId)
      if (!level || !level.enemySpawn) return
      const start = level.path[0]
      level.enemySpawn.forEach((config, index) => {
        setTimeout(() => {
          commit(MUTATIONS.SPAWN_ENEMY, {
            id: Date.now() + Math.random() * 1000 + index,
            x: start.x,
            y: start.y,
            pathIndex: 0,
            progress: 0,
            hp: config.hp,
            maxHp: config.hp,
            reward: config.reward
          })
        }, index * 3000)
      })
    },
    gameLoop: ({state, commit}) => {
      const level = levels.find(l => l.id === state.curLevelMap)
      
      if (level && !state.isGameOver) {
        const reachedEnd = state.activeEnemies.some(e => 
          e.pathIndex === level.path.length - 1 && e.progress >= 0.95
        )
        if (reachedEnd) {
          commit(MUTATIONS.SET_GAME_OVER, true)
          return
        }
        commit(MUTATIONS.MOVE_ENEMIES, {path: level.path, speed: 0.005})
      }
      commit(MUTATIONS.UPDATE_COOLDOWN)
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
        if (dist < 1) {
          commit(MUTATIONS.DAMAGE_ENEMY, { id: b.targetId, damage: 5 })
          return null
        }
        return {
          ...b, 
          x: b.x + (dx / dist) * 2,
          y: b.y + (dy / dist) * 2,
        }
      }).filter(b => b != null)
      commit(MUTATIONS.FLIGHT_BULLET, moveBullets)
      state.activeEnemies.forEach(enemy => {
        if (enemy.hp <= 0) {
          commit(MUTATIONS.KILL_ENEMY, enemy.id)
        }
      })
    }
  },
}