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

    <div ref="gameField" class="c-game__field" @click="(e) => handleFieldClick(e)">
      <div class="c-game__topbar" @click="(e) => e.stopPropagation()">
        <div class="c-game__targetWrap">
          <div class="c-game__target">
            <span class="c-game__targetText">Собирай:</span>
            <span class="c-game__targetColor" :style="{ background: targetColor }"></span>
          </div>

          <div class="c-game__score">
            <span class="c-game__scoreText">Очки:</span>
            <span class="c-game__scoreValue">{{ score }}</span>
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

      <button
        v-for="bubble in bubbles"
        :key="bubble.id"
        type="button"
        class="c-game__bubble"
        :data-id="bubble.id"
        :class="'c-game__bubble--' + bubble.color"
        :style="{ left: bubble.x + 'px', top: bubble.y + 'px', width: bubble.r * 2 + 'px', height: bubble.r * 2 + 'px', backgroundImage: bubble.imageUrl ? 'url(' + bubble.imageUrl + ')' : 'none' }"
      ></button>
    </div>
  </div>
</template>

<script>
import { BUBBLE_IMAGE_MAP, GAME_COLORS, GAME_DEFAULTS } from '@/constants/gameConfig.js'

export default {
  name: 'BubbleGame',

  // Подумать что с этим сделать тут!!!
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
      rafId: null
    }
  },

  computed: {
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
    // старт + генерация
    startGame() {
      this.stopGame(false)

      this.isRunning = true
      this.score = 0
      this.bubbles = []
      this.nextId = 1
      this.timeLeft = this.maxTime

      if (typeof this.onStart === 'function') {
        this.onStart()
      }

      // ТОЛЬКО ТЕСТ
      //this.createBubble()
      //this.createBubble()
      //this.createBubble()

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

    // пузырь в рандом месте
    createBubble() {
      if (!this.isRunning) {
        return
      }

      const limit = Math.max(1, Math.min(this.colorsCount, GAME_COLORS.length))
      const colors = GAME_COLORS.slice(0, limit)
      const color = colors[Math.floor(Math.random() * colors.length)]
      const images = BUBBLE_IMAGE_MAP[color] || []
      const imageUrl = images.length ? images[Math.floor(Math.random() * images.length)] : null

      const r = Math.floor(Math.random() * 26) + 20
      const fieldWidth = this.$refs.gameField ? this.$refs.gameField.clientWidth : 640
      const maxX = Math.max(0, fieldWidth - r * 2)
      let x = Math.floor(Math.random() * (maxX + 1))

      // Спавн рядом для теста
      if (this.bubbles.length && Math.random() < 0.65) {
        const anchor = this.bubbles[Math.floor(Math.random() * this.bubbles.length)]
        const spread = Math.max(8, Math.floor(anchor.r * 0.5))
        const nearX = anchor.x + Math.floor(Math.random() * (spread * 2 + 1)) - spread
        x = Math.min(Math.max(0, nearX), maxX)
      }

      const bubble = {
        id: this.nextId,
        color,
        imageUrl,
        x,
        y: 0,
        r,
        vx: Math.random() * 0.7 - 0.35 //при создании +-дрейф ... связь с nextX
      }

      this.nextId += 1
      this.bubbles = [...this.bubbles, bubble]
    },

    tick() { // скорость пока тут
      if (this.isRunning) {
        const fieldWidth = this.$refs.gameField ? this.$refs.gameField.clientWidth : 640
        const fieldHeight = this.$refs.gameField ? this.$refs.gameField.clientHeight : 480

        const movedBubbles = this.bubbles
          .map((bubble) => {
            const speedY = Math.random() * 0.8 + 0.4
            const vx = typeof bubble.vx === 'number' ? bubble.vx : Math.random() * 2 - 1
            const maxX = Math.max(0, fieldWidth - bubble.r * 2)
            const nextX = Math.min(Math.max(0, bubble.x + vx), maxX)
            const nextY = bubble.y + speedY

            return {
              ...bubble,
              x: nextX,
              y: nextY,
              vx
            }
          })
          .filter((bubble) => bubble.y <= fieldHeight)

        this.bubbles = movedBubbles
      }

      this.rafId = requestAnimationFrame(() => this.tick())
    },

    handleFieldClick(e) {
      const x = e.clientX
      const y = e.clientY
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

      // для каждого найти пузырь считать клик, копим и делитим иначе выход
      ids.forEach((id) => {
        const numericId = Number(id)
        const bubble = nextBubbles.find((item) => item.id === numericId)
        if (!bubble) {
          return
        }

        const delta = bubble.color === this.targetColor ? this.scoreHit : this.scoreMiss
        deltas.push(delta)
        nextScore += delta
        nextBubbles = nextBubbles.filter((item) => item.id !== numericId)
      })

      if (!deltas.length) {
        return
      }

      this.score = nextScore
      this.bubbles = nextBubbles

      const list = this.$store.getters['list/getList']
      const newList = [...list, ...deltas.map((d) => ({ t: d }))]
      this.$store.dispatch('list/setList', newList)

      this.$emit('update:score', this.score)
    }
  },

  mounted() { // см.стаковерфлоу
    this.rafId = requestAnimationFrame(() => this.tick())
    this.startGame()
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
}

.c-game__start {
  width: fit-content;
}

.c-game__field {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.c-game__topbar {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.c-game__targetWrap {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.c-game__target {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid #d9d9d9;
  background: rgba(0, 0, 0, 0.35);
}

.c-game__score {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid #d9d9d9;
  background: rgba(0, 0, 0, 0.35);
}

.c-game__scoreText {
  line-height: 1;
}

.c-game__scoreValue {
  line-height: 1;
  font-weight: 700;
}

.c-game__targetText {
  line-height: 1;
}

.c-game__targetColor {
  width: 64px;
  height: 20px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.c-game__timer {
  min-height: 40px;
  padding: 8px 18px;
  border-radius: 999px;
  border: 1px solid #d9d9d9;
  line-height: 1;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.35);
}

.c-game__stop {
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
}

.c-game__stopIcon {
  line-height: 1;
}

.c-game__stopText {
  line-height: 1;
}

.c-game__bubble {
  position: absolute;
  border: 0;
  border-radius: 50%;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  cursor: pointer;
}

.c-game__bubble--red {
  background-color: #ff4d4f;
}

.c-game__bubble--blue {
  background-color: #4096ff;
}

.c-game__bubble--green {
  background-color: #73d13d;
}

.c-game__bubble--yellow {
  background-color: #fadb14;
}

.c-game__bubble--orange {
  background-color: #fa8c16;
}

.c-game__bubble--purple {
  background-color: #722ed1;
}
</style>
