<template>
  <section class="runner-game">
    <GameHeader
      :score="scoreLabel"
      :distance="distanceLabel"
      :coins="coinsCollected"
    />

    <div class="runner-game__layout">
      <div
        ref="sceneRef"
        class="runner-game__area"
        :class="{ 'runner-game__area--paused': !isRunning }"
      >
        <div
          class="runner-game__layer runner-game__layer--sky"
          :style="{ backgroundPositionX: `${backgroundOffset * 0.35}px` }"
        />
        <div
          class="runner-game__layer runner-game__layer--ground"
          :style="{ backgroundPositionX: `${backgroundOffset}px` }"
        />

        <div class="runner-game__entities">
          <div
            class="runner-game__player"
            :class="{ 'runner-game__player--air': isJumping }"
            :style="{
              transform: `translate(${playerPosition.x}px, ${playerPosition.y}px)`,
              width: `${PLAYER.width}px`,
              height: `${PLAYER.height}px`
            }"
          >
            <div class="runner-game__player-body" />
            <div class="runner-game__player-trail" />
          </div>

          <div
            v-for="obstacle in obstacles"
            :key="obstacle.id"
            class="runner-game__obstacle"
            :style="{
              transform: `translate(${obstacle.x}px, ${obstacle.y}px)`,
              width: `${obstacle.width}px`,
              height: `${obstacle.height}px`
            }"
          />

          <div
            v-for="enemy in enemies"
            :key="enemy.id"
            class="runner-game__enemy"
            :class="`runner-game__enemy--${enemy.kind}`"
            :style="{
              transform: `translate(${enemy.x}px, ${enemy.y}px)`,
              width: `${enemy.width}px`,
              height: `${enemy.height}px`
            }"
          >
            <span class="runner-game__enemy-label">
              {{ enemy.kind === 'shooter' ? 'стрелок' : 'боец' }}
            </span>
          </div>

          <div
            v-for="projectile in enemyProjectiles"
            :key="projectile.id"
            class="runner-game__projectile runner-game__projectile--enemy"
            :style="{
              transform: `translate(${projectile.x}px, ${projectile.y}px)`,
              width: `${projectile.width}px`
            }"
          />
          <div
            v-for="projectile in playerProjectiles"
            :key="projectile.id"
            class="runner-game__projectile runner-game__projectile--player"
            :style="{
              transform: `translate(${projectile.x}px, ${projectile.y}px)`,
              width: `${projectile.width}px`
            }"
          />

          <div
            v-for="coin in coins"
            :key="coin.id"
            class="runner-game__coin"
            :style="{
              transform: `translate(${coin.x}px, ${coin.y}px)`,
              width: `${coin.width}px`,
              height: `${coin.height}px`
            }"
          />
        </div>

        <div class="runner-game__hud">
          <div class="runner-game__meter">
            <span class="runner-game__meter-label">Жизни</span>
            <div class="runner-game__lives">
              <span
                v-for="life in maxLives"
                :key="life"
                class="runner-game__life"
                :class="{ 'runner-game__life--lost': life > lives }"
              />
            </div>
          </div>
          <div class="runner-game__meter">
            <span class="runner-game__meter-label">Очки</span>
            <strong class="runner-game__value">{{ scoreLabel }}</strong>
          </div>
          <div class="runner-game__meter">
            <span class="runner-game__meter-label">Цель</span>
            <span class="runner-game__value runner-game__value--muted">
              Перепрыгивайте препятствия, уничтожайте врагов, собирайте монеты
            </span>
          </div>
        </div>

        <div
          v-if="!isRunning || isGameOver"
          class="runner-game__status"
        >
          <p class="runner-game__status-title">
            {{ isGameOver ? 'Игра окончена' : 'Нажмите старт' }}
          </p>
          <p class="runner-game__status-text">
            {{ statusHint }}
          </p>
        </div>
      </div>

      <GameControls
        :is-running="isRunning"
        :defeated="defeated"
        :coins-collected="coinsCollected"
        :damage="damage"
        @start="() => startGame()"
        @jump="() => jump()"
        @shoot="() => shoot()"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import GameControls from '@/components/game/GameControls.vue'
