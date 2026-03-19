<template>
  <div class="game-area" @click="(e) => onAreaClick(e)">
    <div
      v-for="bubble in bubbles"
      :key="bubble.id"
      class="game-area__bubble"
      :style="bubbleStyle(bubble)"
      @click.stop="() => onBubbleClick(bubble)"
    />
    <div
      v-for="shot in shots"
      :key="shot.id"
      class="game-area__shot"
      :style="{ left: shot.x + '%', top: shot.y + '%' }"
    />
    <div v-if="bombMode" 
     class="game-area__bomb-indicator" 
     :style="{ left: mouseX + '%', top: mouseY + '%', width: '30%', height: '30%' }">
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
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
  emits: ['finish'],
  data() {
    return {
      bubbles: [],
      running: false,
      spawnTimer: null,
      autoTimer: null,
      startTime: 0,
      animationFrame: null,
      mouseX: 0, 
      mouseY: 0 
    }
  },
  computed: {
    ...mapGetters(['mode', 'shots', 'bombMode'])
  },
  mounted() {
    this.startGame(() => this.run())
    window.addEventListener('mousemove', (e) => this.onMouseMove(e))
  },
  beforeUnmount() {
      clearInterval(this.spawnTimer)
      clearInterval(this.autoTimer)
      cancelAnimationFrame(this.animationFrame)
  },
  methods: {
    ...mapActions([
      'hitSuccess',
      'hitFail',
      'fallPenalty',
      'addShot',
      'removeShot',
      'setBombMode'
    ]),
    run() {
      this.running = true
      this.bubbles = []
      this.startTime = performance.now()
      const interval = 1000 / this.intensity
      this.spawnTimer = setInterval(() => this.addBubble(), interval)
      if (this.mode === 'auto') {
        this.autoTimer = setInterval(() => this.autoShoot(), 800)
      }
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
        if (b.y >= 110) {
          if (b.color === this.targetColor) {
            this.fallPenalty(b.size)
          }
          return false
        }
        return true
      })
    },
    explodeBomb(x, y) {
      const radius = 15
      const targets = this.bubbles.filter(b => {
        const dx = b.x - x
        const dy = b.y - y
        return Math.hypot(dx, dy) <= radius
      })
      targets.forEach(b => {
        if (b.size === 'large') {
          this.processHit(b, 7, true) 
        } else {
          this.processHit(b, 0, true) 
        }
      })
    },
     onBubbleClick(bubble) {
      this.processHit(bubble)
    },
    spawnChildrenCustom(bubble, count, size) {
      const parentRadiusPx = this.sizePx(bubble.size) / 2
      const parentRadiusPercent = parentRadiusPx / (this.$el.clientWidth / 100)
      const spawnRadius = parentRadiusPercent * 2
      for (let i = 0; i < count; i++) {
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
          size
        })
      }
    },
    checkHit(x, y) {
      if (this.bombMode) return 
      if (!this.$el || this.$el.clientWidth === 0) return
      if (this.bubbles.length === 0) return
      const hitBubbles = this.bubbles.filter(b => {
        const dx = b.x - x
        const dy = b.y - y
        const radiusPercent =
          (this.sizePx(b.size) / this.$el.clientWidth) * 100 / 2
        return Math.hypot(dx, dy) <= radiusPercent
      })
      if (hitBubbles.length === 0) return
      hitBubbles.forEach(b => this.processHit(b))
    },
    processHit(bubble, countOverride = null, isBomb = false) {
      this.pushNearby(bubble)
      if (isBomb) {
        if (bubble.size === 'large') {
          this.spawnChildrenCustom(bubble, 7, 'small')
        }
      } else {
        this.spawnChildren(bubble)
      }
      if (bubble.color === this.targetColor) {
        this.hitSuccess(bubble.size)
      } else {
        if (this.mode !== 'auto') {
          this.hitFail(bubble.size)
        }
      }
      this.bubbles = this.bubbles.filter(b => b.id !== bubble.id)
    },
    onMouseMove(e) {
      if (!this.running) return
      const { x, y } = this.getCoords(e)
      this.mouseX = x
      this.mouseY = y
      if (this.mode === 'laser' && !this.bombMode) {
        this.checkHit(x, y)
      }
    },
    autoShoot() {
      if (!this.running) return
      if (this.bubbles.length === 0) return
      const target = this.bubbles[Math.floor(Math.random() * this.bubbles.length)]
      const x = target.x
      const y = target.y
      const shotId = crypto.randomUUID()
      this.addShot({ x, y, id: shotId })
      this.checkHit(x, y)
      setTimeout(() => {
        this.removeShot(shotId)
      }, 2000)
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
    getCoords(e) {
      return {
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      }
    },
    onAreaClick(e) {
      const { x, y } = this.getCoords(e)
      if (this.bombMode) {
        this.explodeBomb(x, y)        
        this.setBombMode(false) 
        return
      }
      if (this.mode === 'laser') return
      this.checkHit(x, y)
    },
    finishGame() {
      this.running = false
      if (this.spawnTimer) {
        clearInterval(this.spawnTimer)
      }
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame)
      }
      this.$emit('finish')
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
  &__bubble {
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
  &__shot {
    position: absolute;
    width: 10px;
    height: 10px;
    background: yellow;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
  &__bomb-indicator {
    position: absolute;
    border: 2px dashed red;
    border-radius: 50%;
    pointer-events: none;
    transform: translate(-50%, -50%);
  }
}
</style>