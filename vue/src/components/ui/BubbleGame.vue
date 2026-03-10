<template>
  <div class="game-area" @click="(e) => onAreaClick(e)">
    <div
      v-for="bubble in bubbles"
      :key="bubble.id"
      class="bubble"
      :style="bubbleStyle(bubble)"
      @click.stop="() => popBubble(bubble)"
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
      this.bubbles.push({
        id: crypto.randomUUID(),
        x: Math.random() * 90 + 5,
        y: -10,
        dx: 0,
        dy: 0.08 + Math.random() * 0.08,
        color: colorIndex,
        size: ['small','medium','large'][Math.floor(Math.random() * 3)]
      })
    },
    updateBubbles() {
      this.bubbles.forEach(b => {
        b.dy += 0.008
        b.x += b.dx
        b.y += b.dy
        b.dx *= 0.99
        b.dy *= 0.99
      })
      this.bubbles = this.bubbles.filter(b => {
        if(b.y >= 110){
          if(b.color === this.targetColor){
            const penalty =
              b.size === 'large' ? -10 :
              b.size === 'medium' ? -6 : -3
            this.score += penalty
            this.$emit('score', this.score)
          }
          return false
        }
        return true
      })
    },
    popBubble(bubble) {
      this.pushNearby(bubble)
      this.spawnChildren(bubble)
      const hit = bubble.color === this.targetColor
      const penalty = bubble.size === 'large' ? -5 : bubble.size === 'medium' ? -3 : -1
      this.score += hit ? this.scoreHit : penalty
      this.$emit('score', this.score)
      this.bubbles = this.bubbles.filter(b => b.id !== bubble.id)
    },
    spawnChildren(bubble){
      const count =
        bubble.size === 'large' ? 3 :
        bubble.size === 'medium' ? 5 : 0
      if(count === 0) return
      const newSize = bubble.size === 'large' ? 'medium' : 'small'
      const parentRadiusPx = this.sizePx(bubble.size) / 2
      const parentRadiusPercent = parentRadiusPx / (this.$el.clientWidth / 100)
      const spawnRadius = parentRadiusPercent * 2
      for(let i = 0; i < count; i++){
        const angle = (Math.PI * 2 / count) * i
        const color =
          i === 0
            ? bubble.color
            : Math.floor(Math.random() * this.colorsCount)
        this.bubbles.push({
          id: crypto.randomUUID(),
          x: bubble.x + Math.cos(angle) * spawnRadius,
          y: bubble.y + Math.sin(angle) * spawnRadius,
          dx: Math.cos(angle) * 0.05,
          dy: 0.15 + Math.random() * 0.05,
          color,
          size: newSize
        })
      }
    },
    pushNearby(bubble){
      const radiusMap = {
        large: { large: 1, medium: 1.5, small: 2 },
        medium: { large: 0.5, medium: 1, small: 1.5 },
        small: { large: 0.25, medium: 0.5, small: 1 }
      }
      const parentRadiusPx = this.sizePx(bubble.size) / 2
      const parentRadiusPercent = parentRadiusPx / (this.$el.clientWidth / 100)
      const effectRadius = parentRadiusPercent * 4
      this.bubbles.forEach(b => {
        if(b.id === bubble.id) return
        const dx = b.x - bubble.x
        const dy = b.y - bubble.y
        const dist = Math.hypot(dx, dy)
        if(dist > effectRadius || dist === 0) return
        const multiplier = radiusMap[bubble.size][b.size]
        const pushDistance = parentRadiusPercent * multiplier
        const angle = Math.atan2(dy, dx)
        const pushX = Math.cos(angle) * pushDistance
        const pushY = Math.sin(angle) * pushDistance
        b.x += pushX
        b.y += pushY
        b.dx += pushX * 0.03
        b.dy += pushY * 0.03
      })
    },
    onAreaClick(e) {
      const rect = this.$el.getBoundingClientRect()
      const clickX = e.clientX
      const clickY = e.clientY
      const hitBubbles = this.bubbles.filter(b => {
        const bubbleX = rect.left + (b.x / 100) * rect.width
        const bubbleY = rect.top + (b.y / 100) * rect.height
        const radius = this.sizePx(b.size) / 2
        const distance = Math.hypot(bubbleX - clickX, bubbleY - clickY)
        return distance <= radius
      })
      if (hitBubbles.length === 0) {
        this.score += this.scoreMiss
        this.$emit('score', this.score)
        return
      }
      hitBubbles.forEach(bubble => {
        this.popBubble(bubble)
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
        width: this.sizePx(bubble.size) + 'px',
        height: this.sizePx(bubble.size) + 'px',
        backgroundColor: this.colorByIndex(bubble.color),
        transform: 'translate(-50%, -50%)'
      }
    },
    sizePx(size){
      if(size === 'large') return this.bubbleSize * 1.4
      if(size === 'small') return this.bubbleSize * 0.6
      return this.bubbleSize
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
  pointer-events: auto;

  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 1;
  }
}
</style>