<template>
  <div class="game">
    <div class="game__container">
      <div class="game__hud hud">
        <div class="hud__distance">
          <span class="hud__distance-icon">🏆</span>
          <span class="hud__distance-value">
            {{ distance }} м
          </span>
        </div>

        <div class="hud__lives">
          <span
            v-for="index in maxLives"
            :key="index"
            class="hud__life"
          >
            <span
              v-if="index <= lives"
              class="hud__life-icon"
            >
              ❤️
            </span>
            <span
              v-else
              class="hud__life-icon hud__life-icon--empty"
            >
              🤍
            </span>
          </span>
        </div>

        <button
          type="button"
          class="hud__pause-button"
          @click="() => togglePause()"
        >
          <span v-if="isPaused" class="hud__pause-icon">▶</span>
          <span v-else class="hud__pause-icon">⏸</span>
        </button>
      </div>

      <div class="game__canvas-wrapper">
        <canvas
          ref="gameCanvas"
          class="game__canvas"
          :width="canvasSize.width"
          :height="canvasSize.height"
          @touchstart="(event) => onTouchStart(event)"
          @touchend="() => onTouchEnd()"
        />

        <div
          class="car car--player"
          :style="getCarStyle(gameState.playerCar, true)"
        >
          <div class="car__body">
            <div class="car__roof" />
            <div class="car__side car__side--left" />
            <div class="car__side car__side--right" />
            <div class="car__wheel car__wheel--fl" />
            <div class="car__wheel car__wheel--fr" />
            <div class="car__wheel car__wheel--rl" />
            <div class="car__wheel car__wheel--rr" />
          </div>
        </div>

        <div
          v-for="enemy in gameState.enemies"
          :key="enemy.id"
          class="car car--enemy"
          :style="getCarStyle(enemy, false)"
        >
          <div class="car__body">
            <div class="car__roof" />
            <div class="car__side car__side--left" />
            <div class="car__side car__side--right" />
            <div class="car__wheel car__wheel--fl" />
            <div class="car__wheel car__wheel--fr" />
            <div class="car__wheel car__wheel--rl" />
            <div class="car__wheel car__wheel--rr" />
          </div>
        </div>

        <div v-if="isPaused" class="game__overlay game__overlay--pause">
          <div class="game__overlay-text">
            ПАУЗА
          </div>
        </div>

        <div v-if="isGameOver" class="game__overlay game__overlay--over">
          <div class="game__overlay-text">
            ИГРА ОКОНЧЕНА
          </div>
        </div>
      </div>

      <div class="game__hint hint">
        <p class="hint__text hint__text--desktop">
          ← → или A/D для управления, пробел или P - пауза
        </p>
        <p class="hint__text hint__text--mobile">
          Нажимайте на левую или правую часть экрана для управления машиной
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ROUTES } from '@/router'
import { ACTIONS } from '@/store'

const ROAD_WIDTH = 400
const LANE_COUNT = 3
const TUNNEL_TOP_RATIO = 0.52
const INITIAL_SPEED = 3
const SPEED_INCREASE = 0.0005
const INITIAL_LIVES = 3
const ENEMY_WIDTH = 40
const ENEMY_HEIGHT = 70
const ENEMY_SPEED_FACTOR = 0.9
const ENEMY_SPAWN_DISTANCE_STEP = 40
const GAME_OVER_REDIRECT_DELAY = 800

const KEY_LEFT_VALUES = ['ArrowLeft', 'a', 'A', 'ф', 'Ф']
const KEY_RIGHT_VALUES = ['ArrowRight', 'd', 'D', 'в', 'В']
const KEY_PAUSE_VALUES = [' ', 'p', 'P', 'з', 'З']
const GAME_LOOP_FPS = 60

interface Car {
  id?: number
  x: number
  y: number
  width: number
  height: number
  speed: number
  lane?: number
  changingLane?: boolean
  targetLane?: number
  color?: string
}

interface GameState {
  playerCar: Car
  enemies: Car[]
  speed: number
  distance: number
  lives: number
  keys: {
    left: boolean
    right: boolean
  }
}

interface CanvasSize {
  width: number
  height: number
  scale: number
}

