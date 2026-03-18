import { processArtilleryStrikes } from '@/utils/artillery'
import { processBarricades } from '@/utils/barricades'
import { processTowerAttacks, processShooterAttacks, processAllyAttacks, processKilledEnemies } from '@/utils/combat'
import { createEnemy, checkVictoryCondition, checkEnemiesAtEnd, checkAlliesAtEnd, canSpawnEnemy } from '@/utils/entities'
import { processEnemyMovement, processAlliesMovement } from '@/utils/movement'

export const gameEngine = {
  update(state, deltaTime) {
    const level = state.currentLevel
    if (!level) 
        return {}

    const now = Date.now()

    let enemies = [...state.enemies]
    let towers = [...state.towers]
    let allies = [...state.allies]
    let barricades = [...state.barricades]
    let strikes = [...state.artilleryStrikes]
    let shots = [...state.allShots]

    let spawnTimer = state.spawnTimer + deltaTime
    let enemiesSpawned = state.enemiesSpawned

    let pointsDelta = 0
    let killsDelta = 0

    const spawnRate = level.spawnRate || 2000

    while (
      spawnTimer >= spawnRate &&
      canSpawnEnemy(enemiesSpawned, state.maxEnemies, state.gameOver, state.victory)
    ) {
      enemies.push(createEnemy(level))
      spawnTimer -= spawnRate
      enemiesSpawned++
    }

    const artilleryResult = processArtilleryStrikes(strikes, enemies, deltaTime)
    strikes = artilleryResult.strikes
    enemies = artilleryResult.enemies
    const artilleryKilled = artilleryResult.killedEnemies || []

    const barricadeResult = processBarricades(barricades, enemies, deltaTime)
    barricades = barricadeResult.barricades
    enemies = barricadeResult.enemies

    enemies = processEnemyMovement(enemies, barricades, deltaTime)
    allies = processAlliesMovement(allies, enemies, deltaTime)

    const towerResult = processTowerAttacks(towers, enemies, now)
    towers = towerResult.towers
    enemies = towerResult.enemies

    shots.push(...towerResult.newShots.map(s => ({ ...s, lifetime: 80 })))

    const shooterResult = processShooterAttacks(enemies, towers, allies, now)
    enemies = shooterResult.enemies
    towers = shooterResult.towers
    allies = shooterResult.allies

    shots.push(...shooterResult.newShots.map(s => ({ ...s, lifetime: 150 })))

    const hitTowerIds = shooterResult.hitTowerIds || []

    const allyResult = processAllyAttacks(allies, enemies, now)
    allies = allyResult.allies
    enemies = allyResult.enemies

    shots.push(...allyResult.newShots.map(s => ({ ...s, lifetime: 150 })))

    const killedResult = processKilledEnemies(
      enemies,
      [
        ...towerResult.killedEnemies,
        ...allyResult.killedEnemies,
        ...artilleryKilled
      ]
    )

    enemies = killedResult.enemies
    pointsDelta += killedResult.rewards
    killsDelta += killedResult.killCount

    shots = shots
      .map(s => ({ ...s, lifetime: s.lifetime - deltaTime }))
      .filter(s => s.lifetime > 0)

    const victory = checkVictoryCondition(
      enemies,
      enemiesSpawned,
      state.maxEnemies,
      state.gameOver,
      state.victory
    )

    const gameOver = checkEnemiesAtEnd(enemies)

    const filteredAllies = checkAlliesAtEnd(allies)

    return {
      enemies,
      towers,
      allies: filteredAllies,
      barricades,
      artilleryStrikes: strikes,
      allShots: shots,
      spawnTimer,
      enemiesSpawned,
      pointsDelta,
      killsDelta,
      victory,
      gameOver,
      hitTowerIds
    }
  }
}