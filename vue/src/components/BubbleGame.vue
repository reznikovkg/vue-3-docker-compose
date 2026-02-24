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
    colorsCount: {
      type: Number,
      default: 3
    },
    targetColor: {
      type: String,
      default: 'red'
    },
    intensity: {
      type: Number,
      default: 1
    },
    scoreHit: {
      type: Number,
      default: 1
    },
    scoreMiss: {
      type: Number,
      default: -5
    },
    onStart: {
      type: Function,
      default: null
    }
  },

  emits: ['finish', 'update:score'],

  data() {
    return {
      isRunning: false,
      score: 0,
      bubbles: [],
      nextId: 1,
      spawnTimerId: null
    }
  },

  methods: {
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
        r
      }

      this.nextId += 1
      this.bubbles = [...this.bubbles, bubble]
    },

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

  beforeUnmount() {
    this.stopGame()
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
  height: 480px;
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