const gameCanvas = ref<HTMLCanvasElement | null>(null)
const distance = ref(0)
const isPaused = ref(false)
const isGameOver = ref(false)
const lives = ref(INITIAL_LIVES)
const maxLives = INITIAL_LIVES
const canvasSize = reactive<CanvasSize>({
  width: 0,
  height: 0,
  scale: 1,
})

const store = useStore()
const router = useRouter()

const gameState = reactive<GameState>({
  playerCar: {
    x: ROAD_WIDTH / LANE_COUNT,
    y: 0,
    width: 40,
    height: 70,
    speed: 0,
  },
  enemies: [],
  speed: INITIAL_SPEED,
  distance: 0,
  lives: INITIAL_LIVES,
  keys: {
    left: false,
    right: false,
  },
})

let gameLoopId: number | null = null
let nextEnemySpawnDistance = ENEMY_SPAWN_DISTANCE_STEP
let roadDashOffset = 0
let enemyIdCounter = 1

const getCanvasSize = () => {
  const isMobile = window.innerWidth < 768

  const width = Math.min(
    ROAD_WIDTH,
    window.innerWidth - 40,
  )

  const maxHeight = isMobile ? window.innerHeight - 180 : window.innerHeight - 200
  const height = Math.min(600, maxHeight)

  const scale = width / ROAD_WIDTH

  return {
    width,
    height,
    scale,
  }
}

const updateCanvasSize = () => {
  const size = getCanvasSize()

  canvasSize.width = size.width
  canvasSize.height = size.height
  canvasSize.scale = size.scale
}

const getRoadBoundsAtY = (yPx: number) => {
  const w = canvasSize.width
  const h = canvasSize.height
  const centerX = w / 2
  const topWidth = w * TUNNEL_TOP_RATIO
  const widthAtY = topWidth + (w - topWidth) * Math.min(1, Math.max(0, yPx / h))
  const leftPx = centerX - widthAtY / 2

  return { leftPx, widthPx: widthAtY }
}

const drawCar = (
  context: CanvasRenderingContext2D,
  car: Car,
  color: string,
  isPlayer: boolean,
) => {
  const canvasScale = canvasSize.scale

  const centerX = car.x * canvasScale
  const topY = car.y * canvasScale
  const width = car.width * canvasScale
  const height = car.height * canvasScale
  context.fillStyle = color
  context.fillRect(
    centerX - width / 2,
    topY,
    width,
    height,
  )

  context.fillStyle = isPlayer ? '#1e40af' : '#374151'

  context.fillRect(
    centerX - width / 2 + 5 * canvasScale,
    topY + 10 * canvasScale,
    width - 10 * canvasScale,
    20 * canvasScale,
  )

  context.fillRect(
    centerX - width / 2 + 5 * canvasScale,
    topY + height - 35 * canvasScale,
    width - 10 * canvasScale,
    20 * canvasScale,
  )

  if (isPlayer) {
    context.fillStyle = '#fef08a'

    context.fillRect(
      centerX - width / 2 + 5 * canvasScale,
      topY + height - 5 * canvasScale,
      10 * canvasScale,
      5 * canvasScale,
    )

    context.fillRect(
      centerX + width / 2 - 15 * canvasScale,
      topY + height - 5 * canvasScale,
      10 * canvasScale,
      5 * canvasScale,
    )

    return
  }

  context.fillStyle = '#ef4444'

  context.fillRect(
    centerX - width / 2 + 5 * canvasScale,
    topY,
    10 * canvasScale,
    5 * canvasScale,
  )

  context.fillRect(
    centerX + width / 2 - 15 * canvasScale,
    topY,
    10 * canvasScale,
    5 * canvasScale,
  )
}

const getRandomLaneX = () => {
  const laneWidth = ROAD_WIDTH / LANE_COUNT
  const laneIndex = Math.floor(Math.random() * LANE_COUNT)

  return laneWidth * laneIndex + laneWidth / 2
}

