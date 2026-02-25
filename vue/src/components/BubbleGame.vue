<template>
  <div class="c-game">
    <slot name="start">
      <button type="button" class="c-game__start" @click="() => startGame()">
        <slot name="start-label"></slot>
      </button>
    </slot>

    <div ref="gameField" class="c-game__field">
      <button
        v-for="bubble in bubbles"
        :key="bubble.id"
        type="button"
        class="c-game__bubble"
        :class="'c-game__bubble--' + bubble.color"
        :style="{ left: bubble.x + 'px', top: bubble.y + 'px', width: bubble.r * 2 + 'px', height: bubble.r * 2 + 'px' }"
        @click="() => handleBubbleClick(bubble)"
      ></button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BubbleGame',

  props: {
    // цвета участвующие в генерации пузырей см.список
    colorsCount: {
      type: Number,
      default: 3
    },
    // цветт - попал - паравильно
    targetColor: {
      type: String,
      default: 'red'
    },
    // пузырей в секунду мб писать дробной
    intensity: {
      type: Number,
      default: 1
    },
    // очки по целевыому цвету
    scoreHit: {
      type: Number,
      default: 1
    },
    // промах по целевому цвету
    scoreMiss: {
      type: Number,
      default: -5
    },
    // вне колбэк при старте
    onStart: {
      type: Function,
      default: null
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
      rafId: null
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

      if (typeof this.onStart === 'function') {
        this.onStart()
      }

      this.$emit('update:score', this.score)

      const safeIntensity = this.intensity > 0 ? this.intensity : 1
      const intervalMs = 1000 / safeIntensity
      this.spawnTimerId = setInterval(() => {
        this.createBubble()
      }, intervalMs)
    },

    // стоп игры + таймера
    stopGame(emitFinish = true) {
      if (this.spawnTimerId) {
        clearInterval(this.spawnTimerId)
        this.spawnTimerId = null
      }

      if (this.isRunning && emitFinish) {
        this.$emit('finish', this.score)
      }

      this.isRunning = false
    },

    // пузырь в рандом месте
    createBubble() {
      if (!this.isRunning) {
        return
      }

      const baseColors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple']
      const limit = Math.max(1, Math.min(this.colorsCount, baseColors.length))
      const colors = baseColors.slice(0, limit)
      const color = colors[Math.floor(Math.random() * colors.length)]

      const r = Math.floor(Math.random() * 26) + 20
      const fieldWidth = this.$refs.gameField ? this.$refs.gameField.clientWidth : 640
      const maxX = Math.max(0, fieldWidth - r * 2)
      const x = Math.floor(Math.random() * (maxX + 1))
      const y = 0

      const bubble = {
        id: this.nextId,
        color,
        x,
        y,
        r,
        vx: Math.random() * 2 - 1 //при создании +-дрейф ... связь с nextX
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
            const speedY = Math.floor(Math.random() * 3) + 1
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

    // клики по пузырику
    handleBubbleClick(bubble) {
      const delta = bubble.color === this.targetColor ? this.scoreHit : this.scoreMiss
      this.score += delta
      this.$emit('update:score', this.score)
      this.bubbles = this.bubbles.filter((item) => item.id !== bubble.id)

      const list = this.$store.getters['list/getList']
      const newList = [...list, { t: delta }]
      this.$store.dispatch('list/setList', newList)
    }
  },

  mounted() { // см.стаковерфлоу
    this.rafId = requestAnimationFrame(() => this.tick())
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
  }
}
</script>

<style lang="scss">
.c-game {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.c-game__start {
  width: fit-content;
}

.c-game__field {
  position: relative;
  width: 640px; // Пока будет так
  height: 480px; // Сделать авто по экрану(см.стаковерфлоу)
  overflow: hidden;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
}

.c-game__bubble {
  position: absolute;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
}

.c-game__bubble--red {
  background: #ff4d4f;
}

.c-game__bubble--blue {
  background: #4096ff;
}

.c-game__bubble--green {
  background: #73d13d;
}

.c-game__bubble--yellow {
  background: #fadb14;
}

.c-game__bubble--orange {
  background: #fa8c16;
}

.c-game__bubble--purple {
  background: #722ed1;
}
</style>
