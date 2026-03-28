<template>
  <canvas
    v-if="active"
    ref="canvasRef"
    class="bomb-explosion__canvas"
    :width="frameWidth"
    :height="frameHeight"
    :style="{ left: x + 'px', top: y + 'px' }"
  ></canvas>
</template>

<script lang="ts">
import bombSprite from './../../assets/animation/bomb-sprite.png'
import soundManager from './../../utils/soundManager'

export default {
  name: 'BombExplosion',
  props: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    detonateFrame: { type: Number, default: 76 }
  },
  emits: ['complete', 'detonate'],
  data() {
    return {
      active: true,
      frameWidth: 90,
      frameHeight: 90,
      totalFrames: 105,
      fps: 120,
      currentFrame: 0,
      animationId: null as number | null,
      spriteImage: null as HTMLImageElement | null,
      detonationTriggered: false
    }
  },
  mounted() {
    this.loadSprite()
    this.playBombSound()
  },
  beforeUnmount() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
  },
  methods: {
    playBombSound() {
      soundManager.play('bomb')
    },
    loadSprite() {
      this.spriteImage = new Image()
      this.spriteImage.onload = () => {
        this.startAnimation()
      }
      this.spriteImage.onerror = (err) => {
        console.error('Ошибка загрузки спрайта:', err)
      }
      this.spriteImage.src = bombSprite
    },
    startAnimation() {
      const frameDuration = 1000 / this.fps
      let lastTime = performance.now()
      
      const animate = (currentTime: number) => {
        const delta = currentTime - lastTime
        
        if (delta >= frameDuration) {
          lastTime = currentTime
          this.currentFrame++

          if (!this.detonationTriggered && this.currentFrame >= this.detonateFrame) {
            this.detonationTriggered = true
            this.$emit('detonate', { x: this.x, y: this.y })
          }
          
          if (this.currentFrame >= this.totalFrames) {
            this.active = false
            this.$emit('complete')
            return
          }
          
          this.drawFrame()
        }
        
        this.animationId = requestAnimationFrame(animate)
      }
      
      this.animationId = requestAnimationFrame(animate)
      this.drawFrame()
    },
    drawFrame() {
      const canvas = this.$refs.canvasRef as HTMLCanvasElement
      if (!canvas || !this.spriteImage) return
      
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      ctx.clearRect(0, 0, this.frameWidth, this.frameHeight)
      
      ctx.drawImage(
        this.spriteImage,
        this.currentFrame * this.frameWidth, 0,
        this.frameWidth, this.frameHeight,
        0, 0,
        this.frameWidth, this.frameHeight
      )
    }
  }
}
</script>

<style scoped lang="scss">
.bomb-explosion {
  position: fixed;
  pointer-events: none;
  z-index: 100;
  
  &__canvas {
    position: absolute;
    width: 90px;
    height: 90px;
    transform: translate(-58%, -48%);
  }
}
</style>