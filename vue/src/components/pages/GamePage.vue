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

      <div
        ref="gameField"
        class="game__canvas-wrapper"
        :style="fieldStyle"
        @touchstart="(event) => onTouchStart(event)"
        @touchend="() => onTouchEnd()"
      >
        <div class="game__road" :style="{ clipPath: roadClipPath }" />

        <div
          v-for="index in laneLineIndices"
          :key="'lane-' + index"
          class="game__lane-line"
          :style="getLaneLineStyle(index)"
        />

        <GameCar
          variant="player"
          :style-object="getCarStyle(gameState.playerCar, true)"
        />

        <GameCar
          v-for="enemy in gameState.enemies"
          :key="enemy.id"
          variant="enemy"
          :style-object="getCarStyle(enemy, false)"
        />

        <div
          v-for="item in gameState.roadItems"
          :key="item.id"
          :class="['road-item', `road-item--${item.type}`]"
          :style="getRoadItemStyle(item)"
        />

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
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ROUTES } from '@/router'
import { ACTIONS } from '@/store'
import GameCar from '@/components/ui/GameCar.vue'
import {
  GAME_CONFIG,
  GAME_ROAD_MUTATIONS,
  getLaneCenterX,
  getRandomLane,
  ROAD_CONFIG,
  ROAD_ITEM_TYPES,
  type Car,
  type GameState,
  type RoadItem,
} from '@/store/game-road'

const KEY_LEFT_VALUES = ['ArrowLeft', 'a', 'A', 'ф', 'Ф']
const KEY_RIGHT_VALUES = ['ArrowRight', 'd', 'D', 'в', 'В']
const KEY_PAUSE_VALUES = [' ', 'p', 'P', 'з', 'З']
const GAME_LOOP_FPS = 60

interface FieldSize {
  width: number
  height: number
  scale: number
}

const gameField = ref<HTMLDivElement | null>(null)
const distance = ref(0)
const isPaused = ref(false)
const isGameOver = ref(false)
const lives = ref(GAME_CONFIG.INITIAL_LIVES)
const maxLives = GAME_CONFIG.INITIAL_LIVES
const canvasSize = reactive<FieldSize>({
  width: 0,
  height: 0,
  scale: 1,
})

const store = useStore()
const router = useRouter()

const gameState = store.state.gameRoad as GameState

let gameLoopId: number | null = null
let nextEnemySpawnDistance = GAME_CONFIG.ENEMY_SPAWN_DISTANCE_STEP
let nextRoadItemSpawnDistance = GAME_CONFIG.ROAD_ITEM_SPAWN_DISTANCE_STEP
const roadDashOffset = ref(0)
let enemyIdCounter = 1
let roadItemIdCounter = 1
let isSpeedRecovering = false

const laneLineIndices = Array.from(
  { length: ROAD_CONFIG.LANE_COUNT - 1 },
  (_, i) => i + 1,
)

const roadClipPath = (() => {
  const leftPct = ((1 - ROAD_CONFIG.TUNNEL_TOP_RATIO) / 2) * 100
  const rightPct = 100 - leftPct
  return `polygon(${leftPct}% 0%, ${rightPct}% 0%, 100% 100%, 0% 100%)`
})()

const fieldStyle = computed(() => ({
  width: `${canvasSize.width}px`,
  height: `${canvasSize.height}px`,
}))

const getCanvasSize = () => {
  const isMobile = window.innerWidth < 768

  const width = Math.min(
    ROAD_CONFIG.WIDTH,
    window.innerWidth - 40,
  )

  const maxHeight = isMobile ? window.innerHeight - 180 : window.innerHeight - 200
  const height = Math.min(600, maxHeight)

  const scale = width / ROAD_CONFIG.WIDTH

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
  const topWidth = w * ROAD_CONFIG.TUNNEL_TOP_RATIO
  const widthAtY = topWidth + (w - topWidth) * Math.min(1, Math.max(0, yPx / h))
  const leftPx = centerX - widthAtY / 2

  return { leftPx, widthPx: widthAtY }
}

