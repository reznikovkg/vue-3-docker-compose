import { processArtilleryStrikes } from '@/utils/artillery'
import { processBarricades } from '@/utils/barricades'
import { processTowerAttacks, processShooterAttacks, processAllyAttacks, processKilledEnemies } from '@/utils/combat'
import { createEnemy, checkVictoryCondition, checkEnemiesAtEnd, checkAlliesAtEnd, canSpawnEnemy } from '@/utils/entities'
import { processEnemyMovement, processAlliesMovement } from '@/utils/movement'

export const gameEngine = {
  update(state, deltaTime) {
    const level = state.currentLevel
    if (!level) {
      return {}
    }

    const now = Date.now()

    let s = this.createBaseState(state, deltaTime)

    s = this.processSpawning(s, level)
    s = this.processArtillery(s, deltaTime)
    s = this.processBarricades(s, deltaTime)
    s = this.processMovement(s, deltaTime)
    s = this.processAttacks(s, now)
    s = this.processShots(s, deltaTime)

    const { victory, gameOver } = this.checkGameStatus(s, state)
    const allies = checkAlliesAtEnd(s.allies)

    return {
      enemies: s.enemies,
      towers: s.towers,
      allies,
      barricades: s.barricades,
      artilleryStrikes: s.strikes,
      allShots: s.shots,
      spawnTimer: s.spawnTimer,
      enemiesSpawned: s.enemiesSpawned,
      pointsDelta: s.pointsDelta,
      killsDelta: s.killsDelta,
      victory,
      gameOver,
      hitTowerIds: s.hitTowerIds
    }
  },

  createBaseState(state, deltaTime) {
    return {
      enemies: state.enemies.map(e => ({ ...e })),
      towers: state.towers.map(t => ({ ...t })),
      allies: state.allies.map(a => ({ ...a })),
      barricades: state.barricades.map(b => ({ ...b })),
      strikes: state.artilleryStrikes.map(s => ({ ...s })),
      shots: state.allShots.map(s => ({ ...s })),
      spawnTimer: state.spawnTimer + deltaTime,
      enemiesSpawned: state.enemiesSpawned,
      pointsDelta: 0,
      killsDelta: 0,
      hitTowerIds: []
    }
  },

  processSpawning(state, level) {
    const spawnRate = level.spawnRate || 2000

    let spawnTimer = state.spawnTimer
    let enemiesSpawned = state.enemiesSpawned
    let enemies = state.enemies

    while (
      spawnTimer >= spawnRate &&
      canSpawnEnemy(enemiesSpawned, level.maxEnemies, false, false)
    ) {
      enemies = [...enemies, createEnemy(level)]
      spawnTimer -= spawnRate
      enemiesSpawned++
    }

    return {
      ...state,
      enemies,
      spawnTimer,
      enemiesSpawned
    }
  },

  processArtillery(state, deltaTime) {
    const { strikes, enemies, killedEnemies } =
      processArtilleryStrikes(state.strikes, state.enemies, deltaTime)

    return {
      ...state,
      strikes,
      enemies,
      artilleryKilled: killedEnemies || []
    }
  },

  processBarricades(state, deltaTime) {
    const { barricades, enemies } =
      processBarricades(state.barricades, state.enemies, deltaTime)

    return {
      ...state,
      barricades,
      enemies
    }
  },

  processMovement(state, deltaTime) {
    const enemies = processEnemyMovement(
      state.enemies,
      state.barricades,
      deltaTime
    )

    const allies = processAlliesMovement(
      state.allies,
      enemies,
      deltaTime
    )

    return {
      ...state,
      enemies,
      allies
    }
  },

  processAttacks(state, now) {
    const towerResult = processTowerAttacks(
      state.towers,
      state.enemies
    )

    const shooterResult = processShooterAttacks(
      towerResult.enemies,
      towerResult.towers,
      state.allies,
      now
    )

    const allyResult = processAllyAttacks(
      shooterResult.allies,
      shooterResult.enemies,
      now
    )

    const shots = [
      ...state.shots,
      ...towerResult.newShots.map(s => ({ ...s, lifetime: 80 })),
      ...shooterResult.newShots.map(s => ({ ...s, lifetime: 150 })),
      ...allyResult.newShots.map(s => ({ ...s, lifetime: 150 }))
    ]

    const killedResult = processKilledEnemies(
      allyResult.enemies,
      [
        ...towerResult.killedEnemies,
        ...allyResult.killedEnemies,
        ...(state.artilleryKilled || [])
      ]
    )

    return {
      ...state,
      enemies: killedResult.enemies,
      towers: shooterResult.towers,
      allies: allyResult.allies,
      shots,
      pointsDelta: state.pointsDelta + killedResult.rewards,
      killsDelta: state.killsDelta + killedResult.killCount,
      hitTowerIds: shooterResult.hitTowerIds || []
    }
  },

  processShots(state, deltaTime) {
    const shots = state.shots
      .map(s => ({
        ...s,
        lifetime: s.lifetime - deltaTime
      }))
      .filter(s => s.lifetime > 0)

    return {
      ...state,
      shots
    }
  },

  checkGameStatus(state, originalState) {
    return {
      victory: checkVictoryCondition(
        state.enemies,
        state.enemiesSpawned,
        originalState.maxEnemies,
        originalState.gameOver,
        originalState.victory
      ),
      gameOver: checkEnemiesAtEnd(state.enemies)
    }
  }
}