import GameHeader from '@/components/game/GameHeader.vue'

type DamageConfig = {
  bullet: number
  obstacle: number
  enemy: number
}

type RunnerEntity = {
  id: number
  x: number
  y: number
  width: number
  height: number
}

type EnemyEntity = RunnerEntity & {
  kind: 'shooter' | 'fighter'
  fireCooldown: number
  speedBoost: number
}

type Projectile = RunnerEntity & {
  speed: number
  from: 'enemy' | 'player'
}

type CoinEntity = RunnerEntity & {
  value: number
}

const PLAYER = {
  width: 48,
  height: 62,
  x: 118
}
const GROUND_HEIGHT = 70
const BASE_SPEED = 320
const MAX_FRAME_DELTA = 0.035
const GRAVITY = 2200
const JUMP_FORCE = 920
const SCORE_PER_DISTANCE = 0.12
const ENEMY_REWARD = 160
const COIN_REWARD = 90
const maxLives = 3

const props = defineProps<{
  damageConfig?: Partial<DamageConfig>
}>()

const damage = computed<DamageConfig>(() => ({
  bullet: props.damageConfig?.bullet ?? 1,
  obstacle: props.damageConfig?.obstacle ?? 1,
  enemy: props.damageConfig?.enemy ?? 2
}))

const sceneRef = ref<HTMLElement | null>(null)
const playfieldWidth = ref(1040)
const playfieldHeight = ref(420)
const groundLine = ref(playfieldHeight.value - GROUND_HEIGHT)

const lives = ref(maxLives)
const score = ref(0)
const distance = ref(0)
const coinsCollected = ref(0)
const defeated = ref(0)
const backgroundOffset = ref(0)
const scoreLabel = computed(() => Math.floor(score.value))
const distanceLabel = computed(() => Math.floor(distance.value))

const playerY = ref(groundLine.value - PLAYER.height)
const verticalVelocity = ref(0)
const isRunning = ref(false)
const isGameOver = ref(false)
const damageCooldown = ref(0)

const obstacles = ref<RunnerEntity[]>([])
const enemies = ref<EnemyEntity[]>([])
const enemyProjectiles = ref<Projectile[]>([])
const playerProjectiles = ref<Projectile[]>([])
const coins = ref<CoinEntity[]>([])

const spawnTimers = reactive({
  obstacle: 0,
  enemy: 0,
  coin: 0
})

const spawnTargets = reactive({
  obstacle: 0.9,
  enemy: 1.8,
  coin: 1.1
})

let frameId = 0
let lastFrame = 0

const statusHint = computed(() => {
  if (isGameOver.value) {
    return 'Упс... Вы проиграли. Попробуйте еще раз'
  }
  if (!isRunning.value && distance.value === 0) {
    return 'Нажмите «Старт», затем используйте прыжок и выстрел, чтобы уходить от опасности.'
  }
  return 'Игра на паузе. Запустите заново, чтобы продолжить путь.'
})

const playerPosition = computed(() => ({
  x: PLAYER.x,
  y: playerY.value
}))

const isJumping = computed(() => {
  return playerY.value < groundLine.value - PLAYER.height - 2
})

const updateSceneSize = () => {
  const element = sceneRef.value
  if (!element) {
    return
  }
  const bounds = element.getBoundingClientRect()
  playfieldWidth.value = bounds.width
  playfieldHeight.value = bounds.height
  groundLine.value = bounds.height - GROUND_HEIGHT
  if (!isRunning.value) {
    playerY.value = groundLine.value - PLAYER.height
  }
}