const spawnEnemy = () => {
  const enemyCar: Car = {
    id: enemyIdCounter++,
    x: getRandomLaneX(),
    y: -ENEMY_HEIGHT,
    width: ENEMY_WIDTH,
    height: ENEMY_HEIGHT,
    speed: gameState.speed * ENEMY_SPEED_FACTOR,
    color: `hsl(${Math.floor(Math.random() * 360)}, 80%, 55%)`,
  }

  gameState.enemies.push(enemyCar)
}

const getCarStyle = (car: Car, isPlayer: boolean) => {
  const scale = canvasSize.scale
  const centerYpx = (car.y + car.height / 2) * scale
  const bounds = getRoadBoundsAtY(centerYpx)
  const centerXpx = bounds.leftPx + (car.x / ROAD_WIDTH) * bounds.widthPx

  const gameHeight = canvasSize.height / scale
  const depthRatio = Math.max(0, Math.min(1, (car.y + car.height / 2) / gameHeight))
  const sizeScale = isPlayer ? 1 : 0.72 + 0.28 * depthRatio

  const width = car.width * scale * sizeScale
  const height = car.height * scale * sizeScale

  const roadCenterX = bounds.leftPx + bounds.widthPx / 2
  const roadHalfWidth = bounds.widthPx / 2
  const offsetRatio = roadHalfWidth > 0 ? (centerXpx - roadCenterX) / roadHalfWidth : 0
  const maxTiltDeg = 22
  const tiltDeg = isPlayer ? offsetRatio * maxTiltDeg : 0

  const baseColor = isPlayer ? '#3b82f6' : (car.color || '#9ca3af')

  return {
    width: `${width}px`,
    height: `${height}px`,
    transform: `translate3d(${centerXpx}px, ${centerYpx}px, 0) translate(-50%, -50%) scale(${sizeScale}) rotateX(40deg) rotateY(${tiltDeg}deg)`,
    '--car-color': baseColor,
  }
}

const detectCollisions = () => {
  const player = gameState.playerCar

  const playerLeft = player.x - player.width / 2
  const playerRight = player.x + player.width / 2
  const playerTop = player.y
  const playerBottom = player.y + player.height

  const remainingEnemies: Car[] = []

  let hasCollision = false

  gameState.enemies.forEach((enemy) => {
    const enemyLeft = enemy.x - enemy.width / 2
    const enemyRight = enemy.x + enemy.width / 2
    const enemyTop = enemy.y
    const enemyBottom = enemy.y + enemy.height

    const isOverlapHorizontal = playerLeft < enemyRight && playerRight > enemyLeft
    const isOverlapVertical = playerTop < enemyBottom && playerBottom > enemyTop

    if (isOverlapHorizontal && isOverlapVertical) {
      hasCollision = true

      return
    }

    remainingEnemies.push(enemy)
  })

  gameState.enemies = remainingEnemies

  if (!hasCollision) {
    return
  }

  if (gameState.lives === 0) {
    return
  }

  gameState.lives = gameState.lives - 1
  lives.value = gameState.lives

  if (gameState.lives === 0) {
    isGameOver.value = true
    stopGameLoop()

    window.setTimeout(
      () => {
        store.dispatch(
          ACTIONS.SAVE_SCORE,
          distance.value,
        )

        router.push({
          name: ROUTES.RESULT,
        })
      },
      GAME_OVER_REDIRECT_DELAY,
    )
  }
}

