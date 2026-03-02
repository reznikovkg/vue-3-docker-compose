const MUTATIONS = {
  SET_LEVEL: 'SET_LEVEL',
  ADD_TOWER: 'ADD_TOWER',
  UPGRADE_TOWER: 'UPGRADE_TOWER',
  REMOVE_TOWER: 'REMOVE_TOWER',
  ADD_ENEMY: 'ADD_ENEMY',
  SET_SELECTED_ENEMY: 'SET_SELECTED_ENEMY',
  MOVE_SELECTED_ENEMY: 'MOVE_SELECTED_ENEMY',
  MOVE_ENEMY_TO_POINT: 'MOVE_ENEMY_TO_POINT',
  APPLY_SIMULATION_TICK: 'APPLY_SIMULATION_TICK',
}

const LIMITS = {
  MAX_TOWER_LEVEL: 5,
  MIN_COORDINATE: 0,
}

const TOWER_BASE_STATS = {
  damage: 16,
  health: 120,
  rateOfFire: 1.2,
  attackRadius: 110,
}

const TOWER_UPGRADE_STEP = {
  damage: 6,
  health: 40,
  rateOfFire: 0.2,
  attackRadius: 16,
}

const ENEMY_BASE_STATS = {
  health: 120,
  radius: 10,
}

const PROJECTILE_BASE_STATS = {
  speed: 300,
  radius: 4,
}

const LEVELS = [
  {
    id: 'MEADOW',
    name: 'Meadow',
    width: 960,
    height: 540,
    enemySpawn: { x: 80, y: 110 },
    path: [
      { x: 80, y: 110 },
      { x: 280, y: 110 },
      { x: 280, y: 300 },
      { x: 580, y: 300 },
      { x: 580, y: 180 },
      { x: 860, y: 180 },
    ],
    towerSlots: [
      { id: 'M1', x: 180, y: 190 },
      { id: 'M2', x: 360, y: 220 },
      { id: 'M3', x: 510, y: 240 },
      { id: 'M4', x: 700, y: 120 },
      { id: 'M5', x: 770, y: 300 },
    ],
  },
  {
    id: 'CANYON',
    name: 'Canyon',
    width: 960,
    height: 540,
    enemySpawn: { x: 120, y: 420 },
    path: [
      { x: 120, y: 420 },
      { x: 330, y: 420 },
      { x: 330, y: 170 },
      { x: 470, y: 170 },
      { x: 470, y: 360 },
      { x: 760, y: 360 },
      { x: 860, y: 250 },
    ],
    towerSlots: [
      { id: 'C1', x: 250, y: 310 },
      { id: 'C2', x: 395, y: 260 },
      { id: 'C3', x: 540, y: 290 },
      { id: 'C4', x: 640, y: 420 },
      { id: 'C5', x: 770, y: 250 },
    ],
  },
]

const LEVELS_MAP = LEVELS.reduce((accumulator, level) => {
  accumulator[level.id] = level
  return accumulator
}, {})

const DEFAULT_LEVEL_ID = LEVELS[0].id

const createByLevelCollection = (baseValue) => LEVELS.reduce((accumulator, level) => {
  accumulator[level.id] = baseValue
  return accumulator
}, {})

const createByLevelList = () => LEVELS.reduce((accumulator, level) => {
  accumulator[level.id] = []
  return accumulator
}, {})

const clampValue = (value, min, max) => Math.min(Math.max(value, min), max)

const getLevel = (state) => LEVELS_MAP[state.currentLevelId] || LEVELS_MAP[DEFAULT_LEVEL_ID]
const getTowers = (state) => state.towersByLevel[state.currentLevelId] || []
const getEnemies = (state) => state.enemiesByLevel[state.currentLevelId] || []
const getProjectiles = (state) => state.projectilesByLevel[state.currentLevelId] || []

class TowerEntity {
  constructor(payload) {
    this.id = payload.id
    this.slotId = payload.slotId
    this.x = payload.x
    this.y = payload.y
    this.level = 1
    this.damage = TOWER_BASE_STATS.damage
    this.health = TOWER_BASE_STATS.health
    this.rateOfFire = TOWER_BASE_STATS.rateOfFire
    this.attackRadius = TOWER_BASE_STATS.attackRadius
    this.cooldownMs = 0
  }
}

class EnemyEntity {
  constructor(payload) {
    this.id = payload.id
    this.x = payload.x
    this.y = payload.y
    this.health = ENEMY_BASE_STATS.health
    this.radius = ENEMY_BASE_STATS.radius
  }
}

class ProjectileEntity {
  constructor(payload) {
    this.id = payload.id
    this.sourceTowerId = payload.sourceTowerId
    this.targetEnemyId = payload.targetEnemyId
    this.damage = payload.damage
    this.speed = payload.speed || PROJECTILE_BASE_STATS.speed
    this.radius = payload.radius || PROJECTILE_BASE_STATS.radius
    this.x = payload.x
    this.y = payload.y
  }
}