const getRandomId = () => {
  return Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`)
}

const intersect = (a: RunnerEntity, b: RunnerEntity) => {
  const horizontal = a.x < b.x + b.width && a.x + a.width > b.x
  const vertical = a.y < b.y + b.height && a.y + a.height > b.y
  return horizontal && vertical
}

const spawnObstacle = () => {
  const height = 32 + Math.random() * 32
  const width = 28 + Math.random() * 28
  const y = groundLine.value - height
  obstacles.value = obstacles.value.concat({
    id: getRandomId(),
    x: playfieldWidth.value + width,
    y,
    width,
    height
  })
}

const spawnEnemy = () => {
  const kind: EnemyEntity['kind'] = Math.random() > 0.45 ? 'shooter' : 'fighter'
  const height = kind === 'fighter' ? 70 : 62
  const width = kind === 'fighter' ? 50 : 56
  const y = groundLine.value - height
  enemies.value = enemies.value.concat({
    id: getRandomId(),
    x: playfieldWidth.value + 60 + Math.random() * 140,
    y,
    width,
    height,
    kind,
    fireCooldown: kind === 'shooter' ? 1.2 + Math.random() * 1.6 : 0,
    speedBoost: 20 + Math.random() * 80
  })
}

const spawnCoin = () => {
  const airborne = Math.random() > 0.55
  const size = 24
  const y = airborne
    ? groundLine.value - PLAYER.height - size - 18
    : groundLine.value - size - 6
  coins.value = coins.value.concat({
    id: getRandomId(),
    x: playfieldWidth.value + 40 + Math.random() * 120,
    y,
    width: size,
    height: size,
    value: COIN_REWARD
  })
}

const spawnEnemyProjectile = (enemy: EnemyEntity) => {
  enemyProjectiles.value = enemyProjectiles.value.concat({
    id: getRandomId(),
    x: enemy.x - 14,
    y: enemy.y + enemy.height * 0.4,
    width: 14,
    height: 8,
    speed: BASE_SPEED + 260,
    from: 'enemy'
  })
}

const shoot = () => {
  if (!isRunning.value) {
    return
  }
  if (playerProjectiles.value.length > 4) {
    return
  }
  playerProjectiles.value = playerProjectiles.value.concat({
    id: getRandomId(),
    x: PLAYER.x + PLAYER.width - 4,
    y: playerY.value + PLAYER.height * 0.45,
    width: 16,
    height: 8,
    speed: BASE_SPEED + 320,
    from: 'player'
  })
}

const jump = () => {
  if (!isRunning.value) {
    return
  }
  if (playerY.value < groundLine.value - PLAYER.height - 1) {
    return
  }
  verticalVelocity.value = -JUMP_FORCE
}

const applyDamage = (value: number) => {
  if (!isRunning.value) {
    return
  }
  if (damageCooldown.value > 0) {
    return
  }

  const nextLives = Math.max(0, lives.value - value)
  lives.value = nextLives
  damageCooldown.value = 0.75

  if (nextLives <= 0) {
    isGameOver.value = true
    isRunning.value = false
  }
}

const updateProjectiles = (delta: number, speed: number) => {
  enemyProjectiles.value = enemyProjectiles.value
    .map((projectile) => ({
      ...projectile,
      x: projectile.x - (projectile.speed + speed * 0.35) * delta
    }))
    .filter((projectile) => projectile.x + projectile.width > -32)

  playerProjectiles.value = playerProjectiles.value
    .map((projectile) => ({
      ...projectile,
      x: projectile.x + projectile.speed * delta
    }))
    .filter((projectile) => projectile.x < playfieldWidth.value + 180)
}

const updateObstacles = (delta: number, speed: number) => {
  obstacles.value = obstacles.value
    .map((obstacle) => ({
      ...obstacle,
      x: obstacle.x - speed * delta
    }))
    .filter((obstacle) => obstacle.x + obstacle.width > -32)
}

const updateEnemies = (delta: number, speed: number) => {
  enemies.value = enemies.value
    .map((enemy) => {
      const next = {
        ...enemy,
        x: enemy.x - (speed + enemy.speedBoost) * delta,
        fireCooldown: Math.max(0, enemy.fireCooldown - delta)
      }

      if (next.kind === 'shooter' && next.fireCooldown === 0 && next.x < playfieldWidth.value - 140) {
        spawnEnemyProjectile(next)
        next.fireCooldown = 1 + Math.random() * 1.4
      }

      return next
    })
    .filter((enemy) => enemy.x + enemy.width > -40)
}

const updateCoins = (delta: number, speed: number) => {
  coins.value = coins.value
    .map((coin) => ({
      ...coin,
      x: coin.x - speed * delta
    }))
    .filter((coin) => coin.x + coin.width > -16)
}

const handleCollisions = () => {
  const playerBox: RunnerEntity = {
    id: 0,
    x: playerPosition.value.x,
    y: playerPosition.value.y,
    width: PLAYER.width,
    height: PLAYER.height
  }

  obstacles.value = obstacles.value.filter((obstacle) => {
    if (intersect(playerBox, obstacle)) {
      applyDamage(damage.value.obstacle)
      return false
    }
    return true
  })

  enemyProjectiles.value = enemyProjectiles.value.filter((projectile) => {
    if (intersect(playerBox, projectile)) {
      applyDamage(damage.value.bullet)
      return false
    }
    return true
  })

  enemies.value = enemies.value.filter((enemy) => {
    if (intersect(playerBox, enemy)) {
      applyDamage(damage.value.enemy)
      return false
    }
    return true
  })

  playerProjectiles.value = playerProjectiles.value.filter((projectile) => {
    let hit = false
    enemies.value = enemies.value.filter((enemy) => {
      if (!hit && intersect(projectile, enemy)) {
        defeated.value += 1
        score.value += ENEMY_REWARD
        hit = true
        return false
      }
      return true
    })
    return !hit
  })

  coins.value = coins.value.filter((coin) => {
    if (intersect(playerBox, coin)) {
      coinsCollected.value += 1
      score.value += coin.value
      return false
    }
    return true
  })
}

const updatePlayer = (delta: number) => {
  verticalVelocity.value += GRAVITY * delta
  playerY.value += verticalVelocity.value * delta

  const maxY = groundLine.value - PLAYER.height
  if (playerY.value > maxY) {
    playerY.value = maxY
    verticalVelocity.value = 0
  }
}

const advanceSpawners = (delta: number) => {
  spawnTimers.obstacle += delta
  spawnTimers.enemy += delta
  spawnTimers.coin += delta

  if (spawnTimers.obstacle >= spawnTargets.obstacle) {
    spawnObstacle()
    spawnTimers.obstacle = 0
    spawnTargets.obstacle = 0.7 + Math.random() * 0.9
  }

  if (spawnTimers.enemy >= spawnTargets.enemy) {
    spawnEnemy()
    spawnTimers.enemy = 0
    spawnTargets.enemy = 1.4 + Math.random() * 1.6
  }

  if (spawnTimers.coin >= spawnTargets.coin) {
    spawnCoin()
    spawnTimers.coin = 0
    spawnTargets.coin = 0.85 + Math.random() * 0.9
  }
}

const tick = (timestamp: number) => {
  if (!isRunning.value) {
    return
  }

  const delta = Math.min(MAX_FRAME_DELTA, (timestamp - lastFrame) / 1000 || 0)
  lastFrame = timestamp

  if (damageCooldown.value > 0) {
    damageCooldown.value = Math.max(0, damageCooldown.value - delta)
  }

  const speedBoost = Math.min(240, distance.value * 0.08)
  const speed = BASE_SPEED + speedBoost

  backgroundOffset.value = backgroundOffset.value - speed * delta
  distance.value += speed * delta * 0.2
  score.value += speed * delta * SCORE_PER_DISTANCE

  updatePlayer(delta)
  advanceSpawners(delta)
  updateObstacles(delta, speed)
  updateEnemies(delta, speed)
  updateCoins(delta, speed)
  updateProjectiles(delta, speed)
  handleCollisions()

  if (isRunning.value) {
    frameId = requestAnimationFrame(tick)
  }
}

const resetWorld = () => {
  lives.value = maxLives
  score.value = 0
  distance.value = 0
  coinsCollected.value = 0
  defeated.value = 0
  backgroundOffset.value = 0
  playerY.value = groundLine.value - PLAYER.height
  verticalVelocity.value = 0
  obstacles.value = []
  enemies.value = []
  enemyProjectiles.value = []
  playerProjectiles.value = []
  coins.value = []
  damageCooldown.value = 0
  spawnTimers.obstacle = 0
  spawnTimers.enemy = 0
  spawnTimers.coin = 0
  spawnTargets.obstacle = 0.9
  spawnTargets.enemy = 1.8
  spawnTargets.coin = 1.1
}

const startGame = () => {
  cancelAnimationFrame(frameId)
  resetWorld()
  isGameOver.value = false
  isRunning.value = true
  lastFrame = performance.now()
  frameId = requestAnimationFrame(tick)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.code === 'KeyW' || event.code === 'ArrowUp') {
    event.preventDefault()
    if (!isRunning.value) {
      startGame()
      return
    }
    jump()
  }
  if (event.code === 'Space') {
    event.preventDefault()
    if (!isRunning.value) {
      startGame()
      return
    }
    shoot()
  }
  if (event.code === 'KeyF' || event.code === 'ControlRight') {
    event.preventDefault()
    shoot()
  }
}

onMounted(() => {
  updateSceneSize()
  window.addEventListener('resize', updateSceneSize)
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frameId)
  window.removeEventListener('resize', updateSceneSize)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="scss">
.runner-game {
  grid-column: 1 / -1;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 8px;
  border-radius: 20px;
  background: radial-gradient(circle at 10% 20%, rgba(52, 211, 153, 0.16), transparent 36%),
    radial-gradient(circle at 90% 10%, rgba(96, 165, 250, 0.14), transparent 42%),
    linear-gradient(145deg, #0b1224, #0a1122 32%, #0f172a);
  box-shadow: 0 14px 38px rgba(15, 23, 42, 0.35);
  color: #e2e8f0;

  &__layout {
    display: grid;
    grid-template-rows: 1fr auto;
    gap: 12px;
  }

  &__area {
    position: relative;
    overflow: hidden;
    border-radius: 18px;
    min-height: clamp(460px, 68vh, 660px);
    height: clamp(460px, 68vh, 660px);
    background: #0c1424;
    border: 1px solid rgba(226, 232, 240, 0.08);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }

  &__area--paused::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(15, 23, 42, 0.32), transparent 50%, rgba(15, 23, 42, 0.48));
    pointer-events: none;
  }

  &__layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &__layer--sky {
    background-image:
      radial-gradient(circle at 20% 30%, rgba(94, 234, 212, 0.16), transparent 32%),
      radial-gradient(circle at 80% 25%, rgba(147, 197, 253, 0.18), transparent 34%),
      repeating-linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.05) 0,
        rgba(255, 255, 255, 0.05) 2px,
        transparent 2px,
        transparent 14px
      );
    background-size: 600px 100%, 520px 100%, 120px 120px;
    transition: background-position-x 0.04s linear;
  }

  &__layer--ground {
    background-image:
      url('@/assets/background.jpg'),
      linear-gradient(0deg, #0a0f1c 0%, #0f172a 38%),
      repeating-linear-gradient(
        -45deg,
        rgba(94, 234, 212, 0.1) 0,
        rgba(94, 234, 212, 0.1) 12px,
        transparent 12px,
        transparent 26px
      );
    background-size: 1200px 100%, 100% 100%, 120px 60px;
    background-repeat: repeat-x;
    background-position: 0 76%, 0 100%, 0 100%;
    transition: background-position-x 0.04s linear;
  }

  &__entities {
    position: absolute;
    inset: 0;
    padding: 22px 18px 0;
  }

  &__player {
    position: absolute;
    transition: filter 0.2s ease;
  }

  &__player--air {
    filter: drop-shadow(0 8px 16px rgba(94, 234, 212, 0.3));
  }

  &__player-body {
    width: 100%;
    height: 100%;
    border-radius: 12px;
    background: linear-gradient(135deg, #22d3ee, #06b6d4);
    box-shadow:
      inset 0 0 0 2px rgba(15, 23, 42, 0.4),
      0 10px 24px rgba(6, 182, 212, 0.45);
    position: relative;
  }

  &__player-trail {
    position: absolute;
    left: -10px;
    top: 18px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(94, 234, 212, 0.65), transparent 70%);
    filter: blur(6px);
  }

  &__obstacle {
    position: absolute;
    background: linear-gradient(180deg, #fbbf24, #f59e0b);
    border-radius: 8px 8px 6px 6px;
    box-shadow: 0 6px 16px rgba(234, 179, 8, 0.32);
  }

  &__enemy {
    position: absolute;
    border-radius: 10px;
    display: grid;
    place-items: center;
    color: #0f172a;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    box-shadow: 0 10px 18px rgba(248, 113, 113, 0.32);
  }

  &__enemy--fighter {
    background: linear-gradient(180deg, #f97316, #ea580c);
  }

  &__enemy--shooter {
    background: linear-gradient(180deg, #60a5fa, #2563eb);
    box-shadow: 0 10px 18px rgba(37, 99, 235, 0.32);
  }

  &__enemy-label {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 6px;
    max-width: calc(100% - 8px);
    background: rgba(255, 255, 255, 0.16);
    border-radius: 999px;
    color: #0b1120;
    font-weight: 700;
    font-size: 10px;
    line-height: 1.1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    box-sizing: border-box;
  }

  &__projectile {
    position: absolute;
    height: 10px;
    border-radius: 999px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.22);
  }

  &__projectile--enemy {
    background: linear-gradient(90deg, #f472b6, #e11d48);
  }

  &__projectile--player {
    background: linear-gradient(90deg, #67e8f9, #22d3ee);
  }

  &__coin {
    position: absolute;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #fef3c7, #fbbf24 68%);
    box-shadow:
      0 6px 16px rgba(251, 191, 36, 0.28),
      inset 0 0 0 2px rgba(255, 255, 255, 0.22);
  }

  &__hud {
    position: absolute;
    left: 18px;
    right: 18px;
    top: 16px;
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-radius: 16px;
    background: rgba(15, 23, 42, 0.58);
    border: 1px solid rgba(226, 232, 240, 0.08);
    backdrop-filter: blur(8px);
  }

  &__meter {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  &__meter-label {
    font-size: 12px;
    color: rgba(226, 232, 240, 0.7);
  }

  &__value {
    font-size: 18px;
    font-weight: 700;
    color: #f8fafc;
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum' 1;
  }

  &__value--muted {
    font-size: 13px;
    color: rgba(226, 232, 240, 0.78);
  }

  &__lives {
    display: flex;
    gap: 6px;
  }

  &__life {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    background: linear-gradient(135deg, #22d3ee, #34d399);
    box-shadow: 0 4px 12px rgba(34, 211, 238, 0.36);
  }

  &__life--lost {
    background: linear-gradient(135deg, rgba(100, 116, 139, 0.36), rgba(148, 163, 184, 0.3));
    box-shadow: none;
  }

  &__status {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    text-align: center;
    gap: 6px;
    color: #e2e8f0;
    background: linear-gradient(180deg, rgba(15, 23, 42, 0.4), rgba(10, 12, 26, 0.72));
  }

  &__status-title {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
  }

  &__status-text {
    margin: 0;
    max-width: 520px;
    color: rgba(226, 232, 240, 0.78);
  }

  @media (max-width: 820px) {
    &__layout {
      grid-template-rows: minmax(320px, 1fr) auto;
    }

    &__hud {
      flex-direction: column;
      align-items: flex-start;
    }
  }
}
</style>