const gameLoop = () => {
  const canvasElement = gameCanvas.value

  if (!canvasElement) {
    return
  }

  if (isPaused.value) {
    return
  }

  const context = canvasElement.getContext('2d')

  if (!context) {
    return
  }

  const canvasScale = canvasSize.scale
  const cw = canvasElement.width
  const ch = canvasElement.height

  context.fillStyle = '#16a34a'
  context.fillRect(0, 0, cw, ch)

  const topBounds = getRoadBoundsAtY(0)
  const bottomBounds = getRoadBoundsAtY(ch)
  const roadLeftTop = topBounds.leftPx
  const roadRightTop = topBounds.leftPx + topBounds.widthPx
  const roadLeftBottom = bottomBounds.leftPx
  const roadRightBottom = bottomBounds.leftPx + bottomBounds.widthPx

  context.fillStyle = '#374151'
  context.beginPath()
  context.moveTo(roadLeftTop, 0)
  context.lineTo(roadRightTop, 0)
  context.lineTo(roadRightBottom, ch)
  context.lineTo(roadLeftBottom, ch)
  context.closePath()
  context.fill()

  context.strokeStyle = '#ffffff'
  context.lineWidth = 2
  context.setLineDash([20 * canvasScale, 15 * canvasScale])
  roadDashOffset = roadDashOffset + gameState.speed * 1.5
  context.lineDashOffset = -roadDashOffset * canvasScale

  let laneIndex = 1

  while (laneIndex < LANE_COUNT) {
    const xTop = roadLeftTop + (topBounds.widthPx / LANE_COUNT) * laneIndex
    const xBottom = roadLeftBottom + (bottomBounds.widthPx / LANE_COUNT) * laneIndex
    context.beginPath()
    context.moveTo(xTop, 0)
    context.lineTo(xBottom, ch)
    context.stroke()
    laneIndex = laneIndex + 1
  }

  context.setLineDash([])

  gameState.speed = gameState.speed + SPEED_INCREASE

  gameState.distance = gameState.distance + gameState.speed * 0.1
  distance.value = Math.floor(gameState.distance)

  if (gameState.distance >= nextEnemySpawnDistance) {
    spawnEnemy()
    nextEnemySpawnDistance = nextEnemySpawnDistance + ENEMY_SPAWN_DISTANCE_STEP
  }

  const playerMoveSpeed = 5 * canvasScale

  if (gameState.keys.left) {
    const minX = gameState.playerCar.width / 2
    const nextX = gameState.playerCar.x - playerMoveSpeed
    gameState.playerCar.x = Math.max(minX, nextX)
  }

  if (gameState.keys.right) {
    const maxX = ROAD_WIDTH - gameState.playerCar.width / 2
    const nextX = gameState.playerCar.x + playerMoveSpeed
    gameState.playerCar.x = Math.min(maxX, nextX)
  }

  gameState.playerCar.y = canvasElement.height / canvasScale - 100

  gameState.enemies.forEach((enemy) => {
    enemy.y = enemy.y + enemy.speed
  })

  const visibleEnemies: Car[] = []

  gameState.enemies.forEach((enemy) => {
    if (enemy.y * canvasScale < canvasElement.height + enemy.height * canvasScale) {
      visibleEnemies.push(enemy)
    }
  })

  gameState.enemies = visibleEnemies

  detectCollisions()
}

const startGameLoop = () => {
  if (gameLoopId !== null) {
    return
  }

  gameLoopId = window.setInterval(
    () => gameLoop(),
    1000 / GAME_LOOP_FPS,
  )
}

const stopGameLoop = () => {
  if (gameLoopId === null) {
    return
  }

  window.clearInterval(gameLoopId)
  gameLoopId = null
}

const togglePause = () => {
  if (isGameOver.value) {
    return
  }

  isPaused.value = !isPaused.value
}

const onKeyDown = (event: KeyboardEvent) => {
  if (KEY_LEFT_VALUES.includes(event.key)) {
    gameState.keys.left = true
  }

  if (KEY_RIGHT_VALUES.includes(event.key)) {
    gameState.keys.right = true
  }

  if (KEY_PAUSE_VALUES.includes(event.key)) {
    isPaused.value = !isPaused.value
  }
}

const onKeyUp = (event: KeyboardEvent) => {
  if (KEY_LEFT_VALUES.includes(event.key)) {
    gameState.keys.left = false
  }

  if (KEY_RIGHT_VALUES.includes(event.key)) {
    gameState.keys.right = false
  }
}

const onTouchStart = (event: TouchEvent) => {
  const canvasElement = gameCanvas.value

  if (!canvasElement) {
    return
  }

  const firstTouch = event.touches[0]
  const boundingRect = canvasElement.getBoundingClientRect()
  const touchX = firstTouch.clientX - boundingRect.left

  const isLeftSide = touchX < boundingRect.width / 2

  gameState.keys.left = isLeftSide
  gameState.keys.right = !isLeftSide
}

