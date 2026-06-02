<template>
  <section class="bubble-game">
    <div ref="gameField" class="bubble-game__field" @click="checkBubbleClick">
      <div
        v-for="item in bubbleList"
        :key="item.id"
        class="bubble-game__bubble"
        :class="`bubble-game__bubble--${item.sizeType}`"
        :style="getBubbleStyles(item)"
      ></div>
    </div>
  </section>
</template>

<script>
const typeSize = { big: 110, medium: 70, small: 40 }

const wrongClickPenalty = { big: -5, medium: -3, small: -1 }
const targetFallPenalty = { big: -10, medium: -6, small: -3 }

const pushFactor = {
  big: { big: 1, medium: 1.5, small: 2 },
  medium: { big: 0.5, medium: 1, small: 1.5 },
  small: { big: 0.25, medium: 0.5, small: 1 }
}

export default {
  name: 'BubbleGame',
  props: {
    colorsCount: { type: Number, default: 7 },
    targetColor: { type: String, default: 'red' },
    spawnRate: { type: Number, default: 1 },
    hitPoints: { type: Number, default: 1 },
    missPoints: { type: Number, default: -5 },
    gameTime: { type: Number, default: 60 },
    onStart: { type: Function, default: null }
  },
  emits: ['score', 'finish', 'time'],
  data() {
    return {
      bubbleList: [],
      currentScore: 0,
      gameActive: false,
      isPaused: false,
      bubbleId: 1,
      createInterval: null,
      moveInterval: null,
      timerInterval: null,
      timeLeft: 60,
      fieldWidth: 900,
      fieldHeight: 500,
      colorList: ['blue', 'green', 'orange', 'pink', 'purple', 'red', 'yellow']
    }
  },
  methods: {
    runGame() {
      this.stopGame()
      this.bubbleList = []
      this.currentScore = 0
      this.gameActive = true
      this.isPaused = false
      this.timeLeft = this.gameTime

      if (this.onStart) this.onStart()

      this.$emit('score', this.currentScore)
      this.$emit('time', this.timeLeft)

      this.setFieldSize()
      this.startTimers()
    },

    restartGame() {
      this.runGame()
    },

    startTimers() {
      const intervalTime = 1000 / this.spawnRate

      this.createInterval = setInterval(() => this.addBubble(), intervalTime)
      this.moveInterval = setInterval(() => this.updateBubblePositions(), 30)
      this.timerInterval = setInterval(() => {
        this.timeLeft -= 1
        this.$emit('time', this.timeLeft)
        if (this.timeLeft <= 0) this.endGame()
      }, 1000)
    },

    pauseGame() {
      if (!this.gameActive || this.isPaused) return
      this.isPaused = true
      this.clearTimers()
    },

    resumeGame() {
      if (!this.gameActive || !this.isPaused) return
      this.isPaused = false
      this.startTimers()
    },

    endGame() {
      this.clearTimers()
      this.gameActive = false
      this.isPaused = false
      this.$emit('finish', this.currentScore)
    },

    stopGame() {
      this.clearTimers()
      this.gameActive = false
      this.isPaused = false
    },

    clearTimers() {
      clearInterval(this.createInterval)
      clearInterval(this.moveInterval)
      clearInterval(this.timerInterval)
      this.createInterval = null
      this.moveInterval = null
      this.timerInterval = null
    },

    setFieldSize() {
      if (!this.$refs.gameField) return
      this.fieldWidth = this.$refs.gameField.clientWidth
      this.fieldHeight = this.$refs.gameField.clientHeight
    },

    getTypeSize(sizeType) {
      return typeSize[sizeType] || typeSize.medium
    },

    getTypeRadius(sizeType) {
      return this.getTypeSize(sizeType) / 2
    },

    getRandomSizeType() {
      const r = Math.random()
      if (r < 0.2) return 'big'
      if (r < 0.8) return 'medium'
      return 'small'
    },

    createBubble({ x, y, sizeType, color }) {
      const size = this.getTypeSize(sizeType)
      return {
        id: this.bubbleId++,
        x,
        y,
        sizeType,
        size,
        color,
        speedY: this.randomFloat(1, 3),
        speedX: this.randomFloat(-1.5, 1.5),
        moveStep: this.randomInt(20, 60)
      }
    },

    addBubble() {
      const availableColors = this.colorList.slice(0, this.colorsCount)
      const sizeType = this.getRandomSizeType()
      const size = this.getTypeSize(sizeType)
      const x = this.randomInt(0, Math.max(0, this.fieldWidth - size))
      const y = -size
      const color = availableColors[this.randomInt(0, availableColors.length - 1)]
      this.bubbleList.push(this.createBubble({ x, y, sizeType, color }))
    },

    updateBubblePositions() {
      this.bubbleList.forEach((item) => {
        item.y += item.speedY
        item.x += item.speedX
        item.moveStep -= 1

        if (item.moveStep <= 0) {
          item.speedX = this.randomFloat(-1.5, 1.5)
          item.moveStep = this.randomInt(20, 60)
        }

        if (item.x <= 0 || item.x + item.size >= this.fieldWidth) {
          item.speedX *= -1
        }
      })

      let sum = 0
      const still = []

      this.bubbleList.forEach((item) => {
        if (item.y <= this.fieldHeight + item.size) {
          still.push(item)
          return
        }
        if (item.color === this.targetColor) {
          sum += targetFallPenalty[item.sizeType] ?? 0
        }
      })

      this.bubbleList = still

      if (sum !== 0) {
        this.currentScore += sum
        this.$emit('score', this.currentScore)
      }
    },

    getBubbleCenter(item) {
      return { x: item.x + item.size / 2, y: item.y + item.size / 2 }
    },

    clampBubbleToField(item) {
      if (item.x < 0) item.x = 0
      if (item.y < 0) item.y = 0
      if (item.x + item.size > this.fieldWidth) item.x = this.fieldWidth - item.size
      if (item.y + item.size > this.fieldHeight) item.y = this.fieldHeight - item.size
    },

    pickColors(count, availableColors, requiredColor) {
      const chosen = []
      if (requiredColor) chosen.push(requiredColor)

      const pool = availableColors.filter((c) => !chosen.includes(c))
      while (chosen.length < count && pool.length > 0) {
        const idx = this.randomInt(0, pool.length - 1)
        chosen.push(pool[idx])
        pool.splice(idx, 1)
      }

      while (chosen.length < count) {
        chosen.push(requiredColor || availableColors[0])
      }

      for (let i = chosen.length - 1; i > 0; i--) {
        const j = this.randomInt(0, i)
        const t = chosen[i]
        chosen[i] = chosen[j]
        chosen[j] = t
      }

      return chosen
    },

    spawnChildren(parent) {
      if (parent.sizeType === 'big') {
        this.spawnAround(parent, 3, 'medium')
      } else if (parent.sizeType === 'medium') {
        this.spawnAround(parent, 5, 'small')
      }
    },

    spawnAround(parent, count, childType) {
      const availableColors = this.colorList.slice(0, this.colorsCount)
      const colors = this.pickColors(count, availableColors, parent.color)

      const parentCenter = this.getBubbleCenter(parent)
      const childSize = this.getTypeSize(childType)
      const r = parent.size / 2 + childSize / 2 + 10

      for (let i = 0; i < count; i++) {
        const angle = (2 * Math.PI * i) / count
        const cx = parentCenter.x + r * Math.cos(angle)
        const cy = parentCenter.y + r * Math.sin(angle)

        const x = cx - childSize / 2
        const y = cy - childSize / 2

        const child = this.createBubble({ x, y, sizeType: childType, color: colors[i] })
        this.clampBubbleToField(child)
        this.bubbleList.push(child)
      }
    },

    applyPushEffect(source) {
      const src = this.getBubbleCenter(source)
      const influence = source.size * 2.5

      this.bubbleList.forEach((item) => {
        if (item.id === source.id) return

        const c = this.getBubbleCenter(item)
        const dx = c.x - src.x
        const dy = c.y - src.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > influence) return

        let vx = item.speedX
        let vy = item.speedY
        let len = Math.sqrt(vx * vx + vy * vy)

        if (len < 0.01) {
          vx = dx
          vy = dy
          len = Math.sqrt(vx * vx + vy * vy) || 1
        }

        vx /= len
        vy /= len

        const f = (pushFactor[source.sizeType] && pushFactor[source.sizeType][item.sizeType]) || 0
        const push = f * this.getTypeRadius(item.sizeType)

        item.x += vx * push
        item.y += vy * push
        this.clampBubbleToField(item)
      })
    },

    checkBubbleClick(event) {
      if (!this.gameActive || this.isPaused || !this.$refs.gameField) return

      const rect = this.$refs.gameField.getBoundingClientRect()
      const clickX = event.clientX - rect.left
      const clickY = event.clientY - rect.top

      const touched = this.bubbleList.filter((item) => {
        const center = this.getBubbleCenter(item)
        const radius = item.size / 2
        const dx = clickX - center.x
        const dy = clickY - center.y
        return Math.sqrt(dx * dx + dy * dy) <= radius
      })

      if (touched.length === 0) return

      const touchedIds = touched.map((b) => b.id)

      touched.forEach((bubble) => {
        this.applyPushEffect(bubble)

        if (bubble.color === this.targetColor) {
          this.currentScore += this.hitPoints
        } else {
          this.currentScore += wrongClickPenalty[bubble.sizeType] ?? -5
        }

        this.spawnChildren(bubble)
      })

      this.bubbleList = this.bubbleList.filter((item) => !touchedIds.includes(item.id))
      this.$emit('score', this.currentScore)
    },

    getBubbleStyles(item) {
      return {
        width: item.size + 'px',
        height: item.size + 'px',
        left: item.x + 'px',
        top: item.y + 'px',
        backgroundColor: item.color
      }
    },

    randomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min
    },

    randomFloat(min, max) {
      return Math.random() * (max - min) + min
    }
  },
  mounted() {
    this.timeLeft = this.gameTime
    this.$emit('time', this.timeLeft)
    this.setFieldSize()
    window.addEventListener('resize', this.setFieldSize)
  },
  beforeUnmount() {
    this.stopGame()
    window.removeEventListener('resize', this.setFieldSize)
  }
}
</script>

<style scoped lang="scss">
.bubble-game {
  width: 100%;
  height: 100%;

  &__field {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: linear-gradient(to bottom, #dff1ff, #ffffff);
    user-select: none;
  }

  &__bubble {
    position: absolute;
    border-radius: 50%;
    opacity: 0.85;
    box-shadow:
      inset -8px -8px 14px rgba(255, 255, 255, 0.35),
      inset 8px 8px 14px rgba(0, 0, 0, 0.08);
  }

  &__bubble--big {
    opacity: 0.82;
  }

  &__bubble--medium {
    opacity: 0.85;
  }

  &__bubble--small {
    opacity: 0.9;
  }
}
</style>