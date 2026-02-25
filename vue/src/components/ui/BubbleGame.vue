<template>
  <div class="game-area" @click="(e) => onAreaClick(e)">
    <div
      v-for="bubble in bubbles"
      :key="bubble.id"
      class="bubble"
      :style="bubbleStyle(bubble)"
    />
  </div>
</template>

<script>
export default {
  name: 'BubbleGame',

  props: {
    colorsCount: { type: Number, required: true },
    targetColor: { type: Number, required: true },
    intensity: { type: Number, required: true },
    scoreHit: { type: Number, default: 1 },
    scoreMiss: { type: Number, default: -5 },
    startGame: { required: true },
    bubbleSize: { type: Number, default: 60 },
    duration: { type: Number, default: 30 }
  },

  emits: ['finish', 'score'],

  data() {
    return {
      bubbles: [],
      score: 0,
      running: false,
      spawnTimer: null,
      lastSpawn: 0,
      startTime: 0,
      animationFrame: null
    }
  },

  mounted() {
    this.startGame(() => this.run())
  },

  beforeUnmount() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
    }
    if (this.spawnTimer) {
      clearInterval(this.spawnTimer)
    }
  },

  methods: {
    run() {
      this.running = true
      this.score = 0
      this.bubbles = []
      this.lastSpawn = performance.now()
      this.startTime = performance.now()
      
      const interval = 1000 / this.intensity
      this.spawnTimer = setInterval(() => this.addBubble(), interval)
      
      this.animate()
    },

    animate() {
      if (!this.running) return

      const now = performance.now()
      
      if ((now - this.startTime) / 1000 >= this.duration) {
        this.finishGame()
        return
      }

      this.updateBubbles()
      this.animationFrame = requestAnimationFrame(() => this.animate())
    },

    addBubble() {
      if (!this.running) return
      
      const colorIndex = Math.floor(Math.random() * this.colorsCount)
      const angle = (Math.random() - 0.5) * Math.PI / 4

      this.bubbles.push({
        id: crypto.randomUUID(),
        x: Math.random() * 90 + 5,
        y: -10,
        dx: Math.sin(angle) * 0.15,
        dy: 0.2 + Math.random() * 0.3,
        color: colorIndex
      })
    },

    updateBubbles() {
      this.bubbles.forEach(b => {
        b.x += b.dx
        b.y += b.dy
        b.dx += (Math.random() - 0.5) * 0.01
        
        if (b.x < 0 || b.x > 100) {
          b.dx *= -0.8
        }
        b.x = Math.max(0, Math.min(100, b.x))
      })

      this.bubbles = this.bubbles.filter(b => b.y < 110)
    },

    popBubble(bubble) {
      const hit = bubble.color === this.targetColor
      this.score += hit ? this.scoreHit : this.scoreMiss
      this.$emit('score', this.score)
      
      this.bubbles = this.bubbles.filter(b => b.id !== bubble.id)
    },

    onAreaClick(e) {
      const rect = this.$el.getBoundingClientRect()
      const clickX = e.clientX
      const clickY = e.clientY

      const hitBubbles = this.bubbles.filter(b => {
        const bubbleX = rect.left + (b.x / 100) * rect.width
        const bubbleY = rect.top + (b.y / 100) * rect.height
        const radius = this.bubbleSize / 2
        
        const distance = Math.hypot(bubbleX - clickX, bubbleY - clickY)
        return distance <= radius
      })

      if (hitBubbles.length === 0) {
        this.score += this.scoreMiss
        this.$emit('score', this.score)
        return
      }

      hitBubbles.forEach(bubble => {
        const hit = bubble.color === this.targetColor
        this.score += hit ? this.scoreHit : this.scoreMiss
        this.bubbles = this.bubbles.filter(b => b.id !== bubble.id)
      })
      
      this.$emit('score', this.score)
    },

    finishGame() {
      this.running = false
      if (this.spawnTimer) {
        clearInterval(this.spawnTimer)
      }
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame)
      }
      this.$emit('finish', this.score)
    },

    bubbleStyle(bubble) {
      return {
        left: bubble.x + '%',
        top: bubble.y + '%',
        width: this.bubbleSize + 'px',
        height: this.bubbleSize + 'px',
        backgroundColor: this.colorByIndex(bubble.color),
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none'
      }
    },

    colorByIndex(index) {
      const palette = ['#ff4444', '#4444ff', '#44ff44', '#ff8844', '#9944ff', '#44ffff']
      return palette[index % palette.length]
    }
  }
}
</script>

<style scoped lang="scss">
.game-area {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #979ccc;
  overflow: hidden;
  cursor: crosshair;
}

.bubble {
  position: absolute;
  border-radius: 50%;
  opacity: 0.9;
  box-shadow: 0 2px 4px rgba(255, 255, 255, 0.2);
  transition: transform 0.1s;
  pointer-events: none;

  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 1;
  }
}
</style>