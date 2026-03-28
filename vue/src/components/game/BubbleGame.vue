<template>
  <section class="bubble-game">
    <div
      class="bubble-game__field"
      @click="(event) => checkBubbleClick(event, event.currentTarget)"
    >
      <div
        v-for="item in bubbleList"
        :key="item.id"
        class="bubble-game__bubble"
        :style="getBubbleStyles(item)"
      ></div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'BubbleGame',
  props: {
    colorsCount: {
      type: Number,
      default: 7
    },
    targetColor: {
      type: String,
      default: 'red'
    },
    spawnRate: {
      type: Number,
      default: 1
    },
    hitPoints: {
      type: Number,
      default: 1
    },
    missPoints: {
      type: Number,
      default: -5
    },
    gameTime: {
      type: Number,
      default: 60
    },
    onStart: {
      type: Function,
      default: null
    }
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
      if (this.onStart) {
        this.onStart()
      }
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
      this.createInterval = setInterval(() => {
        this.addBubble()
      }, intervalTime)
      this.moveInterval = setInterval(() => {
        this.updateBubblePositions()
      }, 30)
      this.timerInterval = setInterval(() => {
        this.timeLeft -= 1
        this.$emit('time', this.timeLeft)
        if (this.timeLeft <= 0) {
          this.endGame()
        }
      }, 1000)
    },
    pauseGame() {
      if (!this.gameActive || this.isPaused) {
        return
      }
      this.isPaused = true
      this.clearTimers()
    },
    resumeGame() {
      if (!this.gameActive || !this.isPaused) {
        return
      }
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
      const gameField = this.$el?.querySelector('.bubble-game__field')
      if (gameField) {
        this.fieldWidth = gameField.clientWidth
        this.fieldHeight = gameField.clientHeight
      }
    },
    addBubble() {
      const availableColors = this.colorList.slice(0, this.colorsCount)
      const size = this.randomInt(40, 80)
      const newBubble = {
        id: this.bubbleId++,
        x: this.randomInt(0, Math.max(0, this.fieldWidth - size)),
        y: -size,
        size,
        color: availableColors[this.randomInt(0, availableColors.length - 1)],
        speedY: this.randomFloat(1, 3),
        speedX: this.randomFloat(-1.5, 1.5),
        moveStep: this.randomInt(20, 60)
      }
      this.bubbleList.push(newBubble)
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
      this.bubbleList = this.bubbleList.filter((item) => item.y <= this.fieldHeight + item.size)
    },
    checkBubbleClick(event, gameField) {
      if (!this.gameActive || this.isPaused || !gameField) {
        return
      }
      const rect = gameField.getBoundingClientRect()
      const clickX = event.clientX - rect.left
      const clickY = event.clientY - rect.top
      const touchedBubbles = this.bubbleList.filter((item) => {
        const centerX = item.x + item.size / 2
        const centerY = item.y + item.size / 2
        const radius = item.size / 2
        const diffX = clickX - centerX
        const diffY = clickY - centerY
        const distance = Math.sqrt(diffX * diffX + diffY * diffY)
        return distance <= radius
      })
      if (touchedBubbles.length === 0) {
        return
      }
      touchedBubbles.forEach((item) => {
        if (item.color === this.targetColor) {
          this.currentScore += this.hitPoints
        } else {
          this.currentScore += this.missPoints
        }
      })
      const removedIds = touchedBubbles.map((item) => item.id)
      this.bubbleList = this.bubbleList.filter((item) => !removedIds.includes(item.id))
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
    opacity: 0.8;
    box-shadow:
      inset -8px -8px 14px rgba(255, 255, 255, 0.35),
      inset 8px 8px 14px rgba(0, 0, 0, 0.08);
  }
}
</style>