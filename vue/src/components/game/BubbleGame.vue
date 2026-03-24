<template>
  <div class = "bubble-playground">
    <div class = "bubble-playground__header">
      <div class = "bubble-playground__score">{{ points.toFixed(0) }}</div>
      <div
          class = "bubble-playground__timer"
          :class = "{ 'bubble-playground__timer--urgent': remaining <= 15 }"
      >
        {{ timeDisplay }}
      </div>
    </div>
    <div v-if = "tutorialVisible" class = "bubble-playground__hint">
      <div class = "bubble-playground__hint__content">
        <p>Лопай шарики нужного цвета!</p>
        <img :src = "targetIcon" :alt = "targetLabel" class = "bubble-playground__hint__image" />
      </div>
    </div>
    <canvas ref = "stage" class = "bubble-playground__canvas" @mousedown = "(event) => handleClick(event)"></canvas>
  </div>
</template>

<script>
import blueImg from '@/assets/bubbles/blue.png'
import greenImg from '@/assets/bubbles/green.png'
import orangeImg from '@/assets/bubbles/orange.png'
import pinkImg from '@/assets/bubbles/pink.png'
import purpleImg from '@/assets/bubbles/purple.png'
import redImg from '@/assets/bubbles/red.png'
import yellowImg from '@/assets/bubbles/yellow.png'

export default {
  name: 'BubblePlayground',
  props: {
    totalColors: { type: Number, required: true },
    targetColor: { type: String, required: true },
    spawnRate: { type: Number, required: true },
    pointsForCorrect: { type: Number, default: 1 },
    pointsForWrong: { type: Number, default: -5 },
    onStart: { type: Function, default: () => {} },
    gameDuration: { type: Number, default: 60 }
  },
  emits: ['score', 'finish'],

  data() {
    return {
      points: 0,
      remaining: this.gameDuration,
      sessionEnded: false,
      items: [],
      ctx: null,
      canvasWidth: 0,
      canvasHeight: 0,
      frameId: null,
      lastCreation: 0,
      images: {},
      countdownId: null,
      tutorialVisible: false,
      tutorialTimer: null,
      tutorialBlocking: false
    }
  },

  computed: {
    timeDisplay() {
      const minutes = Math.floor(this.remaining / 60)
      const seconds = this.remaining % 60
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    },
    imageMap() {
      return {
        blue: blueImg,
        green: greenImg,
        orange: orangeImg,
        pink: pinkImg,
        purple: purpleImg,
        red: redImg,
        yellow: yellowImg,
      }
    },
    targetIcon() {
      return this.imageMap[this.targetColor] || ''
    },
    targetLabel() {
      const names = {
        blue: 'Синий', green: 'Зелёный', orange: 'Оранжевый',
        pink: 'Розовый', purple: 'Фиолетовый', red: 'Красный', yellow: 'Жёлтый'
      }
      return names[this.targetColor] || this.targetColor
    },
    activeColors() {
      const all = Object.keys(this.imageMap)
      return all.slice(0, this.totalColors)
    }
  },
  mounted() {
    this.adjustCanvas()
    window.addEventListener('resize', this.adjustCanvas)
    this.ctx = this.$refs.stage.getContext('2d')
    this.fetchResources()
  },
  beforeDestroy() {
    if (this.frameId) cancelAnimationFrame(this.frameId)
    if (this.countdownId) clearInterval(this.countdownId)
    if (this.tutorialTimer) clearTimeout(this.tutorialTimer)
    window.removeEventListener('resize', this.adjustCanvas)
  },

  methods: {
    fetchResources() {
      let loaded = 0
      const total = Object.keys(this.imageMap).length
      Object.entries(this.imageMap).forEach(([color, src]) => {
        const img = new Image()
        img.onload = () => {
          loaded++
          this.images[color] = img
          if (loaded === total) this.beginSession()
        }
        img.onerror = () => {
          loaded++
          if (loaded === total) this.beginSession()
        }
        img.src = src
      })
    },
    beginSession() {
      this.onStart()
      this.lastCreation = performance.now()
      this.tutorialBlocking = true
      this.tutorialVisible = true
      this.frameId = requestAnimationFrame(this.animationStep)
      if (this.tutorialTimer) clearTimeout(this.tutorialTimer)
      this.tutorialTimer = setTimeout(() => {
        this.tutorialVisible = false
        this.tutorialBlocking = false
        this.startCountdown()
        this.lastCreation = performance.now()
      }, 3000)
    },
    startCountdown() {
      this.countdownId = setInterval(() => {
        if (!this.sessionEnded && this.remaining > 0) {
          this.remaining--
        } else if (this.remaining <= 0 && !this.sessionEnded) {
          this.finishSession()
        }
      }, 1000)
    },
    animationStep(now) {
      if (!this.sessionEnded) {
        if (!this.tutorialBlocking) {
          this.moveElements(now)
        }
        this.draw()
      }
      this.frameId = requestAnimationFrame(this.animationStep)
    },
    moveElements(now) {
      const interval = 1000 / this.spawnRate
      if (now - this.lastCreation > interval) {
        this.addItem()
        this.lastCreation = now
      }
      for (let i = this.items.length - 1; i >= 0; i--) {
        const item = this.items[i]
        item.x += item.speedX
        item.y += item.speedY
        item.wobble += item.wobbleSpeed
        item.x += Math.sin(item.wobble) * 0.3
        if (item.y - item.radius > this.canvasHeight + 100 ||
            item.x + item.radius < -100 ||
            item.x - item.radius > this.canvasWidth + 100) {
          this.items.splice(i, 1)
        }
      }
    },
    draw() {
      if (!this.ctx) return
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
      for (const item of this.items) {
        const img = this.images[item.color]
        if (!img) continue
        this.ctx.save()
        this.ctx.translate(item.x, item.y)
        this.ctx.drawImage(img, -item.radius, -item.radius, item.radius * 2, item.radius * 2)
        this.ctx.restore()
      }
    },
    addItem() {
      let colors = [...this.activeColors]
      if (!colors.includes(this.targetColor)) {
        colors.pop()
        colors.push(this.targetColor)
      }
      const randomColor = colors[Math.floor(Math.random() * colors.length)]
      const sizes = [15, 30, 45]
      const radius = sizes[Math.floor(Math.random() * sizes.length)]
      const spawnWidth = this.canvasWidth * 0.6
      const startX = (this.canvasWidth - spawnWidth) / 2
      const x = startX + Math.random() * spawnWidth
      const speedX = (Math.random() - 0.5) * 1.5
      const speedY = 1 + Math.random() * 2.5
      this.items.push({
        id: Date.now() + Math.random(),
        color: randomColor,
        x: x,
        y: -radius,
        radius: radius,
        speedX: speedX,
        speedY: speedY,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.02 + Math.random() * 0.03,
        active: true
      })
    },
    handleClick(event) {
      if (this.sessionEnded) return
      const rect = this.$refs.stage.getBoundingClientRect()
      const scaleX = this.canvasWidth / rect.width
      const scaleY = this.canvasHeight / rect.height
      const clickX = (event.clientX - rect.left) * scaleX
      const clickY = (event.clientY - rect.top) * scaleY
      const hit = []
      for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i]
        const dx = clickX - item.x
        const dy = clickY - item.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist <= item.radius) hit.push(item)
      }
      if (hit.length === 0) return
      let totalPoints = 0
      for (const item of hit) {
        const isCorrect = item.color === this.targetColor
        totalPoints += isCorrect ? this.pointsForCorrect : this.pointsForWrong
        const idx = this.items.indexOf(item)
        if (idx !== -1) this.items.splice(idx, 1)
      }
      this.points += totalPoints
      this.$emit('score', { points: totalPoints, count: hit.length })
    },
    restartGame() {
      this.resetSession()
    },
    resetSession() {
      this.onStart()
      this.points = 0
      this.remaining = this.gameDuration
      this.sessionEnded = false
      this.items = []
      if (this.frameId) cancelAnimationFrame(this.frameId)
      if (this.countdownId) clearInterval(this.countdownId)
      if (this.tutorialTimer) clearTimeout(this.tutorialTimer)
      this.lastCreation = performance.now()
      this.tutorialBlocking = true
      this.tutorialVisible = true
      this.frameId = requestAnimationFrame(this.animationStep)
      this.tutorialTimer = setTimeout(() => {
        this.tutorialVisible = false
        this.tutorialBlocking = false
        this.startCountdown()
        this.lastCreation = performance.now()
      }, 3000)
    },
    finishSession() {
      this.sessionEnded = true
      this.items = []
      if (this.countdownId) clearInterval(this.countdownId)
      if (this.tutorialTimer) clearTimeout(this.tutorialTimer)
      this.tutorialVisible = false
      this.tutorialBlocking = false
      this.$emit('finish', { score: this.points, timeElapsed: this.gameDuration })
    },
    adjustCanvas() {
      const canvas = this.$refs.stage
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      this.canvasWidth = canvas.width
      this.canvasHeight = canvas.height
    }
  }
}
</script>