const spawnEnemy = () => {
  const canSpawnOncoming = Math.random() < 0.35
  const lane = canSpawnOncoming
    ? ROAD_CONFIG.ONCOMING_LANE
    : getRandomLane([1, 2])
  const isOncoming = lane === ROAD_CONFIG.ONCOMING_LANE

  const enemyCar: Car = {
    id: enemyIdCounter++,
    x: getLaneCenterX(lane),
    y: -GAME_CONFIG.ENEMY_HEIGHT,
    width: GAME_CONFIG.ENEMY_WIDTH,
    height: GAME_CONFIG.ENEMY_HEIGHT,
    speed: gameState.speed * (
      isOncoming
        ? GAME_CONFIG.ONCOMING_ENEMY_SPEED_FACTOR
        : GAME_CONFIG.ENEMY_SPEED_FACTOR
    ),
    lane,
    isOncoming,
    color: `hsl(${Math.floor(Math.random() * 360)}, 80%, 55%)`,
  }

  gameState.enemies.push(enemyCar)
}

const spawnRoadItem = () => {
  const lane = getRandomLane([0, 1, 2])
  const roll = Math.random()
  const itemType = roll < 0.33
    ? ROAD_ITEM_TYPES.PIT
    : roll < 0.6
      ? ROAD_ITEM_TYPES.BARRIER
      : roll < 0.82
        ? ROAD_ITEM_TYPES.EXTRA_LIFE
        : ROAD_ITEM_TYPES.SPEED_BOOST

  const roadItem: RoadItem = {
    id: roadItemIdCounter++,
    x: getLaneCenterX(lane),
    y: -58,
    width: itemType === ROAD_ITEM_TYPES.PIT ? 54 : 42,
    height: itemType === ROAD_ITEM_TYPES.PIT ? 22 : 42,
    lane,
    speed: gameState.speed * 0.95,
    type: itemType,
  }

  gameState.roadItems.push(roadItem)
}

const getCarStyle = (car: Car, isPlayer: boolean) => {
  return store.getters.getCarStyle({
    car,
    isPlayer,
    canvasSize,
    roadWidth: ROAD_CONFIG.WIDTH,
    tunnelTopRatio: ROAD_CONFIG.TUNNEL_TOP_RATIO,
  })
}

const getRoadItemStyle = (item: RoadItem) => {
  const scale = canvasSize.scale
  const centerYpx = (item.y + item.height / 2) * scale
  const bounds = getRoadBoundsAtY(centerYpx)
  const centerXpx = bounds.leftPx + (item.x / ROAD_CONFIG.WIDTH) * bounds.widthPx

  const gameHeight = canvasSize.height / scale
  const depthRatio = Math.max(0, Math.min(1, (item.y + item.height / 2) / gameHeight))
  const sizeScale = 0.75 + 0.3 * depthRatio

  return {
    width: `${item.width * scale * sizeScale}px`,
    height: `${item.height * scale * sizeScale}px`,
    transform: `translate3d(${centerXpx}px, ${centerYpx}px, 0) translate(-50%, -50%) scale(${sizeScale})`,
  }
}

const getLaneLineStyle = (laneIndex: number) => {
  const h = canvasSize.height
  const scale = canvasSize.scale

  const topBounds = getRoadBoundsAtY(0)
  const bottomBounds = getRoadBoundsAtY(h)

  const xTop = topBounds.leftPx + (topBounds.widthPx / ROAD_CONFIG.LANE_COUNT) * laneIndex
  const xBottom = bottomBounds.leftPx + (bottomBounds.widthPx / ROAD_CONFIG.LANE_COUNT) * laneIndex

  const dx = xBottom - xTop
  const skewAngle = Math.atan(dx / h) * (180 / Math.PI)

  const isSolid = laneIndex === 1
  const lineWidth = isSolid ? 3 : 2

  const style: Record<string, string> = {
    left: `${xTop}px`,
    width: `${lineWidth}px`,
    transformOrigin: 'top left',
    transform: `skewX(${skewAngle}deg)`,
  }

  if (isSolid) {
    style.backgroundColor = '#facc15'
  } else {
    const dashLen = 20 * scale
    const gapLen = 15 * scale
    style.background = `repeating-linear-gradient(to bottom, #ffffff 0px, #ffffff ${dashLen}px, transparent ${dashLen}px, transparent ${dashLen + gapLen}px)`
    style.backgroundPositionY = `${roadDashOffset.value * scale}px`
  }

  return style
}

