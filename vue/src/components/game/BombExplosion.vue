<template>
  <div
    v-if="active"
    class="bomb-explosion"
    :style="{ left: x + 'px', top: y + 'px' }"
  >
    <div class="bomb-explosion__sprite"></div>
  </div>
</template>

<script lang="ts">
import soundManager from './../../utils/soundManager'
import { BOMB_CONFIG } from './../../config/bombConfig'

export default {
  name: 'BombExplosion',
  props: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    detonateFrame: { type: Number, default: BOMB_CONFIG.defaultDetonateFrame }
  },
  emits: ['complete', 'detonate'],
  data() {
    return {
      active: true,
      totalFrames: BOMB_CONFIG.totalFrames,
      frameWidth: BOMB_CONFIG.frameWidth,
      spriteWidth: BOMB_CONFIG.spriteWidth,
      animationDuration: BOMB_CONFIG.defaultDuration,
      detonationTriggered: false,
      detonationTimer: null as number | null
    }
  },
  mounted() {
    this.playBombSound()
    this.startAnimation()
  },
  beforeUnmount() {
    if (this.detonationTimer) {
      clearTimeout(this.detonationTimer)
    }
  },
  methods: {
    playBombSound() {
      soundManager.play('bomb')
    },
    startAnimation() {
      const timeToDetonate = (this.detonateFrame / this.totalFrames) * this.animationDuration
      
      this.detonationTimer = setTimeout(() => {
        if (!this.detonationTriggered) {
          this.detonationTriggered = true
          this.$emit('detonate', { x: this.x, y: this.y })
        }
      }, timeToDetonate)
      
      setTimeout(() => {
        this.active = false
        this.$emit('complete')
      }, this.animationDuration)
    }
  }
}
</script>

<style scoped lang="scss">
.bomb-explosion {
  position: fixed;
  pointer-events: none;
  z-index: 100;
  transform: translate(-58%, -48%);
  
  &__sprite {
    width: 90px;
    height: 90px;
    background-image: url('./../../assets/animation/bomb-sprite.png');
    background-repeat: no-repeat;
    background-position: 0 0;
    background-size: 9450px auto;
    animation: bomb-explosion 1.5s steps(105) forwards;
  }
}

@keyframes bomb-explosion {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: -9450px 0;
  }
}
</style>