<style lang="scss" scoped>
$bgGradientStart: #fce9e1;
$bgGradientEnd: #fff9f0;
$textLight: #a58d7b;
$textMuted: #d39974;
$accentPastel: #f3b3a1;
$borderSoft: #f0d9cf;
$timerWarning: #f3b3a1;

.bubble-playground {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(160deg, $bgGradientStart 0%, $bgGradientEnd 100%);
  user-select: none;
  overflow: hidden;

  &__header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 20px;
    box-sizing: border-box;
    z-index: 20;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(5px);
    border-bottom: 2px solid $borderSoft;
    pointer-events: none;
  }

  &__score {
    font-size: 2rem;
    font-weight: bold;
    color: $textLight;
    text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.8);
    background: transparent;
    padding: 0;
    border: none;
    letter-spacing: 1px;
  }

  &__timer {
    font-size: 2rem;
    font-weight: bold;
    color: $textLight;
    text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.8);
    transition: all 0.3s ease;
  }

  &__timer--urgent {
    color: $timerWarning;
    text-shadow: 0 0 5px $timerWarning;
  }

  &__hint {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 245, 235, 0.95);
    backdrop-filter: blur(8px);
    border-radius: 60px;
    padding: 20px 40px;
    border: 2px solid $accentPastel;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    z-index: 100;
    pointer-events: none;
    text-align: center;
    animation: fadeInOut 0.3s ease-out;

    &__content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;

      p {
        font-size: 1.8rem;
        font-weight: bold;
        color: $textLight;
        margin: 0;
        white-space: nowrap;
      }
    }

    &__image {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 3px solid $accentPastel;
      box-shadow: 0 0 15px rgba($accentPastel, 0.5);
    }
  }

  &__canvas {
    width: 100%;
    height: 100%;
    display: block;
    cursor: pointer;
    position: relative;
    z-index: 1;
  }
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
  15% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  85% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
}
</style>