const isRectOverlap = (a: Car | RoadItem, b: Car | RoadItem) => {
  const aLeft = a.x - a.width / 2
  const aRight = a.x + a.width / 2
  const aTop = a.y
  const aBottom = a.y + a.height
  const bLeft = b.x - b.width / 2
  const bRight = b.x + b.width / 2
  const bTop = b.y
  const bBottom = b.y + b.height

  return aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop
}

const applyHitPenalty = () => {
  gameState.speed = 0
  gameState.boostRemainingMs = 0
  gameState.speedPenaltyFactor = GAME_CONFIG.COLLISION_SLOWDOWN_FACTOR
  isSpeedRecovering = true
}

const processLifeLoss = () => {
  if (gameState.lives === 0) {
    return
  }

  gameState.lives = gameState.lives - 1
  lives.value = gameState.lives

  if (gameState.lives !== 0) {
    return
  }

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
    GAME_CONFIG.GAME_OVER_REDIRECT_DELAY,
  )
}

const detectEnemyCollisions = () => {
  const player = gameState.playerCar
  const remainingEnemies: Car[] = []
  let hasCollision = false

  gameState.enemies.forEach((enemy) => {
    if (isRectOverlap(player, enemy)) {
      hasCollision = true

      return
    }

    remainingEnemies.push(enemy)
  })

  gameState.enemies = remainingEnemies

  if (!hasCollision) {
    return
  }

  applyHitPenalty()
  processLifeLoss()
}

const detectRoadItemCollisions = () => {
  const player = gameState.playerCar
  const remainingRoadItems: RoadItem[] = []

  gameState.roadItems.forEach((item) => {
    if (!isRectOverlap(player, item)) {
      remainingRoadItems.push(item)

      return
    }

    if (item.type === ROAD_ITEM_TYPES.EXTRA_LIFE) {
      gameState.lives = Math.min(maxLives, gameState.lives + 1)
      lives.value = gameState.lives

      return
    }

    if (item.type === ROAD_ITEM_TYPES.SPEED_BOOST) {
      gameState.boostRemainingMs = GAME_CONFIG.BOOST_DURATION_MS

      return
    }

    applyHitPenalty()
    processLifeLoss()
  })

  gameState.roadItems = remainingRoadItems
}

