<template>
  <div class="c-game">
    <!--
    <slot name="start">
      <button type="button" class="c-game__start" @click="() => startGame()">
        <slot name="start-label"></slot>
      </button>
    </slot>

    <div class="c-game__controls">
      <div class="c-game__time">Time: {{ timeLeft }}</div>
      <button type="button" class="c-game__stop" @click="() => stopGame(false)">
        Stop
      </button>
    </div>
    -->

    <div ref="gameField" class="c-game__field" @click="(e) => handleFieldClick(e)" @mousemove="(e) => onFieldMouseMove(e)">
      <div class="c-game__topbar" @click="(e) => e.stopPropagation()">
        <div class="c-game__targetWrap">
          <div class="c-game__target">
            <span class="c-game__targetText">Собирай:</span>
            <span class="c-game__targetColor" :style="{ background: targetColor }"></span>
          </div>

          <div class="c-game__score">
            <span class="c-game__scoreText">Очки:</span>
            <span class="c-game__scoreValue">{{ scoreRounded }}</span>
          </div>

          <div class="c-game__comboBox c-game__comboBox--hit">
            <span class="c-game__comboBoxLabel">Коэф.Попаданий</span>
            <span class="c-game__comboBoxValue">x{{ hitComboMultiplier.toFixed(1) }}</span>
          </div>

          <div class="c-game__comboBox c-game__comboBox--miss">
            <span class="c-game__comboBoxLabel">Коэф.Промаха</span>
            <span class="c-game__comboBoxValue">x{{ missComboMultiplier.toFixed(1) }}</span>
          </div>
        </div>

        <div class="c-game__timer">
          {{ formattedTime }}
        </div>

        <div class="c-game__stop" @click="() => stopGame(false)">
          <span class="c-game__stopIcon">⏸</span>
          <span class="c-game__stopText">Стоп</span>
        </div>
      </div>

      <!--
      <button
        v-for="bubble in bubbles"
        :key="bubble.id"
        type="button"
        class="c-game__bubble"
        :data-id="bubble.id"
        :class="'c-game__bubble--' + bubble.color"
        :style="{ left: bubble.x + 'px', top: bubble.y + 'px', width: bubble.r * 2 + 'px', height: bubble.r * 2 + 'px', backgroundImage: bubble.imageUrl ? 'url(' + bubble.imageUrl + ')' : 'none' }"
      ></button>
      -->

      <Bubble
        v-for="bubble in bubbles"
        :key="bubble.id"
        :bubbleId="bubble.id"
        :type="bubble.color"
        :left="bubble.x"
        :top="bubble.y"
        :size="bubble.r * 2"
        :sizeType="bubble.size"
      />

      <div
        v-for="mark in marks"
        :key="mark.id"
        class="c-game__mark"
        :class="{ 'c-game__mark--hide': !mark.isActive }"
        :style="{ left: mark.x + 'px', top: mark.y + 'px' }"
      ></div>

      <div
        v-for="item in comboTextItems"
        :key="item.id"
        class="c-game__comboText"
        :class="'c-game__comboText--' + item.type"
        :style="{ left: item.x + 'px', top: item.y + 'px' }"
      >
        {{ item.text }}
      </div>

      <div
        v-for="bomb in bombItems"
        :key="bomb.id"
        class="c-game__bomb"
        :class="{ 'c-game__bomb--grow': bomb.isGrow }"
        :style="{ left: bomb.x + 'px', top: bomb.y + 'px' }"
      >
        <img class="c-game__bombImage" :src="bombImage" alt="bomb">
      </div>

      <div
        v-for="explosion in bombExplosionItems"
        :key="explosion.id"
        class="c-game__bombExplosion"
        :style="{ left: explosion.x + 'px', top: explosion.y + 'px', width: explosion.size + 'px', height: explosion.size + 'px' }"
      >
        <img class="c-game__bombExplosionImage" :src="explosionImage" alt="explosion">
      </div>

      <div
        v-if="modeState.laser.activeLeft > 0"
        class="c-game__laserCursor"
        :style="{ left: laserX + 'px', top: laserY + 'px' }"
      ></div>

      <div class="c-game__modes" @click="(e) => e.stopPropagation()">
        <button
          type="button"
          class="c-game__modeBtn"
          :class="{ 'c-game__modeBtn--active': activeMode === 'bomb' }"
          @click="() => setGameMode('bomb')"
        >
          <span class="c-game__modeBtnText">💣 Bomb (X)</span>
          <span class="c-game__modeBtnCount">{{ bombsCount }}</span>
        </button>

        <button
          type="button"
          class="c-game__modeBtn"
          :class="{
            'c-game__modeBtn--active': modeState.laser.activeLeft > 0,
            'c-game__modeBtn--disabled': isModeCooldown('laser')
          }"
          :disabled="isModeCooldown('laser')"
          @click="() => setGameMode('laser')"
        >
          <span class="c-game__modeBtnText">⚡ Laser (C)</span>
          <span v-if="getModeTime('laser')" class="c-game__modeBtnTime">
            {{ getModeTime('laser') }}
          </span>
        </button>

        <button
          type="button"
          class="c-game__modeBtn"
          :class="{
            'c-game__modeBtn--active': modeState.automat.activeLeft > 0,
            'c-game__modeBtn--disabled': isModeCooldown('automat')
          }"
          :disabled="isModeCooldown('automat')"
          @click="() => setGameMode('automat')"
        >
          <span class="c-game__modeBtnText">🔫 Automat (V)</span>
          <span v-if="getModeTime('automat')" class="c-game__modeBtnTime">
            {{ getModeTime('automat') }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  GAME_COLORS,
  GAME_DEFAULTS,
  BUBBLE_RULES,
  GAME_MODE_RULES
} from '@/constants/gameConfig.js'
import {
  handleLaserMode,
  startAutomatMode,
  stopAutomatMode,
  applyCombo,
  spawnBomb
} from '@/game/gameModes'
import { mapActions } from 'vuex'
import Bubble from '@/components/ui/Bubble.vue'
import bombAsset from '@/assets/game/bomb.png'
import explosionAsset from '@/assets/game/expl.png'

