import {levels} from '../data/levels'
import {characteristics} from '../data/characteristics'
import {enemyTypes} from '../data/enemyTypes'
import {barrier} from '../data/barrier'
import {allyTypes} from '../data/allyTypes'
import {artillery} from '../data/artillery'

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
      damage: enemyType.damage,
      attackSpeed: enemyType.attackSpeed,
      radius: enemyType.radius,
      coolDown: 0,
      spawnDelay: enemy.delay,
      distance: 0,
      x: startPoint.x,
      y: startPoint.y
    }
  }).filter(enemy => enemy !== null)
}
const getAllySpawnDistance = (pathLength, activeAllies) => {
  const gap = 5
  for (let i = 0; i < 4; i++) {
    const distance = pathLength - i * gap
    const isBusy = activeAllies.some(ally => {
      return Math.abs(ally.distance - distance) < gap
    })
    if (!isBusy && distance > 0) {
      return distance
    }
  }
  return pathLength
}
const getBlockingBarrier = (path, nextDistance, activeBarriers) => {
  const nextPoint = getPointOnPath(path, nextDistance)
  return activeBarriers.find(barrier => {
    const dx = nextPoint.x - barrier.x
    const dy = nextPoint.y - barrier.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    return dist <= 4
  })
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
  SET_BARRIER: 'SET_BARRIER',
  DELETE_BARRIER: 'DELETE_BARRIER',
  DAMAGE_BARRIER: 'DAMAGE_BARRIER',
  DAMAGE_TOWER: 'DAMAGE_TOWER',
  DAMAGE_ALLY: 'DAMAGE_ALLY',
  SET_ALLY: 'SET_ALLY',
  MOVE_ALLIES_BY_PATH: 'MOVE_ALLIES_BY_PATH',
  UPDATE_ALLY_COOLDOWN: 'UPDATE_ALLY_COOLDOWN',
  RESET_ALLY_COOLDOWN: 'RESET_ALLY_COOLDOWN',
  SET_ENEMY_QUEUE: 'SET_ENEMY_QUEUE',
  ADD_ACTIVE_ENEMY: 'ADD_ACTIVE_ENEMY',
  DELETE_ENEMY_FROM_QUEUE: 'DELETE_ENEMY_FROM_QUEUE',
  UPDATE_ENEMY_COOLDOWN: 'UPDATE_ENEMY_COOLDOWN',
  RESET_ENEMY_COOLDOWN: 'RESET_ENEMY_COOLDOWN',
  INCREASE_SPAWN_TIMER: 'INCREASE_SPAWN_TIMER',
  MOVE_ENEMIES_BY_PATH: 'MOVE_ENEMIES_BY_PATH',
  HIT_ENEMY: 'HIT_ENEMY',
  ARTILLERY_HIT: 'ARTILLERY_HIT',
  SET_POINTS: 'SET_POINTS',
  REMOVE_POINTS: 'REMOVE_POINTS',
  SET_GAME_STATUS: 'SET_GAME_STATUS',
}

