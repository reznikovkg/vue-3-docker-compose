import { COSTS, ATTACK, MUTATIONS, ACTIONS, GETTERS } from './constants'
import { LEVELS_DATA } from '@/constants/levels'
import { createEnemy, createTower } from '@/utils/entities'
import { calculatePathPoints } from '@/utils/movement'
import { hasEnoughPoints, buildTower, canPlaceBarricade, canPlaceArtillery } from '@/utils/placement'
import { gameEngine } from '@/engine/gameEngine'

export default {
  namespaced: true,
  
  state: () => ({
    levels: [],
    currentLevelId: 1,
    currentPath: [],
    maxEnemies: 0,
    enemiesSpawned: 0,
    towerPositions: [],
    towers: [],
    enemies: [],
    allies: [],
    barricades: [],
    artilleryStrikes: [],
    allShots: [],
    points: 200,
    totalKills: 0,
    selectedTowerId: null,
    gameOver: false,
    victory: false,
    placeMode: 'tower',
    showInsufficientFunds: false,
    spawnTimer: 0,
    currentLevel: null
  }),
  
  getters: {
    [GETTERS.GET_SELECTED_TOWER]: (state) => {
      if (!state.selectedTowerId) {
        return null
      }
      return state.towers.find(t => t.positionId === state.selectedTowerId) || null
    },
    
    [GETTERS.GET_UPGRADE_COST]: (state, getters) => {
      const tower = getters[GETTERS.GET_SELECTED_TOWER]
      
      if (!tower || tower.level >= 5) {
        return 0
      }
      
      return [150, 250, 400, 600][tower.level - 1] || 0
    },
    
    [GETTERS.GET_PATH_POINTS]: (state) => {
      return calculatePathPoints(state.currentPath)
    },
    
    [GETTERS.GET_REVERSE_PATH_POINTS]: (state) => {
      if (!state.currentPath?.length) {
        return []
      }
      return [...state.currentPath].reverse()
    },
    
    [GETTERS.GET_SHOOTER_ENEMIES]: (state) => {
      return state.enemies.filter(e => e.type === 'shooter')
    },

    [GETTERS.GET_LEVELS]: (state) => state.levels,
    [GETTERS.GET_CURRENT_LEVEL_ID]: (state) => state.currentLevelId,
    [GETTERS.GET_CURRENT_PATH]: (state) => state.currentPath,
    [GETTERS.GET_MAX_ENEMIES]: (state) => state.maxEnemies,
    [GETTERS.GET_ENEMIES_SPAWNED]: (state) => state.enemiesSpawned,
    [GETTERS.GET_TOWER_POSITIONS]: (state) => state.towerPositions,
    [GETTERS.GET_TOWERS]: (state) => state.towers,
    [GETTERS.GET_ENEMIES]: (state) => state.enemies,
    [GETTERS.GET_ALLIES]: (state) => state.allies,
    [GETTERS.GET_BARRICADES]: (state) => state.barricades,
    [GETTERS.GET_ARTILLERY_STRIKES]: (state) => state.artilleryStrikes,
    [GETTERS.GET_ALL_SHOTS]: (state) => state.allShots,
    [GETTERS.GET_POINTS]: (state) => state.points,
    [GETTERS.GET_TOTAL_KILLS]: (state) => state.totalKills,
    [GETTERS.GET_SELECTED_TOWER_ID]: (state) => state.selectedTowerId,
    [GETTERS.GET_GAME_OVER]: (state) => state.gameOver,
    [GETTERS.GET_VICTORY]: (state) => state.victory,
    [GETTERS.GET_PLACE_MODE]: (state) => state.placeMode,
    [GETTERS.GET_SHOW_INSUFFICIENT_FUNDS]: (state) => state.showInsufficientFunds,
    [GETTERS.GET_SPAWN_TIMER]: (state) => state.spawnTimer,
    [GETTERS.GET_CURRENT_LEVEL]: (state) => state.currentLevel
  },
  
  mutations: {
    [MUTATIONS.SET_LEVELS]: (state, levels) => {
      state.levels = levels
    },
    
    [MUTATIONS.SET_LEVEL]: (state, level) => {
      state.currentLevelId = level.id
      state.currentPath = level.path.map(p => ({ ...p }))
      state.maxEnemies = level.maxEnemies || 15
      state.points = level.startCapital || 200
      state.towerPositions = level.towerPositions
        ? level.towerPositions.map(p => ({ ...p, id: p.id }))
        : []
      state.enemiesSpawned = 0
      state.currentLevel = level
      state.spawnTimer = 0
    },
    
    [MUTATIONS.RESET_GAME_STATE]: (state) => {
      state.towers = []
      state.enemies = []
      state.allies = []
      state.barricades = []
      state.artilleryStrikes = []
      state.allShots = []
      state.enemiesSpawned = 0
      state.selectedTowerId = null
      state.totalKills = 0
      state.gameOver = false
      state.victory = false
      state.spawnTimer = 0
    },
    
    [MUTATIONS.ADD_POINTS]: (state, amount) => {
      state.points += amount
    },
    
    [MUTATIONS.REMOVE_POINTS]: (state, amount) => {
      state.points -= amount
    },
    
    [MUTATIONS.SET_INSUFFICIENT_FUNDS]: (state, value) => {
      state.showInsufficientFunds = value
    },
    
    [MUTATIONS.SET_PLACE_MODE]: (state, mode) => {
      state.placeMode = mode
    },
    
    [MUTATIONS.ADD_ENEMY]: (state, enemy) => {
      state.enemies.push(enemy)
      state.enemiesSpawned++
    },
    
    [MUTATIONS.UPDATE_ENEMIES]: (state, enemies) => {
      state.enemies = enemies
    },
    
    [MUTATIONS.ADD_ALLY]: (state, ally) => {
      state.allies.push(ally)
    },
    
    [MUTATIONS.UPDATE_ALLIES]: (state, allies) => {
      state.allies = allies
    },
    
    [MUTATIONS.ADD_TOWER]: (state, tower) => {
      state.towers.push(tower)
    },
    
    [MUTATIONS.UPDATE_TOWERS]: (state, towers) => {
      state.towers = towers
    },
    
    [MUTATIONS.REMOVE_TOWER]: (state, positionId) => {
      const index = state.towers.findIndex(t => t.positionId === positionId)
      if (index !== -1) {
        state.towers.splice(index, 1)
      }
    },
    
    [MUTATIONS.SET_TOWER_HIT]: (state, { positionId, isHit }) => {
      const tower = state.towers.find(t => t.positionId === positionId)
      if (tower) {
        tower.isHit = isHit
      }
    },
    
    [MUTATIONS.ADD_BARRICADE]: (state, barricade) => {
      state.barricades.push(barricade)
    },
    
    [MUTATIONS.UPDATE_BARRICADES]: (state, barricades) => {
      state.barricades = barricades
    },
    
    [MUTATIONS.ADD_ARTILLERY_STRIKE]: (state, strike) => {
      state.artilleryStrikes.push(strike)
    },
    
    [MUTATIONS.UPDATE_ARTILLERY_STRIKES]: (state, strikes) => {
      state.artilleryStrikes = strikes
    },
    
    [MUTATIONS.ADD_SHOT]: (state, shot) => {
      state.allShots.push(shot)
    },
    
    [MUTATIONS.REMOVE_SHOT]: (state, shotId) => {
      const index = state.allShots.findIndex(s => s.id === shotId)
      if (index !== -1) {
        state.allShots.splice(index, 1)
      }
    },
    
    [MUTATIONS.INCREMENT_KILLS]: (state, amount = 1) => {
      state.totalKills += amount
    },
    
    [MUTATIONS.SET_SELECTED_TOWER]: (state, towerId) => {
      state.selectedTowerId = towerId
    },
    
    [MUTATIONS.SET_GAME_OVER]: (state, value) => {
      state.gameOver = value
    },
    
    [MUTATIONS.SET_VICTORY]: (state, value) => {
      state.victory = value
    },
    
    [MUTATIONS.RESET_SPAWN_TIMER]: (state) => {
      state.spawnTimer = 0
    },

    [MUTATIONS.SET_SHOTS]: (state, shots) => {
      state.allShots = shots
    },

    [MUTATIONS.SET_SPAWN_TIMER]: (state, value) => {
      state.spawnTimer = value
    },

    [MUTATIONS.SET_ENEMIES_SPAWNED]: (state, value) => {
      state.enemiesSpawned = value
    },
  },
  
  actions: {
    [ACTIONS.INIT_GAME]: ({ commit }) => {
      commit(MUTATIONS.SET_LEVELS, LEVELS_DATA)
      
      const level = LEVELS_DATA[0]
      commit(MUTATIONS.SET_LEVEL, level)
      commit(MUTATIONS.ADD_ENEMY, createEnemy(level))
    },
    
    [ACTIONS.LOAD_LEVEL]: ({ commit, state }, levelId) => {
      const targetLevelId = levelId || state.currentLevelId
      const level = state.levels.find(l => l.id === targetLevelId)
      if (!level) {
        return
      }
      
      commit(MUTATIONS.RESET_GAME_STATE)
      commit(MUTATIONS.SET_LEVEL, level)
      commit(MUTATIONS.ADD_ENEMY, createEnemy(level))
    },
    
    [ACTIONS.SPAWN_ALLY]: ({ commit, state, getters }) => {
      if (state.gameOver || state.victory) {
        return
      }
      
      if (!hasEnoughPoints(state.points, COSTS.ALLY)) {
        commit(MUTATIONS.SET_INSUFFICIENT_FUNDS, true)
        setTimeout(() => commit(MUTATIONS.SET_INSUFFICIENT_FUNDS, false), 2000)
        return
      }
      
      const path = getters[GETTERS.GET_REVERSE_PATH_POINTS]
      if (!path.length) {
        return
      }
      
      commit(MUTATIONS.ADD_ALLY, {
        id: Date.now() + Math.random(),
        x: path[0].x,
        y: path[0].y,
        health: 150,
        maxHealth: 150,
        attackDamage: ATTACK.ALLY_DAMAGE,
        attackRange: ATTACK.ALLY_RANGE,
        attackCooldown: ATTACK.ALLY_COOLDOWN,
        lastAttackTime: 0,
        speed: 0.1,
        color: '#4a90e2',
        path: path,
        currentTargetIndex: 1,
        currentTarget: path[1] || path[0],
        isAttacking: false
      })
      
      commit(MUTATIONS.REMOVE_POINTS, COSTS.ALLY)
    },
    
    [ACTIONS.UPGRADE_TOWER]: ({ commit, state, getters }) => {
      const tower = getters[GETTERS.GET_SELECTED_TOWER]
      if (!tower || tower.level >= 5 || state.gameOver || state.victory) {
        return
      }
      
      const cost = getters[GETTERS.GET_UPGRADE_COST]
      if (!hasEnoughPoints(state.points, cost)) {
        commit(MUTATIONS.SET_INSUFFICIENT_FUNDS, true)
        setTimeout(() => commit(MUTATIONS.SET_INSUFFICIENT_FUNDS, false), 2000)
        return
      }
      
      commit(MUTATIONS.REMOVE_POINTS, cost)

      const updatedTowers = state.towers.map(t => {
        if (t.positionId === tower.positionId) {
          return {
            ...t,
            level: t.level + 1,
            damage: 4 + (t.level + 1) * 1.1,
            attackSpeed: 1 + (t.level + 1) * 0.3,
            radius: 70 + (t.level + 1) * 6,
            maxHealth: t.maxHealth + 15,
            health: t.maxHealth + 15
          }
        }
        return t
      })
      
      commit(MUTATIONS.UPDATE_TOWERS, updatedTowers)
      commit(MUTATIONS.SET_SELECTED_TOWER, null)
    },
    
    [ACTIONS.SELECT_TOWER_POSITION]: ({ commit, state }, positionId) => {
      const pos = state.towerPositions.find(p => p.id === positionId)
      if (!pos) {
        return
      }
      
      const result = buildTower(state.towers, pos)
      
      if (result.action === 'build') {
        if (!hasEnoughPoints(state.points, COSTS.TOWER)) {
          commit(MUTATIONS.SET_INSUFFICIENT_FUNDS, true)
          setTimeout(() => commit(MUTATIONS.SET_INSUFFICIENT_FUNDS, false), 2000)
          return
        }
        
        commit(MUTATIONS.REMOVE_POINTS, COSTS.TOWER)
        commit(MUTATIONS.ADD_TOWER, result.tower)
        commit(MUTATIONS.SET_SELECTED_TOWER, null)
      } else if (result.action === 'select') {
        commit(MUTATIONS.SET_SELECTED_TOWER, result.positionId)
      }
    },
    
    [ACTIONS.UPDATE_GAME]: ({ state, commit }, deltaTime) => {
      if (state.gameOver || state.victory) {
        return
      }

      const result = gameEngine.update(state, deltaTime)

      commit(MUTATIONS.UPDATE_ENEMIES, result.enemies)
      commit(MUTATIONS.UPDATE_TOWERS, result.towers)
      commit(MUTATIONS.UPDATE_ALLIES, result.allies)
      commit(MUTATIONS.UPDATE_BARRICADES, result.barricades)
      commit(MUTATIONS.UPDATE_ARTILLERY_STRIKES, result.artilleryStrikes)
      commit(MUTATIONS.SET_SHOTS, result.allShots)

      commit(MUTATIONS.SET_SPAWN_TIMER, result.spawnTimer)
      commit(MUTATIONS.SET_ENEMIES_SPAWNED, result.enemiesSpawned)

      if (result.pointsDelta) {
        commit(MUTATIONS.ADD_POINTS, result.pointsDelta)
      }

      if (result.killsDelta) {
        commit(MUTATIONS.INCREMENT_KILLS, result.killsDelta)
      }

      if (result.victory) {
        commit(MUTATIONS.SET_VICTORY, true)
      }

      if (result.gameOver) {
        commit(MUTATIONS.SET_GAME_OVER, true)
        commit(MUTATIONS.UPDATE_ENEMIES, [])
      }

      if (result.hitTowerIds) {
        result.hitTowerIds.forEach(id => {
          commit(MUTATIONS.SET_TOWER_HIT, { positionId: id, isHit: true })
          setTimeout(() => {
            commit(MUTATIONS.SET_TOWER_HIT, { positionId: id, isHit: false })
          }, 200)
        })
      }
    },
    
    [ACTIONS.HANDLE_GAME_CLICK]: ({ state, commit }, { event, rect }) => {
      if (state.gameOver || state.victory) {
        return
      }
      
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      const insufficientFunds = () => {
        commit(MUTATIONS.SET_INSUFFICIENT_FUNDS, true)
        setTimeout(() => commit(MUTATIONS.SET_INSUFFICIENT_FUNDS, false), 2000)
      }

      if (state.placeMode === 'tower') {
        const pos = state.towerPositions.find(
          p => Math.hypot(x - p.x, y - p.y) < 20
        )
        if (!pos) {
          return
        }

        const existing = state.towers.find(t => t.positionId === pos.id)

        if (existing) {
          commit(MUTATIONS.SET_SELECTED_TOWER, pos.id)
          return
        }

        if (!hasEnoughPoints(state.points, COSTS.TOWER)) {
          insufficientFunds()
          return
        }

        commit(MUTATIONS.ADD_TOWER, createTower(pos))
        commit(MUTATIONS.REMOVE_POINTS, COSTS.TOWER)
        return
      }

      if (state.placeMode === 'barricade') {
        if (!hasEnoughPoints(state.points, COSTS.BARRICADE)) {
          insufficientFunds()
          return
        }

        const point = { x, y }

        if (!canPlaceBarricade(point, state.currentPath, state.barricades, state.towers)) {
          return
        }

        commit(MUTATIONS.ADD_BARRICADE, {
          id: Date.now() + Math.random(),
          x,
          y,
          health: 500,
          maxHealth: 500
        })

        commit(MUTATIONS.REMOVE_POINTS, COSTS.BARRICADE)
        return
      }

      if (state.placeMode === 'artillery') {
        const point = { x, y }
        
        if (!canPlaceArtillery(point, state.currentPath)) {
          return
        }
        
        if (!hasEnoughPoints(state.points, COSTS.ARTILLERY)) {
          insufficientFunds()
          return
        }

        commit(MUTATIONS.ADD_ARTILLERY_STRIKE, {
          id: Date.now() + Math.random(),
          x,
          y,
          maxDamage: 10,
          maxRadius: 70,
          duration: 800,
          elapsed: 0
        })

        commit(MUTATIONS.REMOVE_POINTS, COSTS.ARTILLERY)
      }
    },
    
    [ACTIONS.SET_PLACE_MODE]: ({ commit }, mode) => {
      commit(MUTATIONS.SET_PLACE_MODE, mode)
    }
  }
}