export const KEY_BINDINGS = {
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
}

export default {
  namespaced: true,
  state () {
    return {
      levels: LEVELS,
      currentLevelId: DEFAULT_LEVEL_ID,
      towersByLevel: createByLevelList(),
      enemiesByLevel: createByLevelList(),
      projectilesByLevel: createByLevelList(),
      selectedEnemyIdByLevel: createByLevelCollection(null),
      nextTowerId: 1,
      nextEnemyId: 1,
      nextProjectileId: 1,
    }
  },
  getters: {
    getLevels: (state) => state.levels,
    getCurrentLevel: (state) => getLevel(state),
    getTowers: (state) => getTowers(state),
    getEnemies: (state) => getEnemies(state),
    getProjectiles: (state) => getProjectiles(state),
    getSelectedEnemyId: (state) => state.selectedEnemyIdByLevel[state.currentLevelId],
  },
  mutations: {
    [MUTATIONS.SET_LEVEL]: (state, levelId) => {
      if (!LEVELS_MAP[levelId]) {
        return
      }
      state.currentLevelId = levelId
    },
    [MUTATIONS.ADD_TOWER]: (state, slotId) => {
      const level = getLevel(state)
      const slot = level.towerSlots.find((item) => item.id === slotId)
      if (!slot) {
        return
      }

      const towers = getTowers(state)
      const hasTower = towers.find((item) => item.slotId === slotId)
      if (hasTower) {
        return
      }

      const tower = new TowerEntity({
        id: state.nextTowerId,
        slotId: slot.id,
        x: slot.x,
        y: slot.y,
      })

      state.nextTowerId += 1
      state.towersByLevel[state.currentLevelId] = [...towers, tower]
    },
    [MUTATIONS.UPGRADE_TOWER]: (state, slotId) => {
      const towers = getTowers(state)
      const towerIndex = towers.findIndex((item) => item.slotId === slotId)
      if (towerIndex < 0) {
        return
      }

      const tower = towers[towerIndex]
      if (tower.level >= LIMITS.MAX_TOWER_LEVEL) {
        return
      }

      const upgradedTower = {
        ...tower,
        level: tower.level + 1,
        damage: tower.damage + TOWER_UPGRADE_STEP.damage,
        health: tower.health + TOWER_UPGRADE_STEP.health,
        rateOfFire: tower.rateOfFire + TOWER_UPGRADE_STEP.rateOfFire,
        attackRadius: tower.attackRadius + TOWER_UPGRADE_STEP.attackRadius,
      }

      state.towersByLevel[state.currentLevelId] = towers.map((item, index) => {
        if (index === towerIndex) {
          return upgradedTower
        }
        return item
      })
    },
    [MUTATIONS.REMOVE_TOWER]: (state, slotId) => {
      const towers = getTowers(state)
      state.towersByLevel[state.currentLevelId] = towers.filter((item) => item.slotId !== slotId)
    },
    [MUTATIONS.ADD_ENEMY]: (state, point) => {
      const level = getLevel(state)
      const enemies = getEnemies(state)
      const spawn = point || level.enemySpawn
      const enemy = new EnemyEntity({
        id: state.nextEnemyId,
        x: clampValue(spawn.x, LIMITS.MIN_COORDINATE, level.width),
        y: clampValue(spawn.y, LIMITS.MIN_COORDINATE, level.height),
      })

      state.nextEnemyId += 1
      state.enemiesByLevel[state.currentLevelId] = [...enemies, enemy]
      state.selectedEnemyIdByLevel[state.currentLevelId] = enemy.id
    },
    [MUTATIONS.SET_SELECTED_ENEMY]: (state, enemyId) => {
      const enemies = getEnemies(state)
      const targetEnemy = enemies.find((item) => item.id === enemyId)
      if (!targetEnemy) {
        state.selectedEnemyIdByLevel[state.currentLevelId] = null
        return
      }
      state.selectedEnemyIdByLevel[state.currentLevelId] = targetEnemy.id
    },
    [MUTATIONS.MOVE_SELECTED_ENEMY]: (state, delta) => {
      const selectedEnemyId = state.selectedEnemyIdByLevel[state.currentLevelId]
      if (!selectedEnemyId) {
        return
      }

      const level = getLevel(state)
      const enemies = getEnemies(state)
      state.enemiesByLevel[state.currentLevelId] = enemies.map((enemy) => {
        if (enemy.id !== selectedEnemyId) {
          return enemy
        }
        return {
          ...enemy,
          x: clampValue(enemy.x + delta.x, LIMITS.MIN_COORDINATE, level.width),
          y: clampValue(enemy.y + delta.y, LIMITS.MIN_COORDINATE, level.height),
        }
      })
    },
    [MUTATIONS.MOVE_ENEMY_TO_POINT]: (state, payload) => {
      const { enemyId, point } = payload
      const level = getLevel(state)
      const enemies = getEnemies(state)

      state.enemiesByLevel[state.currentLevelId] = enemies.map((enemy) => {
        if (enemy.id !== enemyId) {
          return enemy
        }
        return {
          ...enemy,
          x: clampValue(point.x, LIMITS.MIN_COORDINATE, level.width),
          y: clampValue(point.y, LIMITS.MIN_COORDINATE, level.height),
        }
      })
    },
    [MUTATIONS.APPLY_SIMULATION_TICK]: (state, deltaMs) => {
      const towers = getTowers(state)
      const enemies = getEnemies(state)
      const projectiles = getProjectiles(state)

      const nextEnemies = enemies.map((enemy) => ({ ...enemy }))
      const movedProjectiles = []

      projectiles.forEach((projectile) => {
        const targetEnemy = nextEnemies.find((enemy) => enemy.id === projectile.targetEnemyId)
        if (!targetEnemy) {
          return
        }

        const dx = targetEnemy.x - projectile.x
        const dy = targetEnemy.y - projectile.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const hitDistance = targetEnemy.radius + projectile.radius

        if (distance <= hitDistance) {
          targetEnemy.health -= projectile.damage
          return
        }

        const step = (projectile.speed * deltaMs) / 1000
        if (step >= distance) {
          targetEnemy.health -= projectile.damage
          return
        }

        const normalizer = distance || 1
        movedProjectiles.push({
          ...projectile,
          x: projectile.x + (dx / normalizer) * step,
          y: projectile.y + (dy / normalizer) * step,
        })
      })

      const createdProjectiles = []
      const enemiesForTargeting = nextEnemies.filter((enemy) => enemy.health > 0)

      const nextTowers = towers.map((tower) => {
        const nextCooldown = Math.max(0, tower.cooldownMs - deltaMs)
        if (nextCooldown > 0 || !enemiesForTargeting.length) {
          return {
            ...tower,
            cooldownMs: nextCooldown,
          }
        }

        const attackRadiusSquare = tower.attackRadius * tower.attackRadius
        const targetEnemy = enemiesForTargeting.find((enemy) => {
          const dx = enemy.x - tower.x
          const dy = enemy.y - tower.y
          return dx * dx + dy * dy <= attackRadiusSquare
        })
        if (!targetEnemy) {
          return {
            ...tower,
            cooldownMs: 0,
          }
        }

        const projectile = new ProjectileEntity({
          id: state.nextProjectileId,
          sourceTowerId: tower.id,
          targetEnemyId: targetEnemy.id,
          damage: tower.damage,
          x: tower.x,
          y: tower.y,
        })
        state.nextProjectileId += 1
        createdProjectiles.push(projectile)

        return {
          ...tower,
          cooldownMs: 1000 / tower.rateOfFire,
        }
      })

      const aliveEnemies = nextEnemies.filter((enemy) => enemy.health > 0)
      const aliveEnemyMap = aliveEnemies.reduce((accumulator, enemy) => {
        accumulator[enemy.id] = true
        return accumulator
      }, {})
      const aliveProjectiles = [...movedProjectiles, ...createdProjectiles].filter((projectile) => aliveEnemyMap[projectile.targetEnemyId])
      const selectedEnemyId = state.selectedEnemyIdByLevel[state.currentLevelId]
      const selectedEnemyAlive = aliveEnemies.find((enemy) => enemy.id === selectedEnemyId)

      state.towersByLevel[state.currentLevelId] = nextTowers
      state.enemiesByLevel[state.currentLevelId] = aliveEnemies
      state.projectilesByLevel[state.currentLevelId] = aliveProjectiles
      state.selectedEnemyIdByLevel[state.currentLevelId] = selectedEnemyAlive ? selectedEnemyId : null
    },
  },
  actions: {
    selectLevel: (store, levelId) => {
      store.commit(MUTATIONS.SET_LEVEL, levelId)
    },
    addTowerAtSlot: (store, slotId) => {
      store.commit(MUTATIONS.ADD_TOWER, slotId)
    },
    upgradeTowerAtSlot: (store, slotId) => {
      store.commit(MUTATIONS.UPGRADE_TOWER, slotId)
    },
    removeTowerAtSlot: (store, slotId) => {
      store.commit(MUTATIONS.REMOVE_TOWER, slotId)
    },
    addEnemyAtPoint: (store, point) => {
      store.commit(MUTATIONS.ADD_ENEMY, point)
    },
    selectEnemy: (store, enemyId) => {
      store.commit(MUTATIONS.SET_SELECTED_ENEMY, enemyId)
    },
    moveSelectedEnemyByDelta: (store, delta) => {
      store.commit(MUTATIONS.MOVE_SELECTED_ENEMY, delta)
    },
    moveEnemyToPoint: (store, payload) => {
      store.commit(MUTATIONS.MOVE_ENEMY_TO_POINT, payload)
    },
    runSimulationTick: (store, deltaMs) => {
      store.commit(MUTATIONS.APPLY_SIMULATION_TICK, deltaMs)
    },
  }
}
