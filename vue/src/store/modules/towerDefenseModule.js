import {
  ACTION_TYPES,
  DEFAULT_ENEMY_HP,
  DEFAULT_LEVEL_GOLD,
  ENEMY_REWARD,
  LEVEL_KEYS,
  MAX_TOWER_LEVEL,
  MUTATION_TYPES,
  TOWER_CONFIG,
  TOWER_TYPES,
  UPGRADE_PRICE_BY_LEVEL
} from '@/constants/gameConstants'
import { levelConfig } from '@/data/levelConfig'

const createLevelState = (levelKey) => {
  const sourceLevel = levelConfig[levelKey] || levelConfig[LEVEL_KEYS.FIRST]

  const slots = sourceLevel.slots.map((slot) => {
    return {
      id: slot.id,
      pos: {
        x: slot.pos.x,
        y: slot.pos.y
      },
      towerId: null
    }
  })

  return {
    currentLevelKey: sourceLevel.id,
    buildMode: null,
    selectedTowerId: '',
    selectedEnemyId: '',
    draggingEnemyId: '',
    gold: sourceLevel.startGold || DEFAULT_LEVEL_GOLD,
    towerIndex: 1,
    enemyIndex: 1,
    level: {
      ...sourceLevel
    },
    slots,
    towersById: {},
    enemies: []
  }
}

const getTowerStats = (towerType, towerLevel) => {
  const towerConfig = TOWER_CONFIG[towerType]

  if (!towerConfig) {
    return null
  }

  return towerConfig.levels[towerLevel] || null
}

const getDistance = (firstPoint, secondPoint) => {
  const dx = firstPoint.x - secondPoint.x
  const dy = firstPoint.y - secondPoint.y

  return Math.sqrt(dx * dx + dy * dy)
}

