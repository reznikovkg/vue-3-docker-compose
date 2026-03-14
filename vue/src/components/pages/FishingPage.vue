<template>
  <div
    class="fishing"
    :style="{ backgroundImage: 'url(' + location?.image + ')' }"
    @click="(event) => cast(event)"
    ref="area"
  >
    <div class="fishing__buttons">
      <button class="fishing__button" @click.stop="() => back()">Назад</button>
      <button class="fishing__button" @click.stop="() => shop()">Магазин</button>
      <button class="fishing__button" @click.stop="() => inventory()">Инвентарь</button>
    </div>

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

    <div v-if="message" class="fishing__message">{{ message }} </div>

  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { locations } from '@/config/locations'
import { fish } from '@/config/fish'

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
      messageTimeout: null,
      currentFish: null,
      hotSpot: null
    }
  },
  computed: {
    ...mapGetters('inventory', [
      'items',
      'activeRod',
      'activeBait'
    ])
  },
  mounted() {
    const id = Number(this.$route.params.locationId)
    this.location = locations.find(l => l.id === id)
    this.generateHotSpot()
  },
  methods: {
    ...mapActions('inventory', [
      'removeItem',
      'addFish'
    ]),

    generateHotSpot() {
      const rect = this.$refs.area?.getBoundingClientRect()
      if (!rect) {
        setTimeout(() => this.generateHotSpot(), 100)
        return
      }

      this.hotSpot = {
        x: 50 + Math.random() * (rect.width - 100),
        y: 50 + Math.random() * (rect.height - 200),
        radius: 80,
        multiplier: 2
      }
    },

    getHotSpotBonus() {
      if (!this.floatPosition || !this.hotSpot) {
        return 1
      }

      const dx = this.floatPosition.x - this.hotSpot.x
      const dy = this.floatPosition.y - this.hotSpot.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < this.hotSpot.radius) {
        const proximity = 1 - (distance / this.hotSpot.radius)
        return 1 + (this.hotSpot.multiplier - 1) * proximity
      }

      return 1
    },

    back() {
      this.clearAllTimeouts()
      this.clearAllIntervals()
      this.$router.push({ name: this.$routes.LOCATIONS })
    },

    shop() {
      this.clearAllTimeouts()
      this.clearAllIntervals()
      this.$router.push({ name: this.$routes.SHOP })
    },

    inventory() {
      this.clearAllTimeouts()
      this.clearAllIntervals()
      this.$router.push({ name: this.$routes.INVENTORY })
    },

    cast(event) {
      if (this.fishingState !== 'idle') {
        return
      }

      if (!this.activeRod) {
        this.message = 'Купите и выберите удочку в инвентаре'
        setTimeout(() => { this.message = '' }, 2000)
        return
      }

      if (!this.activeBait) {
        this.message = 'Выберите наживку в инвентаре'
        setTimeout(() => { this.message = '' }, 2000)
        return
      }

      const available = fish.filter(f => f.baitId === this.activeBait)

      if (!available.length) {
        this.message = 'На эту наживку никто не клюёт'
        setTimeout(() => { this.message = '' }, 2000)
        return
      }

      const selected = available[Math.floor(Math.random() * available.length)]
      const size = Math.floor(Math.random() * (selected.max - selected.min) + selected.min)
      this.currentFish = { ...selected, size }
      const rect = this.$refs.area.getBoundingClientRect()

      let x = event.clientX - rect.left
      let y = event.clientY - rect.top
      x = Math.max(30, Math.min(rect.width - 30, x))
      y = Math.max(30, Math.min(rect.height - 100, y))

      this.floatPosition = { x, y }
      this.targetX = rect.width / 2
      this.targetY = rect.height - 60
      this.fishingState = 'waiting'
      this.message = 'Ждем поклевки...'
      
      const bonus = this.getHotSpotBonus()
      const delay = (2000 + (size / 10)) / bonus

      this.biteTimeout = setTimeout(() => {
        if (this.fishingState === 'waiting') {
          this.fishingState = 'fighting'
          this.message = `Клюет ${this.currentFish.name}!`
        }
      }, delay)
    },
    
    startPull() {
      if (this.fishingState !== 'fighting' || !this.currentFish) {
        return
      }

      clearInterval(this.releaseInterval)
      this.releaseInterval = null
      this.message = ''
      const difficulty = this.currentFish.size / 200
      this.pullInterval = setInterval(() => {

        this.tension = Math.min(100, this.tension + 4 + difficulty / 2)

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

        const breakChance = this.tension / 200

        if (this.tension > 90 && Math.random() < breakChance) {
          this.breakRod()
          return
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
        this.tension = Math.max(0, this.tension - 4)

        if (this.floatPosition) {
          this.floatPosition.y = Math.max(0, this.floatPosition.y - 0.5)
        }
      }, 100)
    },

    breakRod() {
      this.clearAllIntervals()
      this.clearAllTimeouts()

      this.fishingState = 'idle'
      this.floatPosition = null
      this.tension = 0
      this.message = 'Удочка сломалась!'
      
      const rodItem = this.items.find(i => i.id === this.activeRod)
      if (rodItem) {
        this.removeItem(rodItem.id)
      }

      this.messageTimeout = setTimeout(() => {
        this.message = ''
      }, 2000)
    },

    catchFish() {
      if (this.fishingState !== 'fighting' || !this.currentFish) {
        return
      }

      this.clearAllIntervals()
      this.clearAllTimeouts()

      this.addFish(this.currentFish)
      this.fishingState = 'idle'
      this.tension = 0
      this.floatPosition = null
      this.message = `${this.currentFish.name} ${Math.round(this.currentFish.size)}г`

      this.messageTimeout = setTimeout(() => {
        this.message = ''
      }, 2000)

      this.currentFish = null
    },

    clearAllIntervals() {
      if (this.pullInterval) {
        clearInterval(this.pullInterval)
        this.pullInterval = null
      }
      
      if (this.releaseInterval) {
        clearInterval(this.releaseInterval)
        this.releaseInterval = null
      }
    },

    clearAllTimeouts() {
      if (this.biteTimeout) {
        clearTimeout(this.biteTimeout)
        this.biteTimeout = null
      }
      
      if (this.messageTimeout) {
        clearTimeout(this.messageTimeout)
        this.messageTimeout = null
      }
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

  &__buttons {
    position: absolute;
    top: 20px;
    left: 20px;
    display: flex;
    gap: 12px;
    z-index: 10;
    flex-wrap: wrap;
  }

  &__button {
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
    z-index: 10;
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
    z-index: 20;
  }
}
</style>
