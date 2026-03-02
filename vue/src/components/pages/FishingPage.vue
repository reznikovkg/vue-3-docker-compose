<template>
  <div
    class="fishing"
    :style="{ backgroundImage: 'url(' + location?.image + ')' }"
    @click="(event) => cast(event)"
    ref="area"
  >
    <button class="fishing__back" @click.stop="() => back()">Назад</button>

    <img
      v-if="floatPosition"
      class="fishing__float"
      src="/images/float.png"
      alt="поплавок"
      :style="{
        left: floatPosition.x + 'px',
        top: floatPosition.y + 'px'
      }"
    >

    <div v-if="fishingState === 'fighting'" class="fishing__panel">
      <div class="fishing__bar">
        <div class="fishing__fill" :style="{ width: tension + '%' }"></div>
      </div>
      <button
        class="fishing__pull"
        @mousedown="() => startPull()"
        @mouseup="() => stopPull()"
        @mouseleave="() => stopPull()"
      >
        Тянуть
      </button>
    </div>

    <div v-if="message" class="fishing__message">{{ message }}</div>
  </div>
</template>

<script>
import { locations } from '@/config/locations'

export default {
  name: 'FishingPage',
  data() {
    return {
      location: null,
      floatPosition: null,
      fishingState: 'idle',
      tension: 0,
      pullInterval: null,
      releaseInterval: null,
      targetX: 0,
      targetY: 0,
      message: '',
      biteTimeout: null,
      messageTimeout: null
    }
  },
  mounted() {
    const id = Number(this.$route.params.locationId)
    this.location = locations.find(l => l.id === id)
  },
  methods: {
    back() {
      this.$router.push({ name: this.$routes.LOCATIONS })
    },

    cast(event) {
      if (this.fishingState !== 'idle') {
        return
      }

      const rect = this.$refs.area.getBoundingClientRect()

      this.floatPosition = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      }

      this.targetX = rect.width / 2
      this.targetY = rect.height - 60
      this.fishingState = 'waiting'
      this.message = 'Ждем...'

      this.biteTimeout = setTimeout(() => {
        if (this.fishingState === 'waiting') {
          this.fishingState = 'fighting'
          this.message = 'Клюет!'
        }
      }, 2000)
    },

    startPull() {
      if (this.fishingState !== 'fighting') {
        return
      }
      
      clearInterval(this.releaseInterval)
      this.releaseInterval = null
      
      this.message = ''

      this.pullInterval = setInterval(() => {
        this.tension = Math.min(100, this.tension + 4.5)

        if (this.floatPosition) {
          const dx = (this.targetX - this.floatPosition.x) * 0.1
          const dy = (this.targetY - this.floatPosition.y) * 0.1
          
          this.floatPosition.x += dx
          this.floatPosition.y += dy

          if (this.floatPosition.y >= this.targetY - 20) {
            this.catchFish()
            return
          }
        }

        if (this.tension >= 100) {
         this.breakRod()
        }
      }, 100)
    },

    stopPull() {
      if (this.fishingState !== 'fighting') {
        return
      }
      
      clearInterval(this.pullInterval)
      this.pullInterval = null

      this.releaseInterval = setInterval(() => {
        this.tension = Math.max(0, this.tension - 4.5)
        
        if (this.floatPosition) {
          this.floatPosition.y = Math.max(0, this.floatPosition.y - 1)
        }
      }, 100)
    },

    breakRod() {
      clearInterval(this.pullInterval)
      clearInterval(this.releaseInterval)
      clearTimeout(this.biteTimeout)
      clearTimeout(this.messageTimeout)
      
      this.pullInterval = null
      this.releaseInterval = null
      this.biteTimeout = null
      this.messageTimeout = null
      
      this.fishingState = 'idle'
      this.floatPosition = null
      this.tension = 0
      this.message = 'Удочка сломалась'

      this.messageTimeout = setTimeout(() => {
        this.message = ''
      }, 2000)
    },

    catchFish() {
      if (this.fishingState !== 'fighting') {
        return
      }

      clearInterval(this.pullInterval)
      clearInterval(this.releaseInterval)
      clearTimeout(this.biteTimeout)
      clearTimeout(this.messageTimeout)
      
      this.pullInterval = null
      this.releaseInterval = null
      this.biteTimeout = null
      this.messageTimeout = null

      this.message = ''

      this.fishingState = 'idle'
      this.tension = 0

      this.floatPosition = null
      this.message = 'Рыба поймана!'

      this.messageTimeout = setTimeout(() => {
        this.message = ''
        this.messageTimeout = null
      }, 1500)
    }
  }
}
</script>

<style scoped lang="scss">
.fishing {
  position: fixed;
  inset: 0;
  background-size: cover;
  background-position: center;

  &__back {
    position: absolute;
    top: 20px;
    left: 20px;
    font-size: 20px;
    padding: 10px 20px;
    border-radius: 12px;
    background: rgba(0,0,0,0.5);
    color: white;
    cursor: pointer;
    font-weight: bold;
    border: none;
    
    &:hover {
      background: rgba(0,0,0,0.7);
    }
  }

  &__float {
    position: absolute;
    width: 60px;
    height: 60px;
    transform: translate(-50%, -50%);
    pointer-events: none;
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
  }

  &__panel {
    position: absolute;
    bottom: 30px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: 20px;
    align-items: center;
    padding: 0 20px;
  }

  &__bar {
    width: 250px;
    height: 24px;
    background: rgba(0,0,0,0.6);
    border-radius: 12px;
    overflow: hidden;
    backdrop-filter: blur(4px);
  }

  &__fill {
    height: 100%;
    background: linear-gradient(90deg, #4ecdc4, #45b7b1);
    transition: width 0.1s;
  }

  &__pull {
    padding: 12px 24px;
    font-size: 20px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    background: #ff6b6b;
    color: white;
    font-weight: bold;
    transition: 0.2s;
    
    &:hover {
      background: #ff5252;
      transform: scale(1.05);
    }
    
    &:active {
      transform: scale(0.95);
    }
  }

  &__message {
    position: absolute;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 28px;
    color: #fff;
    text-shadow: 2px 2px 6px rgba(0,0,0,0.7);
    font-weight: bold;
    white-space: nowrap;
    background: rgba(0,0,0,0.5);
    padding: 8px 24px;
    border-radius: 40px;
    backdrop-filter: blur(4px);
    z-index: 10;
  }
}
</style>