export default {
  name: 'BubbleGame',

  components: {
    Bubble
  },

  // (IndexPage -> GamwMenu | GamwMenu на start | IndexPage в startFromMenu(settings) | IndexPage -> BubbleGame )
  props: {
    // цвета участвующие в генерации пузырей см.список
    colorsCount: {
      type: Number,
      default: GAME_DEFAULTS.colorsCount
    },
    // цвет - попал - правильно
    targetColor: {
      type: String,
      default: GAME_DEFAULTS.targetColor
    },
    // пузырей в секунду мб писать дробной
    intensity: {
      type: Number,
      default: GAME_DEFAULTS.intensity
    },
    // очки по целевому цвету
    scoreHit: {
      type: Number,
      default: GAME_DEFAULTS.scoreHit
    },
    // промах по целевому цвету
    scoreMiss: {
      type: Number,
      default: GAME_DEFAULTS.scoreMiss
    },
    // вне колбэк при старте
    onStart: {
      type: Function,
      default: null
    },
    maxTime: {
      type: Number,
      default: GAME_DEFAULTS.maxTime
    }
  },

  emits: ['finish', 'update:score'],

  // flagi состояния
  data() {
    return {
      // старт ли?
      isRunning: false,
      score: 0,
      // пузыри на поле и некст пузырик
      bubbles: [],
      nextId: 1,
      spawnTimerId: null,
      finishTimerId: null,
      timeLeft: GAME_DEFAULTS.maxTime,
      rafId: null,
      activeMode: 'normal',
      marks: [], // метки выстрелов автомата
      autoShotTimerId: null,  // интервал автовыстрелов
      hitComboMultiplier: 1,
      missComboMultiplier: 1,
      comboTextItems: [],
      bombsCount: 0,
      successfulHitsCount: 0,
      bombItems: [],
      bombExplosionItems: [],
      modeTickTimerId: null,
      modeState: {
        laser: {
          activeLeft: 0,
          cooldownLeft: 0
        },
        automat: {
          activeLeft: 0,
          cooldownLeft: 0
        }
      },
      laserX: 0,
      laserY: 0,
      laserClientX: 0,
      laserClientY: 0
    }
  },

  computed: {
    bombImage() {
      return bombAsset
    },

    explosionImage() {
      return explosionAsset
    },

    scoreRounded() {
      return Math.round(this.score)
    },

    formattedTime() {
      const safeTime = this.timeLeft > 0 ? this.timeLeft : 0
      const mm = Math.floor(safeTime / 60)
      const ss = safeTime % 60
      const mmText = String(mm).padStart(2, '0')
      const ssText = String(ss).padStart(2, '0')
      return mmText + ':' + ssText
    }
  },

  // стараться не трогать
  methods: {
    ...mapActions('list', [
      'setList'
    ]),

    activateAutomatMode() {
      this.activeMode = 'automat'
      startAutomatMode(this)
    },

    deactivateAutomatMode() {
      stopAutomatMode(this)
    },

    getModeConfig(mode) {
      return GAME_MODE_RULES[mode] || null
    },

    isModeCooldown(mode) {
      const state = this.modeState[mode]
      return state ? state.cooldownLeft > 0 : false
    },

    getModeTime(mode) {
      const state = this.modeState[mode]
      if (!state) {
        return ''
      }

      if (state.activeLeft > 0) {
        return state.activeLeft
      }

      if (state.cooldownLeft > 0) {
        return state.cooldownLeft
      }

      return ''
    },

    finishMode(mode) {
      const config = this.getModeConfig(mode)
      if (!config || !this.modeState[mode]) {
        return
      }

      if (mode === 'automat') {
        this.deactivateAutomatMode()
      } else if (mode === 'bomb' && this.activeMode === mode) {
        this.activeMode = 'normal'
      }

      this.modeState[mode].activeLeft = 0
      this.modeState[mode].cooldownLeft = config.cooldown
    },

    tickModes() {
      this.tickMode('laser')
      this.tickMode('automat')
    },

    tickMode(mode) {
      const state = this.modeState[mode]

      if (!state) {
        return
      }

      if (state.activeLeft > 0) {
        state.activeLeft -= 1

        if (state.activeLeft <= 0) {
          this.finishMode(mode)
        }

        return
      }

      if (state.cooldownLeft > 0) {
        state.cooldownLeft -= 1
      }
    },

    startModeTick() {
      if (this.modeTickTimerId) {
        clearInterval(this.modeTickTimerId)
      }

      this.modeTickTimerId = setInterval(() => {
        this.tickModes()
      }, 1000)
    },

    setGameMode(mode) {
      if (mode === 'bomb') {
        if (this.activeMode === 'bomb') {
          this.activeMode = 'normal'
          return
        }

        if (!this.bombsCount) {
          return
        }

        this.activeMode = 'bomb'
        return
      }

      const state = this.modeState[mode]
      if (this.isModeCooldown(mode)) {
        return
      }

      if (this.activeMode === mode) {
        return
      }

      if (state && state.activeLeft > 0) {
        if (mode === 'automat') {
          this.activateAutomatMode()
          return
        }

        this.activeMode = mode
        return
      }

      if (mode === 'automat') {
        this.modeState.automat.activeLeft = this.getModeConfig('automat').active
        this.modeState.automat.cooldownLeft = 0
        this.activateAutomatMode()
        return
      }

      this.modeState.laser.activeLeft = this.getModeConfig('laser').active
      this.modeState.laser.cooldownLeft = 0
      this.activeMode = mode
    },

    onKeyDown(e) {
      if (e.code === 'KeyX') {
        this.setGameMode('bomb')
      }

      if (e.code === 'KeyC') {
        this.setGameMode('laser')
      }

      if (e.code === 'KeyV') {
        this.setGameMode('automat')
      }
    },

    comboMode(bubble, x, y, index = 0) {
      return applyCombo(this, bubble, x, y, index)
    },

    bombMode(x, y) {
      return spawnBomb(this, x, y)
    },

    onFieldMouseMove(e) {
      const rect = this.$refs.gameField ? this.$refs.gameField.getBoundingClientRect() : null

      this.laserClientX = e.clientX
      this.laserClientY = e.clientY

      if (rect) {
        this.laserX = e.clientX - rect.left
        this.laserY = e.clientY - rect.top
      }

      if (this.modeState.laser.activeLeft > 0) {
        handleLaserMode(this, e)
      }
    },

    // старт + генерация
    startGame() {
      this.stopGame(false)

      this.isRunning = true
      this.score = 0
      this.bubbles = []
      this.nextId = 1
      this.timeLeft = this.maxTime
      this.hitComboMultiplier = 1
      this.missComboMultiplier = 1
      this.comboTextItems = []
      this.bombsCount = 0
      this.successfulHitsCount = 0
      this.bombItems = []
      this.bombExplosionItems = []
      this.activeMode = 'normal'
      this.modeState.laser.activeLeft = 0
      this.modeState.laser.cooldownLeft = 0
      this.modeState.automat.activeLeft = 0
      this.modeState.automat.cooldownLeft = 0

      if (typeof this.onStart === 'function') {
        this.onStart()
      }

      this.$emit('update:score', this.score)

      const safeIntensity = this.intensity > 0 ? this.intensity : 1
      const intervalMs = 1000 / safeIntensity
      this.spawnTimerId = setInterval(() => {
        this.createBubble()
      }, intervalMs)

      this.finishTimerId = setInterval(() => {
        this.timeLeft -= 1
        if (this.timeLeft <= 0) {
          this.stopGame(true)
        }
      }, 1000)
    },

    // стоп игры + таймера
    stopGame(isAuto) {
      if (this.spawnTimerId) {
        clearInterval(this.spawnTimerId)
        this.spawnTimerId = null
      }

      if (this.finishTimerId) {
        clearInterval(this.finishTimerId)
        this.finishTimerId = null
      }

      if (this.isRunning) {
        this.$emit('finish', { score: this.score, isAuto })
      }

      this.isRunning = false
    },

    getRadSize(size) {
      return BUBBLE_RULES.rad[size] || BUBBLE_RULES.rad.medium
    },

    //редко - чаше - никогда
    getRrmSize() {
      const roll = Math.random()
      if (roll < 0.15) {
        return 'big'
      }
      if (roll < 0.75) {
        return 'medium'
      }
      return 'small'
    },

    getFallDelta(bubble) {
      if (bubble.color !== this.targetColor) {
        return 0
      }
      return BUBBLE_RULES.fall[bubble.size] || 0
    },

    getFieldSize() {
      const fieldWidth = this.$refs.gameField ? this.$refs.gameField.clientWidth : 640
      const fieldHeight = this.$refs.gameField ? this.$refs.gameField.clientHeight : 480
      return {
        fieldWidth,
        fieldHeight
      }
    },

    fitPos(bubble, fieldWidth, fieldHeight) {
      const maxX = Math.max(0, fieldWidth - bubble.r * 2)
      const maxY = Math.max(0, fieldHeight - bubble.r * 2)
      return {
        ...bubble,
        x: Math.min(Math.max(0, bubble.x), maxX),
        y: Math.min(Math.max(0, bubble.y), maxY)
      }
    },

    // пузырь
    makeBubble(params = {}) {
      const { fieldWidth } = this.getFieldSize()
      const limit = Math.max(1, Math.min(this.colorsCount, GAME_COLORS.length))
      const colors = GAME_COLORS.slice(0, limit)
      const size = params.size || this.getRrmSize()
      const r = this.getRadSize(size)
      const maxX = Math.max(0, fieldWidth - r * 2)
      const x = typeof params.x === 'number'
        ? Math.min(Math.max(0, params.x), maxX)
        : Math.floor(Math.random() * (maxX + 1))
      const y = typeof params.y === 'number' ? params.y : 0
      const color = params.color || colors[Math.floor(Math.random() * colors.length)]

      const bubble = {
        id: this.nextId,
        color,
        x,
        y,
        r,
        size,
        impX: typeof params.impX === 'number' ? params.impX : 0,
        impY: typeof params.impY === 'number' ? params.impY : 0,
        vx: typeof params.vx === 'number' ? params.vx : Math.random() * 0.7 - 0.35 //при создании +-дрейф ... связь с nextX
      }

      this.nextId += 1
      return bubble
    },

    // пузырь в рандом месте
    createBubble() {
      if (!this.isRunning) {
        return
      }

      // новая позиция пузыря
      const { fieldWidth } = this.getFieldSize()
      const size = this.getRrmSize()
      const r = this.getRadSize(size)
      const maxX = Math.max(0, fieldWidth - r * 2)
      let x = Math.floor(Math.random() * (maxX + 1))

      // Спавн рядом для теста
      if (this.bubbles.length && Math.random() < 0.65) {
        const anchor = this.bubbles[Math.floor(Math.random() * this.bubbles.length)]
        const spread = Math.max(8, Math.floor(anchor.r * 0.5))
        const nearX = anchor.x + Math.floor(Math.random() * (spread * 2 + 1)) - spread
        x = Math.min(Math.max(0, nearX), maxX)
      }

      const bubble = this.makeBubble({ //перенос в отдельный блок
        x,
        y: 0,
        size
      })
      this.bubbles = [...this.bubbles, bubble]
    },

    // дети пузыриков
    createChildBubbles(parentBubble, count, childSize) {
      const { fieldWidth, fieldHeight } = this.getFieldSize()
      const colorLimit = Math.max(1, Math.min(this.colorsCount, GAME_COLORS.length))
      const colors = GAME_COLORS.slice(0, colorLimit)
      const childR = this.getRadSize(childSize)
      const centerX = parentBubble.x + parentBubble.r
      const centerY = parentBubble.y + parentBubble.r
      const ringR = parentBubble.r + childR + 10

      const otherColors = colors.filter((color) => color !== parentBubble.color)
      const addColors = otherColors
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.max(0, count - 1))
      const colorList = [parentBubble.color, ...addColors]

      while (colorList.length < count) {
        colorList.push(colors[Math.floor(Math.random() * colors.length)])
      }

      return Array.from({ length: count }).map((_, index) => {
        const angle = (Math.PI * 2 * index) / count
        const x = centerX + Math.cos(angle) * ringR
        const y = centerY + Math.sin(angle) * ringR
        const bubble = this.makeBubble({
          size: childSize,
          color: colorList[index],
          x: x - childR,
          y: y - childR,
          vx: Math.cos(angle) * 0.8
        })
        return this.fitPos(bubble, fieldWidth, fieldHeight)
      })
    },

    // отталкивание от собратьев
    PopImpulse(poppedBubble, sourceBubbles) {
      const { fieldWidth, fieldHeight } = this.getFieldSize()
      const centerX = poppedBubble.x + poppedBubble.r
      const centerY = poppedBubble.y + poppedBubble.r
      const nearR = poppedBubble.r * 4

      return sourceBubbles.map((bubble) => {
        const bubbleX = bubble.x + bubble.r
        const bubbleY = bubble.y + bubble.r
        const dx = bubbleX - centerX
        const dy = bubbleY - centerY
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (!distance || distance > nearR) {
          return bubble
        }

        const poppedSize = poppedBubble.size || 'medium'
        const bubbleSize = bubble.size || 'medium'
        const force = (BUBBLE_RULES.push[poppedSize] && BUBBLE_RULES.push[poppedSize][bubbleSize]) || 0
        if (!force) {
          return bubble
        }

        const shift = poppedBubble.r * force
        const nx = dx / distance
        const ny = dy / distance
        const moved = {
          ...bubble,
          impX: (bubble.impX || 0) + nx * shift * 0.22,
          impY: (bubble.impY || 0) + ny * shift * 0.22
        }
        return this.fitPos(moved, fieldWidth, fieldHeight)
      })
    },
    tick() { // скорость пока тут
      if (this.isRunning) {
        if (this.modeState.laser.activeLeft > 0 && this.laserClientX && this.laserClientY) {
          handleLaserMode(this, {
            clientX: this.laserClientX,
            clientY: this.laserClientY
          })
        }

        const { fieldWidth, fieldHeight } = this.getFieldSize()

        const movedBubbles = this.bubbles
          .map((bubble) => {
            const speedY = Math.random() * 0.8 + 0.4
            let vx = typeof bubble.vx === 'number' ? bubble.vx : Math.random() * 2 - 1
            const maxX = Math.max(0, fieldWidth - bubble.r * 2)
            let nextX = bubble.x + vx + (bubble.impX || 0)
            const nextY = bubble.y + speedY + (bubble.impY || 0)

            // рикошет от левой/правой стены
            if (nextX <= 0) {
              nextX = 0
              vx = Math.abs(vx)
            } else if (nextX >= maxX) {
              nextX = maxX
              vx = -Math.abs(vx)
            }

            return {
              ...bubble,
              x: nextX,
              y: nextY,
              impX: (bubble.impX || 0) * 0.84,
              impY: (bubble.impY || 0) * 0.84,
              vx
            }
          })

        const aliveBubbles = movedBubbles.filter((bubble) => bubble.y <= fieldHeight)
        const droppedBubbles = movedBubbles.filter((bubble) => bubble.y > fieldHeight)
        const dropDelta = droppedBubbles.reduce((acc, bubble) => acc + this.getFallDelta(bubble), 0)

        this.bubbles = aliveBubbles

        // штраф
        if (dropDelta !== 0) {
          this.score += dropDelta
          const list = this.$store.getters['list/getList']
          const newList = [...list, { t: dropDelta }]
          this.setList(newList)
          this.$emit('update:score', this.score)
        }
      }

      this.rafId = requestAnimationFrame(() => this.tick())
    },

    handleFieldClick(e) {
      const x = e.clientX
      const y = e.clientY
      const rect = this.$refs.gameField ? this.$refs.gameField.getBoundingClientRect() : null
      const localX = rect ? x - rect.left : x
      const localY = rect ? y - rect.top : y

      if (this.activeMode === 'bomb' && this.bombsCount > 0) {
        this.bombsCount -= 1
        this.bombMode(localX, localY)
        this.activeMode = 'normal'
        return
      }

      const elements = document.elementsFromPoint(x, y)

      const ids = []
      // см.докс
      elements.forEach((element) => {
        const id = element.dataset ? element.dataset.id : null
        if (id && !ids.includes(id)) {
          ids.push(id)
        }
      })

      const deltas = []
      let nextScore = this.score
      let nextBubbles = [...this.bubbles]
      const prevBombStep = Math.floor(this.successfulHitsCount / GAME_MODE_RULES.bomb.hitsStep)
      let nextHitsCount = this.successfulHitsCount

      // для каждого найти пузырь считать клик, копим и делитим иначе выход
      ids.forEach((id, index) => {
        const numericId = Number(id)
        const bubble = nextBubbles.find((item) => item.id === numericId)
        if (!bubble) {
          return
        }

        if (bubble.color === this.targetColor) {
          nextHitsCount += 1
        }

        const delta = this.comboMode(bubble, localX, localY, index)
        deltas.push(delta)
        nextScore += delta

        if (bubble.size === 'big') {
          const childBubbles = this.createChildBubbles(bubble, 3, 'medium')
          nextBubbles = [...nextBubbles, ...childBubbles]
        } else if (bubble.size === 'medium') {
          const childBubbles = this.createChildBubbles(bubble, 5, 'small')
          nextBubbles = [...nextBubbles, ...childBubbles]
        }

        nextBubbles = nextBubbles.filter((item) => item.id !== numericId)
        nextBubbles = this.PopImpulse(bubble, nextBubbles)
      })

      if (!deltas.length) {
        return
      }

      this.score = nextScore
      this.bubbles = nextBubbles
      this.successfulHitsCount = nextHitsCount

      const nextBombStep = Math.floor(this.successfulHitsCount / GAME_MODE_RULES.bomb.hitsStep)
      if (nextBombStep > prevBombStep) {
        this.bombsCount += nextBombStep - prevBombStep
      }

      const list = this.$store.getters['list/getList']
      const newList = [...list, ...deltas.map((d) => ({ t: d }))]
      this.setList(newList)

      this.$emit('update:score', this.score)
    }
  },

  mounted() { // см.стаковерфлоу
    this.rafId = requestAnimationFrame(() => this.tick())
    this.startGame()
    this.startModeTick()
    window.addEventListener('keydown', this.onKeyDown)
  },

  beforeUnmount() { // стоп анимка -- стоп спавн
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }

    if (this.spawnTimerId) {
      clearInterval(this.spawnTimerId)
      this.spawnTimerId = null
    }

    if (this.finishTimerId) {
      clearInterval(this.finishTimerId)
      this.finishTimerId = null
    }

    if (this.autoShotTimerId) {
      clearInterval(this.autoShotTimerId)
      this.autoShotTimerId = null
    }

    if (this.modeTickTimerId) {
      clearInterval(this.modeTickTimerId)
      this.modeTickTimerId = null
    }

    window.removeEventListener('keydown', this.onKeyDown)
  }
}
</script>

