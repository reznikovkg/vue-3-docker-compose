import {levels} from '../data/levels'
import {characteristics} from '../data/characteristics'
import {enemyTypes} from '../data/enemyTypes'

const getPathLength = (path) => {
  let length = 0
  for (let i = 1; i < path.length; i++) {
    const dx = path[i].x - path[i - 1].x
    const dy = path[i].y - path[i - 1].y
    length += Math.sqrt(dx * dx + dy * dy)
  }
  return length
}
const getPointOnPath = (path, distance) => {
  if (distance <= 0) {
    return {x: path[0].x, y: path[0].y}
  }
  let curDistance = 0
  for (let i = 1; i < path.length; i++) {
    const startPoint = path[i - 1]
    const endPoint = path[i]
    const dx = endPoint.x - startPoint.x
    const dy = endPoint.y - startPoint.y
    const segment = Math.sqrt(dx * dx + dy * dy)
    if (curDistance + segment >= distance) {
      const k = (distance - curDistance) / segment
      return {x: startPoint.x + dx * k, y: startPoint.y + dy * k}
    }
    curDistance += segment
  }
  return {x: path[path.length - 1].x, y: path[path.length - 1].y}
}
const createEnemyQueue = (level) => {
  const startPoint = level.path[0]
  return level.enemies.map(enemy => {
    const enemyType = enemyTypes.find(type => type.id === enemy.typeId)
    if (!enemyType) {
      return null
    }
    return {
      id: enemy.id,
      typeId: enemy.typeId,
      hp: enemyType.hp,
      speed: enemyType.speed,
      reward: enemyType.reward,
      color: enemyType.color,
      spawnDelay: enemy.delay,
      distance: 0,
      x: startPoint.x,
      y: startPoint.y
    }
  }).filter(enemy => enemy !== null)
}

const MUTATIONS = {
  SET_LEVEL: 'SET_LEVEL',
  SET_TOWER: 'SET_TOWER',
  UPDATE_TOWER: 'UPDATE_TOWER',
  DELETE_TOWER: 'DELETE_TOWER',
  CREATE_BULLET: 'CREATE_BULLET',
  FLIGHT_BULLET: 'FLIGHT_BULLET',
  UPDATE_COOLDOWN: 'UPDATE_COOLDOWN',
  RESET_COOLDOWN: 'RESET_COOLDOWN',
  SET_ENEMY_QUEUE: 'SET_ENEMY_QUEUE',
  ADD_ACTIVE_ENEMY: 'ADD_ACTIVE_ENEMY',
  DELETE_ENEMY_FROM_QUEUE: 'DELETE_ENEMY_FROM_QUEUE',
  INCREASE_SPAWN_TIMER: 'INCREASE_SPAWN_TIMER',
  MOVE_ENEMIES_BY_PATH: 'MOVE_ENEMIES_BY_PATH',
  HIT_ENEMY: 'HIT_ENEMY',
  SET_POINTS: 'SET_POINTS',
  REMOVE_POINTS: 'REMOVE_POINTS',
  SET_GAME_OVER: 'SET_GAME_OVER',
}