const gameLoop = () => {
  if (isPaused.value) {
    return
  }

  const scale = canvasSize.scale
  const fieldHeight = canvasSize.height
  const frameMs = 1000 / GAME_LOOP_FPS

  roadDashOffset.value = roadDashOffset.value + gameState.speed * 1.5

  if (isSpeedRecovering) {
    gameState.speed = Math.min(
      GAME_CONFIG.INITIAL_SPEED,
      gameState.speed + GAME_CONFIG.BASE_RECOVERY_ACCEL,
    )
    isSpeedRecovering = gameState.speed < GAME_CONFIG.INITIAL_SPEED
  } else {
    gameState.speed = gameState.speed + GAME_CONFIG.SPEED_INCREASE * gameState.speedPenaltyFactor
    gameState.speedPenaltyFactor = Math.min(
      1,
      gameState.speedPenaltyFactor + GAME_CONFIG.COLLISION_ACCEL_RECOVERY_STEP,
    )
  }

  if (gameState.boostRemainingMs > 0) {
    gameState.boostRemainingMs = Math.max(0, gameState.boostRemainingMs - frameMs)
  }

  const activeBoost = gameState.boostRemainingMs > 0 ? GAME_CONFIG.BOOST_SPEED_BONUS : 0
  const gameSpeedWithBoost = gameState.speed + activeBoost

  gameState.distance = gameState.distance + gameSpeedWithBoost * 0.1
  distance.value = Math.floor(gameState.distance)

  if (gameState.distance >= nextEnemySpawnDistance) {
    spawnEnemy()
    nextEnemySpawnDistance = nextEnemySpawnDistance + GAME_CONFIG.ENEMY_SPAWN_DISTANCE_STEP
  }

  if (gameState.distance >= nextRoadItemSpawnDistance) {
    spawnRoadItem()
    nextRoadItemSpawnDistance = nextRoadItemSpawnDistance + GAME_CONFIG.ROAD_ITEM_SPAWN_DISTANCE_STEP
  }

  const playerMoveSpeed = 5 * scale

  if (gameState.keys.left) {
    const minX = gameState.playerCar.width / 2
    const nextX = gameState.playerCar.x - playerMoveSpeed
    gameState.playerCar.x = Math.max(minX, nextX)
  }

  if (gameState.keys.right) {
    const maxX = ROAD_CONFIG.WIDTH - gameState.playerCar.width / 2
    const nextX = gameState.playerCar.x + playerMoveSpeed
    gameState.playerCar.x = Math.min(maxX, nextX)
  }

  gameState.playerCar.y = fieldHeight / scale - 100

  gameState.enemies.forEach((enemy) => {
    enemy.y = enemy.y + enemy.speed + activeBoost
  })

  const visibleEnemies: Car[] = []

  gameState.enemies.forEach((enemy) => {
    if (enemy.y * scale < fieldHeight + enemy.height * scale) {
      visibleEnemies.push(enemy)
    }
  })

  gameState.enemies = visibleEnemies

  gameState.roadItems.forEach((item) => {
    item.y = item.y + item.speed + activeBoost
  })

  const visibleRoadItems: RoadItem[] = []

  gameState.roadItems.forEach((item) => {
    if (item.y * scale < fieldHeight + item.height * scale) {
      visibleRoadItems.push(item)
    }
  })

  gameState.roadItems = visibleRoadItems

  detectEnemyCollisions()
  detectRoadItemCollisions()
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
  const fieldElement = gameField.value

  if (!fieldElement) {
    return
  }

  const firstTouch = event.touches[0]
  const boundingRect = fieldElement.getBoundingClientRect()
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
  store.commit(`gameRoad/${GAME_ROAD_MUTATIONS.RESET_GAME_STATE}`)
  updateCanvasSize()
  distance.value = 0
  lives.value = GAME_CONFIG.INITIAL_LIVES
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
    background-color: #16a34a;
    border: 4px solid var(--color-border);
  }

  &__road {
    position: absolute;
    inset: 0;
    background-color: #374151;
  }

  &__lane-line {
    position: absolute;
    top: 0;
    height: 100%;
    pointer-events: none;
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

.road-item {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 8px;
  pointer-events: none;
  z-index: 1;
  transform-style: preserve-3d;

  &--pit {
    border-radius: 999px;
    background: radial-gradient(circle at 50% 35%, #374151 0%, #111827 60%, #030712 100%);
    border: 2px solid rgba(15, 23, 42, 0.95);
    box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.8);
  }

  &--barrier {
    background: repeating-linear-gradient(
      45deg,
      #f97316 0,
      #f97316 10px,
      #111827 10px,
      #111827 20px
    );
    border: 2px solid #1f2937;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.6);
  }

  &--extraLife {
    border-radius: 999px;
    background: radial-gradient(circle at 30% 30%, #fca5a5 0%, #ef4444 65%, #be123c 100%);
    border: 2px solid #fef2f2;
    box-shadow: 0 0 12px rgba(248, 113, 113, 0.55);
  }

  &--speedBoost {
    border-radius: 999px;
    background: radial-gradient(circle at 30% 30%, #fde68a 0%, #eab308 65%, #a16207 100%);
    border: 2px solid #fef9c3;
    box-shadow: 0 0 12px rgba(250, 204, 21, 0.55);
  }
}
</style>