<style lang="scss">
.c-game {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  &__start {
    width: fit-content;
  }

  &__field {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  &__laserCursor {
    position: absolute;
    z-index: 8;
    width: 16px;
    height: 16px;
    border: 1px solid rgba(255, 80, 80, 0.95);
    border-radius: 50%;
    pointer-events: none;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 10px rgba(255, 80, 80, 0.45); //светяшка
    background:
      linear-gradient(rgba(255, 80, 80, 0.95), rgba(255, 80, 80, 0.95)) center / 1px 100% no-repeat,
      linear-gradient(90deg, rgba(255, 80, 80, 0.95), rgba(255, 80, 80, 0.95)) center / 100% 1px no-repeat;
  }

  &__mark {
    position: absolute;
    z-index: 7;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    pointer-events: none;
    transform: translate(-50%, -50%);
    background: rgba(255, 210, 60, 0.95);
    box-shadow: 0 0 10px rgba(255, 210, 60, 0.65); //светяшка
    opacity: 1;
    transition: all 0.35s ease;

    &--hide {
      opacity: 0;
      transform: translate(-50%, -50%) scale(1.8);
    }
  }

  &__bomb {
    position: absolute;
    z-index: 9;
    width: 44px;
    height: 44px;
    pointer-events: none;
    transform: translate(-50%, -50%);
    transition: all 0.35s ease;

    &--grow {
      width: 72px;
      height: 72px;
    }
  }

  &__bombImage {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &__bombExplosion {
    position: absolute;
    z-index: 31;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    transform: translate(-50%, -50%);
  }

  &__bombExplosionImage {
    display: block;
    width: 50%;
    height: 50%;
    object-fit: contain;
  }

  &__comboText {
    position: absolute;
    z-index: 9;
    pointer-events: none;
    transform: translate(-50%, -50%) rotate(-8deg);
    font-weight: 700;
    white-space: nowrap;
    animation: c-game-combo-fade 0.9s ease forwards;

    &--hit {
      color: #7fe36a;
    }

    &--miss {
      color: #ff6b6b;
    }
  }

  &__comboBox {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 40px;
    padding: 8px 12px;
    border-radius: 999px;
    border: 1px solid #d9d9d9;

    &--hit {
      background: rgba(84, 180, 84, 0.24);
    }

    &--miss {
      background: rgba(190, 70, 70, 0.24);
    }
  }

  &__comboBoxLabel {
    line-height: 1;
  }

  &__comboBoxValue {
    line-height: 1;
    font-weight: 700;
  }

  &__modes {
    position: absolute;
    left: 16px;
    bottom: 16px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__modeBtn {
    position: relative;
    min-width: 148px;
    padding: 10px 14px;
    border: 1px solid #d9d9d9;
    border-radius: 12px;
    cursor: pointer;
    background: rgba(0, 0, 0, 0.55);
    color: #ffffff;
    text-align: left;
    overflow: hidden;

    &--active {
      border-color: #ffd24c;
      background: rgba(255, 210, 76, 0.2);
    }

    &--disabled {
      border-color: #ff6b6b;
      cursor: not-allowed;
      background: rgba(255, 60, 60, 0.22);
      color: #ffd1d1;
    }
  }

  &__modeBtnText {
    display: inline-block;
    padding-right: 28px;
  }

  &__modeBtnCount {
    position: absolute;
    top: 50%;
    right: 12px;
    transform: translateY(-50%);
    font-weight: 700;
  }

  &__modeBtnTime {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(20, 20, 20, 0.48);
    color: #ffffff;
    font-weight: 700;
    pointer-events: none;
  }

  &__modeBtn--disabled &__modeBtnTime {
    background: rgba(120, 0, 0, 0.48);
  }

  &__topbar {
    position: absolute;
    top: 16px;
    left: 16px;
    right: 16px;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__targetWrap {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    position: absolute;
    left: 0;
  }

  &__target {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 40px;
    padding: 8px 12px;
    border-radius: 999px;
    border: 1px solid #d9d9d9;
    background: rgba(0, 0, 0, 0.35);
  }

  &__score {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 40px;
    padding: 8px 12px;
    border-radius: 999px;
    border: 1px solid #d9d9d9;
    background: rgba(0, 0, 0, 0.35);
  }

  &__scoreText {
    line-height: 1;
  }

  &__scoreValue {
    line-height: 1;
    font-weight: 700;
  }

  &__targetText {
    line-height: 1;
  }

  &__targetColor {
    width: 64px;
    height: 20px;
    border-radius: 999px;
    border: 1px solid rgba(0, 0, 0, 0.2);
  }

  &__timer {
    min-height: 40px;
    padding: 8px 18px;
    border-radius: 999px;
    border: 1px solid #d9d9d9;
    line-height: 1;
    font-weight: 700;
    background: rgba(0, 0, 0, 0.35);
  }

  &__stop {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 40px;
    padding: 8px 14px;
    border-radius: 999px;
    border: 1px solid #d9d9d9;
    cursor: pointer;
    user-select: none;
    background: rgba(0, 0, 0, 0.35);
    position: absolute;
    right: 0;
  }

  &__stopIcon {
    line-height: 1;
  }

  &__stopText {
    line-height: 1;
  }
}

@keyframes c-game-combo-fade {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(-8deg) scale(0.8);
  }

  20% {
    opacity: 1;
    transform: translate(-50%, -60%) rotate(-8deg) scale(1);
  }

  100% {
    opacity: 0;
    transform: translate(-50%, -90%) rotate(-8deg) scale(1.05);
  }
}
</style>