export default {
  namespaced: true,
  state () {
    return {
      curLevelMap: 1,
      activeTowers: [],
      activeEnemies: [],
      activeBullets: [],
      enemyQueue: [],
      spawnTimer: 0,
      points: 0,
      isGameOver: false,
    }
  },
  getters: {
    getCurLevelMap: (state) => state.curLevelMap,
    getActiveTowers: (state) => state.activeTowers,
    getCurLevelData: (state) => levels.find(l => l.id === state.curLevelMap),
    getActiveEnemies: (state) => state.activeEnemies,
    getActiveBullets: (state) => state.activeBullets,
    getPoints: (state) => state.points,
    getIsGameOver: (state) => state.isGameOver,
  },
  mutations: {
    [MUTATIONS.SET_LEVEL]: (state, payload) => {
      state.curLevelMap = payload
      state.activeTowers = []
      state.activeEnemies = []
      state.activeBullets = []
      state.enemyQueue = []
      state.spawnTimer = 0
      state.points = 0
      state.isGameOver = false
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
    [MUTATIONS.UPDATE_COOLDOWN]: (state) => {
      state.activeTowers.forEach(tower => {
        tower.coolDown += 1
      })
    },
    [MUTATIONS.RESET_COOLDOWN]: (state, playload) => {
      const tower = state.activeTowers.find(t => t.id === playload.id)
      if (tower) {
        tower.coolDown = 0
      }
    },
    [MUTATIONS.SET_ENEMY_QUEUE]: (state, payload) => {
      state.enemyQueue = payload
    },
    [MUTATIONS.ADD_ACTIVE_ENEMY]: (state, payload) => {
      state.activeEnemies.push(payload)
    },
    [MUTATIONS.DELETE_ENEMY_FROM_QUEUE]: (state, payload) => {
      state.enemyQueue = state.enemyQueue.filter(enemy => enemy.id !== payload) 
    },  
    [MUTATIONS.INCREASE_SPAWN_TIMER]: (state, payload) => {
      state.spawnTimer += payload
    },
    [MUTATIONS.MOVE_ENEMIES_BY_PATH]: (state, payload) => {
      const level = levels.find(l => l.id === state.curLevelMap)
      const pathLength = getPathLength(level.path)
      let isLoss = false
      state.activeEnemies = state.activeEnemies.map(enemy => {
        const nextDistance = enemy.distance + enemy.speed * payload.delta / 1000
        if (nextDistance >= pathLength) {
          isLoss = true
          return null
        }
        const nextPoint = getPointOnPath(level.path, nextDistance)
        return {
          ...enemy,
          distance: nextDistance,
          x: nextPoint.x,
          y: nextPoint.y
        }
      }).filter(enemy => enemy !== null)
      if (isLoss) {
        state.isGameOver = true
      }
    },
    [MUTATIONS.HIT_ENEMY]: (state, payload) => {
      const enemy = state.activeEnemies.find(e => e.id === payload.id)
      enemy.hp -= payload.damage
      if (enemy.hp <= 0) {
        state.activeEnemies = state.activeEnemies.filter(e => e.id !== payload.id)
        state.points += enemy.reward
      }
    },
    [MUTATIONS.SET_POINTS]: (state, payload) => {
      state.points = payload
    },
    [MUTATIONS.REMOVE_POINTS]: (state, payload) => {
      state.points -= payload
    },
    [MUTATIONS.SET_GAME_OVER]: (state, payload) => {
      state.isGameOver = payload
    },
  },
  actions: {
    initLevel: ({commit}, payload) => {
      commit(MUTATIONS.SET_LEVEL, payload)
      const level = levels.find(l => l.id === payload)
      commit(MUTATIONS.SET_POINTS, level.startPoints)
      commit(MUTATIONS.SET_ENEMY_QUEUE, createEnemyQueue(level))
    },
    buildTower: ({state, commit}, {slotId, levelId}) => {
      const stats = characteristics.find(c => c.id === levelId)
      const slot = levels.find(l => l.id === state.curLevelMap).slots.find(s => s.id === slotId)
      if (state.points < stats.cost) {
        return
      }
      commit(MUTATIONS.SET_TOWER, {
        ...stats,
        ...slot,
        levelId: levelId,
        coolDown: 0
      })
      commit(MUTATIONS.REMOVE_POINTS, stats.cost)
    },
    upgradeTower: ({state, commit}, slotId) => {
      const index = state.activeTowers.findIndex(t => t.id === slotId)
      const curTower = state.activeTowers[index]
      const nextLevel = curTower.levelId + 1
      const newStats = characteristics.find(c => c.id === nextLevel)
      if (state.points < newStats.cost) {
        return
      }
      commit(MUTATIONS.UPDATE_TOWER, {
      index,
      data: {...curTower, ...newStats, levelId: nextLevel, id: curTower.id, coolDown: 0}
      })
      commit(MUTATIONS.REMOVE_POINTS, newStats.cost)
    },
    deleteTower: ({commit}, payload) => {
      commit(MUTATIONS.DELETE_TOWER, payload)
    },
    gameLoop: ({state, commit, dispatch}) => {
      commit(MUTATIONS.INCREASE_SPAWN_TIMER, 30)
      const readyEnemies = state.enemyQueue.filter(enemy => enemy.spawnDelay <= state.spawnTimer)
      readyEnemies.forEach(enemy => {
        commit(MUTATIONS.ADD_ACTIVE_ENEMY, enemy)
        commit(MUTATIONS.DELETE_ENEMY_FROM_QUEUE, enemy.id)
      })
      commit(MUTATIONS.MOVE_ENEMIES_BY_PATH, {delta: 30})
      if (state.isGameOver) {
        dispatch('restartLevel')
        return
      }
      commit(MUTATIONS.UPDATE_COOLDOWN)
      state.activeTowers.forEach(tower => {
        if (tower.coolDown  >= 1000 / tower.speed) {
          const targets = state.activeEnemies.filter(e => {
            const dist = Math.sqrt(Math.pow(e.x - tower.x, 2) + Math.pow(e.y - tower.y, 2))
            return dist <= tower.radius
          })
          if (targets.length > 0) {
            const target = targets.reduce((best, enemy) => {
              return enemy.distance > best.distance ? enemy : best
            })
            commit(MUTATIONS.CREATE_BULLET, {
              id: Math.random(),
              x: tower.x,
              y: tower.y,
              targetId: target.id,
              damage: tower.damage
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
          commit(MUTATIONS.HIT_ENEMY, {id: target.id, damage: b.damage})
          return null
        }
        return {
          ...b, 
          x: b.x + (dx / dist) * 2,
          y: b.y + (dy / dist) * 2,
        }
      }).filter(b => b != null)
      commit(MUTATIONS.FLIGHT_BULLET, moveBullets)
    },
    restartLevel: ({state, dispatch}) => {
      dispatch('initLevel', state.curLevelMap)
    },
  },
}