const onTouchEnd = () => {
  gameState.keys.left = false
  gameState.keys.right = false
}

onMounted(() => {
  updateCanvasSize()
  window.addEventListener('resize', updateCanvasSize)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)

  startGameLoop()
})

onUnmounted(() => {
  stopGameLoop()

  window.removeEventListener('resize', updateCanvasSize)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
})
</script>

<style scoped lang="scss">
.game {
  display: flex;
  justify-content: center;
  align-items: center;

  &__container {
    display: flex;
    flex-direction: column;
    row-gap: 24px;
    align-items: center;
  }

  &__hud {
    width: 100%;
    max-width: 420px;
  }

  &__canvas-wrapper {
    position: relative;
    perspective: 900px;
    border-radius: var(--vt-radius-default);
    overflow: hidden;
    box-shadow: var(--vt-shadow-default);
  }

  &__canvas {
    display: block;
    border-radius: var(--vt-radius-default);
    border: 4px solid var(--color-border);
    background-color: #16a34a;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--vt-radius-default);
    background-color: rgba(0, 0, 0, 0.55);

    &--pause {
      backdrop-filter: blur(4px);
    }

    &--over {
      backdrop-filter: blur(6px);
    }
  }

  &__overlay-text {
    font-size: 32px;
    font-weight: 800;
    color: var(--vt-c-white);
    text-shadow: 0 0 16px rgba(0, 0, 0, 0.8);
  }

  &__hint {
    width: 100%;
    max-width: 420px;
  }
}

.car {
  position: absolute;
  top: 0;
  left: 0;
  transform-style: preserve-3d;
  transform-origin: center center;
  pointer-events: none;
  transition: transform 0.12s ease-out;
  z-index: 2;

  &__body {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 8px;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.7),
      rgba(255, 255, 255, 0.2)
    ),
    var(--car-color, #9ca3af);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.55);
    overflow: hidden;
  }

  &__roof {
    position: absolute;
    inset: 18%;
    border-radius: 6px;
    background: linear-gradient(180deg, #1f2937, #111827);
    opacity: 0.9;
  }

  &__side {
    position: absolute;
    top: 20%;
    bottom: 20%;
    width: 5px;
    background: linear-gradient(180deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.4));

    &--left {
      left: 0;
    }

    &--right {
      right: 0;
    }
  }

  &__wheel {
    position: absolute;
    width: 18%;
    height: 14%;
    border-radius: 999px;
    background: #020617;
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.6);

    &--fl {
      left: 4%;
      top: 6%;
    }

    &--fr {
      right: 4%;
      top: 6%;
    }

    &--rl {
      left: 4%;
      bottom: 6%;
    }

    &--rr {
      right: 4%;
      bottom: 6%;
    }
  }

  &--player {
    z-index: 3;
  }
}

.hud {
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: 16px;
  position: relative;

  &__distance {
    display: flex;
    align-items: center;
    column-gap: 8px;
    font-family: var(--vt-font-mono);
    font-size: 18px;
    color: var(--vt-c-white);
  }

  &__distance-icon {
    font-size: 20px;
  }

  &__lives {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    column-gap: 4px;
  }

  &__life {
    display: inline-flex;
  }

  &__life-icon {
    font-size: 18px;

    &--empty {
      opacity: 0.4;
    }
  }

  &__pause-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 999px;
    border: 1px solid var(--color-border);
    background-color: var(--color-background-soft);
    color: var(--vt-c-white);
    cursor: pointer;
    transition: background-color 0.15s ease, transform 0.1s ease;

    &:hover {
      background-color: var(--color-background-mute);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  &__pause-icon {
    font-size: 18px;
  }
}

.hint {
  background-color: var(--color-background-mute);
  backdrop-filter: var(--vt-blur-default);
  border-radius: var(--vt-radius-default);
  padding: 12px 16px;
  border: 1px solid var(--color-background-soft);
  color: var(--vt-c-blue-soft);
  font-size: 14px;

  &__text {
    &--desktop {
      display: none;

      @media (min-width: 768px) {
        display: block;
      }
    }

    &--mobile {
      @media (min-width: 768px) {
        display: none;
      }
    }
  }
}
</style>

