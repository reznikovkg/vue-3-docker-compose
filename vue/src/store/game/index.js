import { COSTS, ATTACK, MUTATIONS, ACTIONS, GETTERS } from './constants'
import { LEVELS_DATA } from '@/constants/levels'
import { 
  updateTowers, updateShooters, updateAllies 
} from '@/utils/combat'
import { updateArtilleryStrikes } from '@/utils/artillery'
import { updateEnemies, updateAlliesMovement, calculatePathPoints } from '@/utils/movement'
import { 
  createEnemy, spawnEnemy, 
  checkVictoryCondition, checkEnemiesAtEnd, checkAlliesAtEnd 
} from '@/utils/entities'
import { updateBarricades } from '@/utils/barricades'
import { buildTower, canPlaceBarricade, hasEnoughPoints } from '@/utils/placement'

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
      if (!state.selectedTowerId) 
        return null
      return state.towers.find(t => t.positionId === state.selectedTowerId) || null
    },
    
    [GETTERS.GET_UPGRADE_COST]: (state, getters) => {
      const tower = getters[GETTERS.GET_SELECTED_TOWER]
      
      if (!tower || tower.level >= 5) 
        return 0
      
      return [150, 250, 400, 600][tower.level - 1] || 0
    },
    
    [GETTERS.GET_PATH_POINTS]: (state) => {
      return calculatePathPoints(state.currentPath)
    },
    
    [GETTERS.GET_REVERSE_PATH_POINTS]: (state) => {
      if (!state.currentPath?.length) 
        return []
      return [...state.currentPath].reverse()
    }
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
    
    [MUTATIONS.UPDATE_TOWER]: (state, { positionId, updates }) => {
      state.towers = state.towers.map(t =>
        t.positionId === positionId ? { ...t, ...updates } : t
      )
    },
    
    [MUTATIONS.REMOVE_TOWER]: (state, positionId) => {
      const index = state.towers.findIndex(t => t.positionId === positionId)
      if (index !== -1) 
        state.towers.splice(index, 1)
    },
    
    [MUTATIONS.SET_TOWER_HIT]: (state, { positionId, isHit }) => {
      const tower = state.towers.find(t => t.positionId === positionId)
      if (tower) 
        tower.isHit = isHit
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
      if (index !== -1) state.allShots.splice(index, 1)
    },
    
    [MUTATIONS.INCREMENT_KILLS]: (state) => {
      state.totalKills++
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
    
    [MUTATIONS.UPDATE_SPAWN_TIMER]: (state, deltaTime) => {
      state.spawnTimer += deltaTime
    },
    
    [MUTATIONS.RESET_SPAWN_TIMER]: (state) => {
      state.spawnTimer = 0
    }
  },
  
  actions: {
    [ACTIONS.INIT_GAME]: ({ commit, state }) => {
      commit(MUTATIONS.SET_LEVELS, LEVELS_DATA)
      
      const level = LEVELS_DATA[0]
      commit(MUTATIONS.SET_LEVEL, level)
      commit(MUTATIONS.ADD_ENEMY, createEnemy(state, level))
    },
    
    [ACTIONS.LOAD_LEVEL]: ({ commit, state }, levelId) => {
      const level = state.levels.find(l => l.id === levelId)
      if (!level) 
        return
      
      commit(MUTATIONS.RESET_GAME_STATE)
      commit(MUTATIONS.SET_LEVEL, level)
      commit(MUTATIONS.ADD_ENEMY, createEnemy(state, level))
    },
    
    [ACTIONS.RESTART_LEVEL]: ({ commit, state }) => {
      const level = state.levels.find(l => l.id === state.currentLevelId)
      if (!level) 
        return
      
      commit(MUTATIONS.RESET_GAME_STATE)
      commit(MUTATIONS.SET_LEVEL, level)
      commit(MUTATIONS.ADD_ENEMY, createEnemy(state, level))
    },
    
    [ACTIONS.NEXT_LEVEL]: ({ commit, state }) => {
      const nextLevelId = state.currentLevelId + 1
      if (nextLevelId <= state.levels.length) {
        const level = state.levels.find(l => l.id === nextLevelId)
        if (level) {
          commit(MUTATIONS.RESET_GAME_STATE)
          commit(MUTATIONS.SET_LEVEL, level)
          commit(MUTATIONS.ADD_ENEMY, createEnemy(state, level))
        }
      }
    },
    
    [ACTIONS.SPAWN_ALLY]: ({ commit, state, getters }) => {
      if (state.gameOver || state.victory) 
        return
      
      if (!hasEnoughPoints(state, commit, COSTS.ALLY)) 
        return
      
      const path = getters[GETTERS.GET_REVERSE_PATH_POINTS]
      if (!path.length) 
        return
      
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
      if (!tower || tower.level >= 5 || state.gameOver || state.victory) 
        return
      
      const cost = getters[GETTERS.GET_UPGRADE_COST]
      if (!hasEnoughPoints(state, commit, cost)) 
        return
      
      commit(MUTATIONS.REMOVE_POINTS, cost)
      commit(MUTATIONS.UPDATE_TOWER, {
        positionId: tower.positionId,
        updates: {
          level: tower.level + 1,
          damage: 4 + (tower.level + 1) * 1.1,
          attackSpeed: 1 + (tower.level + 1) * 0.3,
          radius: 70 + (tower.level + 1) * 6,
          maxHealth: tower.maxHealth + 15,
          health: tower.maxHealth + 15
        }
      })
      
      commit(MUTATIONS.SET_SELECTED_TOWER, null)
    },
    
    [ACTIONS.SELECT_TOWER_POSITION]: ({ commit, state }, positionId) => {
      const pos = state.towerPositions.find(p => p.id === positionId)
      if (!pos) 
        return
      buildTower(state, commit, pos)
    },
    
    [ACTIONS.UPDATE_GAME]: ({ commit, state }, deltaTime) => {
      if (state.gameOver || state.victory || !state.currentLevel) 
        return
      
      const level = state.currentLevel
      
      commit(MUTATIONS.UPDATE_SPAWN_TIMER, deltaTime)
      
      const spawnRate = level.spawnRate || 2000
      while (state.spawnTimer >= spawnRate && state.enemiesSpawned < state.maxEnemies) {
        spawnEnemy(state, commit, level)
        commit(MUTATIONS.RESET_SPAWN_TIMER)
      }
      
      if (state.enemies?.length) {
        updateEnemies(state, commit, deltaTime)
      }
      
      updateArtilleryStrikes(state, commit, deltaTime)
      updateBarricades(state, commit, deltaTime)
      updateAlliesMovement(state, commit, deltaTime)
      updateTowers(state, commit)
      updateShooters(state, commit)
      updateAllies(state, commit)
      checkVictoryCondition(state, commit)
      checkEnemiesAtEnd(state, commit)
      checkAlliesAtEnd(state, commit)
    },
    
    [ACTIONS.HANDLE_GAME_CLICK]: ({ state, commit }, { event, rect }) => {
      if (state.gameOver || state.victory) 
        return
      
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      
      if (state.placeMode === 'tower') {
        const pos = state.towerPositions.find(
          p => Math.hypot(x - p.x, y - p.y) < 20
        )

        if (pos) {
          buildTower(state, commit, pos)
        }
      } else if (state.placeMode === 'barricade') {
        if (!hasEnoughPoints(state, commit, COSTS.BARRICADE)) 
          return
        
        const point = { x, y }
        
        if (canPlaceBarricade(state, point)) {
          commit(MUTATIONS.ADD_BARRICADE, {
            id: Date.now() + Math.random(),
            x: point.x,
            y: point.y,
            health: 500,
            maxHealth: 500
          })
          
          commit(MUTATIONS.REMOVE_POINTS, COSTS.BARRICADE)
        }
      } else if (state.placeMode === 'artillery') {
        if (!hasEnoughPoints(state, commit, COSTS.ARTILLERY)) 
          return
        
        commit(MUTATIONS.ADD_ARTILLERY_STRIKE, {
          id: Date.now() + Math.random(),
          x: x,
          y: y,
          maxDamage: 10,
          maxRadius: 70,
          duration: 800,
          elapsed: 0
        })
        
        commit(MUTATIONS.REMOVE_POINTS, COSTS.ARTILLERY)
      }
    }
  }
}