export default {
  namespaced: true,

  state () {
    return createLevelState(LEVEL_KEYS.FIRST)
  },

  getters: {
    level (state) {
      return state.level
    },

    slots (state) {
      return state.slots
    },

    towersById (state) {
      return state.towersById
    },

    enemies (state) {
      return state.enemies
    },

    selectedTowerId (state) {
      return state.selectedTowerId
    },

    selectedEnemyId (state) {
      return state.selectedEnemyId
    },

    buildMode (state) {
      return state.buildMode
    },

    gold (state) {
      return state.gold
    },

    selectedTower (state) {
      if (!state.selectedTowerId) {
        return null
      }

      return state.towersById[state.selectedTowerId] || null
    },

    selectedEnemy (state) {
      if (!state.selectedEnemyId) {
        return null
      }

      return state.enemies.find((enemy) => enemy.id === state.selectedEnemyId) || null
    },

    getTowerStats () {
      return (towerType, towerLevel) => {
        return getTowerStats(towerType, towerLevel)
      }
    },

    towerTypes () {
      return Object.values(TOWER_TYPES)
    }
  },

  mutations: {
    [MUTATION_TYPES.SET_LEVEL] (state, payload) {
      state.currentLevelKey = payload.currentLevelKey
      state.level = payload.level
      state.slots = payload.slots
      state.towersById = payload.towersById
      state.enemies = payload.enemies
      state.buildMode = payload.buildMode
      state.selectedTowerId = payload.selectedTowerId
      state.selectedEnemyId = payload.selectedEnemyId
      state.draggingEnemyId = payload.draggingEnemyId
      state.towerIndex = payload.towerIndex
      state.enemyIndex = payload.enemyIndex
      state.gold = payload.gold
    },

    [MUTATION_TYPES.SET_BUILD_MODE] (state, towerType) {
      state.buildMode = towerType
    },

    [MUTATION_TYPES.SET_SELECTED_TOWER_ID] (state, towerId) {
      state.selectedTowerId = towerId
    },

    [MUTATION_TYPES.SET_SELECTED_ENEMY_ID] (state, enemyId) {
      state.selectedEnemyId = enemyId
    },

    [MUTATION_TYPES.SET_DRAGGING_ENEMY_ID] (state, enemyId) {
      state.draggingEnemyId = enemyId
    },

    [MUTATION_TYPES.SET_GOLD] (state, gold) {
      state.gold = gold
    },

    [MUTATION_TYPES.BUILD_TOWER] (state, payload) {
      const slot = state.slots.find((item) => item.id === payload.slotId)

      if (!slot || slot.towerId) {
        return
      }

      const towerId = `tower${state.towerIndex}`

      state.towerIndex += 1
      slot.towerId = towerId

      state.towersById = {
        ...state.towersById,
        [towerId]: {
          id: towerId,
          slotId: slot.id,
          type: payload.towerType,
          level: 1
        }
      }

      state.selectedTowerId = towerId
      state.buildMode = null
    },

    [MUTATION_TYPES.UPGRADE_TOWER] (state, towerId) {
      const tower = state.towersById[towerId]

      if (!tower || tower.level >= MAX_TOWER_LEVEL) {
        return
      }

      state.towersById = {
        ...state.towersById,
        [towerId]: {
          ...tower,
          level: tower.level + 1
        }
      }
    },

    [MUTATION_TYPES.REMOVE_TOWER] (state, towerId) {
      const tower = state.towersById[towerId]

      if (!tower) {
        return
      }

      const slot = state.slots.find((item) => item.id === tower.slotId)

      if (slot) {
        slot.towerId = null
      }

      const nextTowers = {
        ...state.towersById
      }

      delete nextTowers[towerId]

      state.towersById = nextTowers

      if (state.selectedTowerId === towerId) {
        state.selectedTowerId = ''
      }
    },

    [MUTATION_TYPES.SPAWN_ENEMY] (state, payload) {
      state.enemyIndex += 1

      state.enemies = [
        ...state.enemies,
        payload
      ]

      state.selectedEnemyId = payload.id
    },

    [MUTATION_TYPES.UPDATE_ENEMY_POSITION] (state, payload) {
      state.enemies = state.enemies.map((enemy) => {
        if (enemy.id !== payload.enemyId) {
          return enemy
        }

        return {
          ...enemy,
          pos: {
            x: payload.x,
            y: payload.y
          }
        }
      })
    },

    [MUTATION_TYPES.REMOVE_ENEMY] (state, enemyId) {
      state.enemies = state.enemies.filter((enemy) => enemy.id !== enemyId)

      if (state.selectedEnemyId === enemyId) {
        state.selectedEnemyId = ''
      }

      if (state.draggingEnemyId === enemyId) {
        state.draggingEnemyId = ''
      }
    },

    [MUTATION_TYPES.RESET_LEVEL] (state, payload) {
      state.currentLevelKey = payload.currentLevelKey
      state.buildMode = payload.buildMode
      state.selectedTowerId = payload.selectedTowerId
      state.selectedEnemyId = payload.selectedEnemyId
      state.draggingEnemyId = payload.draggingEnemyId
      state.towerIndex = payload.towerIndex
      state.enemyIndex = payload.enemyIndex
      state.level = payload.level
      state.slots = payload.slots
      state.towersById = payload.towersById
      state.enemies = payload.enemies
      state.gold = payload.gold
    },

    [MUTATION_TYPES.APPLY_DAMAGE_STEP] (state) {
      const damageByEnemyId = {}

      state.slots.forEach((slot) => {
        if (!slot.towerId) {
          return
        }

        const tower = state.towersById[slot.towerId]

        if (!tower) {
          return
        }

        const stats = getTowerStats(tower.type, tower.level)

        if (!stats) {
          return
        }

        let nearestEnemy = null
        let nearestDistance = Infinity

        state.enemies.forEach((enemy) => {
          const distance = getDistance(slot.pos, enemy.pos)

          if (distance > stats.range) {
            return
          }

          if (distance < nearestDistance) {
            nearestDistance = distance
            nearestEnemy = enemy
          }
        })

        if (!nearestEnemy) {
          return
        }

        if (!damageByEnemyId[nearestEnemy.id]) {
          damageByEnemyId[nearestEnemy.id] = 0
        }

        damageByEnemyId[nearestEnemy.id] += stats.damage
      })

      const removedEnemies = []

      state.enemies = state.enemies
        .map((enemy) => {
          const damage = damageByEnemyId[enemy.id] || 0
          const nextHp = enemy.hp - damage

          if (nextHp <= 0) {
            removedEnemies.push(enemy)
          }

          return {
            ...enemy,
            hp: nextHp
          }
        })
        .filter((enemy) => enemy.hp > 0)

      if (removedEnemies.length) {
        state.gold += removedEnemies.length * ENEMY_REWARD
      }

      if (state.selectedEnemyId) {
        const stillExists = state.enemies.some((enemy) => enemy.id === state.selectedEnemyId)

        if (!stillExists) {
          state.selectedEnemyId = ''
        }
      }
    }
  },

  actions: {
    [ACTION_TYPES.INIT_LEVEL] ({ commit }, levelKey = LEVEL_KEYS.FIRST) {
      commit(MUTATION_TYPES.SET_LEVEL, createLevelState(levelKey))
    },

    [ACTION_TYPES.RESET_LEVEL] ({ commit, state }) {
      commit(MUTATION_TYPES.RESET_LEVEL, createLevelState(state.currentLevelKey))
    },

    [ACTION_TYPES.TOGGLE_BUILD_MODE] ({ commit, state }, towerType) {
      const nextValue = state.buildMode === towerType ? null : towerType

      commit(MUTATION_TYPES.SET_BUILD_MODE, nextValue)
      commit(MUTATION_TYPES.SET_SELECTED_TOWER_ID, '')
    },

    [ACTION_TYPES.SLOT_CLICK] ({ commit, state }, slotId) {
      const slot = state.slots.find((item) => item.id === slotId)

      if (!slot) {
        return
      }

      if (slot.towerId) {
        commit(MUTATION_TYPES.SET_SELECTED_TOWER_ID, slot.towerId)
        commit(MUTATION_TYPES.SET_SELECTED_ENEMY_ID, '')
        commit(MUTATION_TYPES.SET_DRAGGING_ENEMY_ID, '')
        return
      }

      if (!state.buildMode) {
        commit(MUTATION_TYPES.SET_SELECTED_TOWER_ID, '')
        return
      }

      const config = TOWER_CONFIG[state.buildMode]

      if (!config) {
        return
      }

      if (state.gold < config.price) {
        return
      }

      commit(MUTATION_TYPES.SET_GOLD, state.gold - config.price)
      commit(MUTATION_TYPES.BUILD_TOWER, {
        slotId,
        towerType: state.buildMode
      })
      commit(MUTATION_TYPES.SET_SELECTED_ENEMY_ID, '')
      commit(MUTATION_TYPES.SET_DRAGGING_ENEMY_ID, '')
    },

    [ACTION_TYPES.TOWER_CLICK] ({ commit }, towerId) {
      commit(MUTATION_TYPES.SET_SELECTED_TOWER_ID, towerId)
      commit(MUTATION_TYPES.SET_SELECTED_ENEMY_ID, '')
      commit(MUTATION_TYPES.SET_DRAGGING_ENEMY_ID, '')
    },

    [ACTION_TYPES.BUILD_TOWER] ({ commit, state }, payload) {
      const config = TOWER_CONFIG[payload.towerType]

      if (!config) {
        return
      }

      if (state.gold < config.price) {
        return
      }

      commit(MUTATION_TYPES.SET_GOLD, state.gold - config.price)
      commit(MUTATION_TYPES.BUILD_TOWER, payload)
      commit(MUTATION_TYPES.SET_SELECTED_ENEMY_ID, '')
      commit(MUTATION_TYPES.SET_DRAGGING_ENEMY_ID, '')
    },

    [ACTION_TYPES.UPGRADE_TOWER] ({ commit, state }, towerId) {
      const tower = state.towersById[towerId]

      if (!tower) {
        return
      }

      if (tower.level >= MAX_TOWER_LEVEL) {
        return
      }

      const upgradePrice = UPGRADE_PRICE_BY_LEVEL[tower.level]

      if (!upgradePrice) {
        return
      }

      if (state.gold < upgradePrice) {
        return
      }

      commit(MUTATION_TYPES.SET_GOLD, state.gold - upgradePrice)
      commit(MUTATION_TYPES.UPGRADE_TOWER, towerId)
    },

    [ACTION_TYPES.REMOVE_TOWER] ({ commit, state }, towerId) {
      const tower = state.towersById[towerId]

      if (!tower) {
        return
      }

      const config = TOWER_CONFIG[tower.type]

      if (config) {
        commit(MUTATION_TYPES.SET_GOLD, state.gold + config.refund)
      }

      commit(MUTATION_TYPES.REMOVE_TOWER, towerId)
    },

    [ACTION_TYPES.SPAWN_ENEMY] ({ commit, state }) {
      const enemyId = `enemy${state.enemyIndex}`

      commit(MUTATION_TYPES.SPAWN_ENEMY, {
        id: enemyId,
        type: 'basic',
        hp: DEFAULT_ENEMY_HP,
        color: '#ef4444',
        pos: {
          x: state.level.enemySpawn.x,
          y: state.level.enemySpawn.y
        }
      })

      commit(MUTATION_TYPES.SET_SELECTED_TOWER_ID, '')
      commit(MUTATION_TYPES.SET_DRAGGING_ENEMY_ID, '')
    },

    [ACTION_TYPES.ENEMY_POINTER_DOWN] ({ commit }, payload) {
      commit(MUTATION_TYPES.SET_SELECTED_ENEMY_ID, payload.enemyId)
      commit(MUTATION_TYPES.SET_DRAGGING_ENEMY_ID, payload.enemyId)
      commit(MUTATION_TYPES.SET_SELECTED_TOWER_ID, '')
    },

    [ACTION_TYPES.CANVAS_POINTER_MOVE] ({ commit, state }, payload) {
      if (!state.draggingEnemyId) {
        return
      }

      commit(MUTATION_TYPES.UPDATE_ENEMY_POSITION, {
        enemyId: state.draggingEnemyId,
        x: payload.x,
        y: payload.y
      })
    },

    [ACTION_TYPES.CANVAS_POINTER_UP] ({ commit }) {
      commit(MUTATION_TYPES.SET_DRAGGING_ENEMY_ID, '')
    },

    [ACTION_TYPES.RUN_DAMAGE_STEP] ({ commit }) {
      commit(MUTATION_TYPES.APPLY_DAMAGE_STEP)
    }
  }
}