export default {
  namespaced: true,
  state () {
    return {
      curLevelMap: 1,
      activeTowers: [],
      activeEnemies: [],
      activeBullets: [],
      activeBarriers: [],
      activeAllies: [],
      enemyQueue: [],
      spawnTimer: 0,
      points: 0,
      gameStatus: 'playing',
    }
  },
  getters: {
    getCurLevelMap: (state) => state.curLevelMap,
    getActiveTowers: (state) => state.activeTowers,
    getCurLevelData: (state) => levels.find(l => l.id === state.curLevelMap),
    getActiveEnemies: (state) => state.activeEnemies,
    getActiveBullets: (state) => state.activeBullets,
    getActiveBarriers: (state) => state.activeBarriers,
    getActiveAllies: (state) => state.activeAllies,
    getPoints: (state) => state.points,
    getGameStatus: (state) => state.gameStatus,
    getNextLevel: (state) => {
      const curIndex = levels.findIndex(level => level.id === state.curLevelMap)
      return levels[curIndex + 1] || null
    },
  },
  mutations: {
    [MUTATIONS.SET_LEVEL]: (state, payload) => {
      state.curLevelMap = payload
      state.activeTowers = []
      state.activeEnemies = []
      state.activeBullets = []
      state.activeBarriers = []
      state.activeAllies = []
      state.enemyQueue = []
      state.spawnTimer = 0
      state.points = 0
      state.gameStatus = 'playing'
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
    [MUTATIONS.UPDATE_COOLDOWN]: (state, payload) => {
      state.activeTowers.forEach(tower => {
        tower.coolDown += payload.delta
      })
    },
    [MUTATIONS.RESET_COOLDOWN]: (state, payload) => {
      const tower = state.activeTowers.find(t => t.id === payload.id)
      if (tower) {
        tower.coolDown = 0
      }
    },
    [MUTATIONS.SET_BARRIER]: (state, payload) => {
      state.activeBarriers.push(payload)
    },
    [MUTATIONS.DELETE_BARRIER]: (state, payload) => {
      state.activeBarriers = state.activeBarriers.filter(b => b.id !== payload)
    },
    [MUTATIONS.DAMAGE_BARRIER]: (state, payload) => {
      const barrier = state.activeBarriers.find(b => b.id === payload.id)
      if (!barrier) {
        return
      }
      barrier.currentHp -= payload.damage
      if (barrier.currentHp <= 0) {
        state.activeBarriers = state.activeBarriers.filter(b => b.id !== payload.id)
      }
    },
    [MUTATIONS.DAMAGE_TOWER]: (state, payload) => {
      const tower = state.activeTowers.find(t => t.id === payload.id)
      if (!tower) {
        return
      }
      tower.currentHp -= payload.damage
      if (tower.currentHp <= 0) {
        state.activeTowers = state.activeTowers.filter(t => t.id !== payload.id)
      }
    },
    [MUTATIONS.DAMAGE_ALLY]: (state, payload) => {
      const ally = state.activeAllies.find(a => a.id === payload.id)
      if (!ally) {
        return
      }
      ally.currentHp -= payload.damage
      if (ally.currentHp <= 0) {
        state.activeAllies = state.activeAllies.filter(a => a.id !== payload.id)
      }
    },
    [MUTATIONS.SET_ALLY]: (state, payload) => {
      state.activeAllies.push(payload)
    },
    [MUTATIONS.MOVE_ALLIES_BY_PATH]: (state, payload) => {
      const level = levels.find(l => l.id === state.curLevelMap)
      state.activeAllies = state.activeAllies.map(ally => {
        const nextDistance = ally.distance - ally.speed * payload.delta / 1000
        if (nextDistance <= 0) {
          return null
        }
        const nextPoint = getPointOnPath(level.path, nextDistance)
        return {
          ...ally,
          distance: nextDistance,
          x: nextPoint.x,
          y: nextPoint.y
        }
      }).filter(ally => ally !== null)
    },
    [MUTATIONS.UPDATE_ALLY_COOLDOWN]: (state, payload) => {
      state.activeAllies.forEach(ally => {
        ally.coolDown += payload.delta
      })
    },
    [MUTATIONS.RESET_ALLY_COOLDOWN]: (state, payload) => {
      const ally = state.activeAllies.find(a => a.id === payload.id)
      if (ally) {
        ally.coolDown = 0
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
    [MUTATIONS.UPDATE_ENEMY_COOLDOWN]: (state, payload) => {
      state.activeEnemies.forEach(enemy => {
        enemy.coolDown += payload.delta
      })
    },
    [MUTATIONS.RESET_ENEMY_COOLDOWN]: (state, payload) => {
      const enemy = state.activeEnemies.find(e => e.id === payload.id)
      if (enemy) {
        enemy.coolDown = 0
      }
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
        const blockingBarrier = getBlockingBarrier(level.path, nextDistance, state.activeBarriers)
        if (blockingBarrier) {
          return enemy
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
        state.gameStatus = 'loss'
      }
    },
    [MUTATIONS.HIT_ENEMY]: (state, payload) => {
      const enemy = state.activeEnemies.find(e => e.id === payload.id)
      if (!enemy) {
        return
      }
      enemy.hp -= payload.damage
      if (enemy.hp <= 0) {
        state.activeEnemies = state.activeEnemies.filter(e => e.id !== payload.id)
        state.points += enemy.reward
      }
    },
    [MUTATIONS.ARTILLERY_HIT]: (state, payload) => {
      let reward = 0
      state.activeEnemies = state.activeEnemies.map(enemy => {
        const dist = Math.sqrt(Math.pow(enemy.x - payload.x, 2) + Math.pow(enemy.y - payload.y, 2))
        if (dist > payload.radius) {
          return enemy
        }
        const damagePercent = Math.max(0.1, 1 - dist / payload.radius)
        const damage = Math.ceil(payload.damage * damagePercent)
        const nextHp = enemy.hp - damage
        if (nextHp <= 0) {
          reward += enemy.reward
          return null
        }
        return {
          ...enemy,
          hp: nextHp
        }   
      }).filter(enemy => enemy !== null)
      state.points += reward
    },
    [MUTATIONS.SET_POINTS]: (state, payload) => {
      state.points = payload
    },
    [MUTATIONS.REMOVE_POINTS]: (state, payload) => {
      state.points -= payload
    },
    [MUTATIONS.SET_GAME_STATUS]: (state, payload) => {
      state.gameStatus = payload
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
        currentHp: stats.hp,
        maxHp: stats.hp,
        coolDown: 0
      })
      commit(MUTATIONS.REMOVE_POINTS, stats.cost)
    },
    buildBarrier: ({state, commit}, {slotId}) => {
      const stats = barrier[0]
      const slot = levels.find(l => l.id === state.curLevelMap).barrierSlots.find(s => s.id === slotId)
      if (state.points < stats.cost) {
        return
      }
      commit(MUTATIONS.SET_BARRIER, {
        ...stats,
        ...slot,
        currentHp: stats.hp,
        maxHp: stats.hp
      })
      commit(MUTATIONS.REMOVE_POINTS, stats.cost)
    },
    spawnAlly: ({state, commit}, {id, typeId}) => {
      const stats = allyTypes.find(a => a.id === typeId)
      const level = levels.find(l => l.id === state.curLevelMap)
      if (state.points < stats.cost) {
        return
      }
      const pathLength = getPathLength(level.path)
      const spawnDistance = getAllySpawnDistance(pathLength, state.activeAllies)
      const startPoint = getPointOnPath(level.path, spawnDistance)
      commit(MUTATIONS.SET_ALLY, {
        ...stats,
        id: Math.random(),
        typeId,
        currentHp: stats.hp,
        maxHp: stats.hp,
        distance: spawnDistance,
        x: startPoint.x,
        y: startPoint.y,
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
        data: {
          ...curTower, 
          ...newStats, 
          levelId: nextLevel, 
          id: curTower.id, 
          currentHp: newStats.hp,
          maxHp: newStats.hp,
          coolDown: 0}
      })
      commit(MUTATIONS.REMOVE_POINTS, newStats.cost)
    },
    deleteTower: ({commit}, payload) => {
      commit(MUTATIONS.DELETE_TOWER, payload)
    },
    useArtillery: ({ state, commit }, { x, y }) => {
      const stats = artillery[0]
      if (state.points < stats.cost) {
        return false
      }
      commit(MUTATIONS.ARTILLERY_HIT, {
        x,
        y,
        damage: stats.damage,
        radius: stats.radius,
      })
      commit(MUTATIONS.REMOVE_POINTS, stats.cost)
      return true
    },
    gameLoop: ({state, commit}) => {
      const delta = 30
      if (state.gameStatus !== 'playing') {
        return
      }
      commit(MUTATIONS.INCREASE_SPAWN_TIMER, delta)
      const readyEnemies = state.enemyQueue.filter(enemy => enemy.spawnDelay <= state.spawnTimer)
      readyEnemies.forEach(enemy => {
        commit(MUTATIONS.ADD_ACTIVE_ENEMY, enemy)
        commit(MUTATIONS.DELETE_ENEMY_FROM_QUEUE, enemy.id)
      })
      commit(MUTATIONS.MOVE_ENEMIES_BY_PATH, {delta})
      commit(MUTATIONS.MOVE_ALLIES_BY_PATH, {delta})
      commit(MUTATIONS.UPDATE_COOLDOWN, {delta})
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
              damage: tower.damage,
              type: 'tower',
              targetType: 'enemy',
            })
            commit(MUTATIONS.RESET_COOLDOWN, {id: tower.id})
          }
        }
      })
      commit(MUTATIONS.UPDATE_ALLY_COOLDOWN, {delta})
      state.activeAllies.forEach(ally => {
        if (ally.coolDown  >= 1000 / ally.attackSpeed) {
          const targets = state.activeEnemies.filter(e => {
            const dist = Math.sqrt(Math.pow(e.x - ally.x, 2) + Math.pow(e.y - ally.y, 2))
            return dist <= ally.radius
          })
          if (targets.length > 0) {
            const target = targets.reduce((best, enemy) => {
              return enemy.distance > best.distance ? enemy : best
            })
            commit(MUTATIONS.CREATE_BULLET, {
              id: Math.random(),
              x: ally.x,
              y: ally.y,
              targetId: target.id,
              damage: ally.damage,
              type: 'ally',
              targetType: 'enemy',
            })
            commit(MUTATIONS.RESET_ALLY_COOLDOWN, {id: ally.id})
          }
        }
      })
      commit(MUTATIONS.UPDATE_ENEMY_COOLDOWN, {delta})
      state.activeEnemies.forEach(enemy => {
        if (!enemy.damage || !enemy.attackSpeed) {
          return
        }
        const attackRadius = enemy.radius || 5
        if (enemy.coolDown  >= 1000 / enemy.attackSpeed) {
          const barrierTargets = state.activeBarriers.map(barrier => ({
            id: barrier.id,
            x: barrier.x,
            y: barrier.y,
            targetType: 'barrier',
          })).filter(target => {
            const dx = target.x - enemy.x
            const dy = target.y - enemy.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            return dist <= attackRadius
          })
          const otherTargets = [
            ...state.activeTowers.map(tower => ({
              id: tower.id,
              x: tower.x,
              y: tower.y,
              targetType: 'tower',
            })),
            ...state.activeAllies.map(ally => ({
              id: ally.id,
              x: ally.x,
              y: ally.y,
              targetType: 'ally',
            })),
          ].filter(target => {
            const dx = target.x - enemy.x
            const dy = target.y - enemy.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            return dist <= attackRadius
          })
          const targets = barrierTargets.length > 0 ? barrierTargets : otherTargets
          if (targets.length > 0) {
            const target = targets[0]
            const hitMutations = {
              tower: MUTATIONS.DAMAGE_TOWER,
              ally: MUTATIONS.DAMAGE_ALLY,
              barrier: MUTATIONS.DAMAGE_BARRIER,
            }
            if (enemy.radius === 0) {
              commit(hitMutations[target.targetType], {
                id: target.id,
                damage: enemy.damage,
              })
            }
            else {
              commit(MUTATIONS.CREATE_BULLET, {
                id: Math.random(),
                x: enemy.x,
                y: enemy.y,
                targetId: target.id,
                damage: enemy.damage,
                type: 'enemy',
                targetType: target.targetType,
              })
            }
            commit(MUTATIONS.RESET_ENEMY_COOLDOWN, {id: enemy.id})
          }
        }
      })
      const targetLists = {
        enemy: state.activeEnemies,
        tower: state.activeTowers,
        ally: state.activeAllies,
        barrier: state.activeBarriers,
      }
      const damageMutations = {
        enemy: MUTATIONS.HIT_ENEMY,
        tower: MUTATIONS.DAMAGE_TOWER,
        ally: MUTATIONS.DAMAGE_ALLY,
        barrier: MUTATIONS.DAMAGE_BARRIER,
      }
      const moveBullets = state.activeBullets.map(d => {
        const targetType = d.targetType || 'enemy'
        const targets = targetLists[targetType] || []
        const target = targets.find(t => t.id === d.targetId)
        if (!target) {
          return null
        }
        const dx = target.x - d.x
        const dy = target.y - d.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 1) {
          commit(damageMutations[targetType], {id: target.id, damage: d.damage})
          return null
        }
        return {
          ...d, 
          x: d.x + (dx / dist) * 2,
          y: d.y + (dy / dist) * 2,
        }
      }).filter(d => d != null)
      commit(MUTATIONS.FLIGHT_BULLET, moveBullets)
      if (state.gameStatus === 'playing' && state.enemyQueue.length === 0 && state.activeEnemies.length === 0) {
        commit(MUTATIONS.SET_GAME_STATUS, 'win')
      }
    },
    restartLevel: ({state, dispatch}) => {
      dispatch('initLevel', state.curLevelMap)
    },
    nextLevel: ({state, dispatch}) => {
      const curIndex = levels.findIndex(level => level.id === state.curLevelMap)
      const nextLevel = levels[curIndex + 1]
      if (!nextLevel) {
        return
      }
      dispatch('initLevel', nextLevel.id)
    },
  },
}
