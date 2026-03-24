<template>
  <div
    class="fishing"
    :style="{ backgroundImage: 'url(' + location?.image + ')' }"
    @click="(event) => handleClick(event)"
    ref="area"
  >
    <div class="fishing__buttons">
      <button class="fishing__button" @click.stop="() => back()">Назад</button>
      <button class="fishing__button" @click.stop="() => shop()">Магазин</button>
      <button class="fishing__button" @click.stop="() => inventory()">Инвентарь</button>
      <button 
        class="fishing__button" 
        @click.stop="() => startGroundbaitMode()"
        :disabled="this.activeGroundbaitItem === null || fishingState !== 'idle'"
      >
        {{ isGroundbaitMode ? 'Выбери место' : 'Прикормить' }}
      </button>
    </div>
    <img
      v-if="floatPosition"
      class="fishing__float"
      src="/images/float.png"
      alt="поплавок"
      :style="floatStyle"
    >
    <div 
      v-if="groundbaitSpot"
      class="fishing__groundbait"
      :style="groundbaitAreaStyle"
    >
      <div class="fishing__groundbait-info">
        {{ getGroundbaitName(groundbaitSpot.groundbaitId) }} (ур. {{ groundbaitSpot.level }})
      </div>
    </div>
    <div class="fishing__net"></div>
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
import { groundbaitsConfig } from '@/config/groundbaits'

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
      hotSpot: null,
      isGroundbaitMode: false,
      netUsed: false,
      netBroken: false,
      isCatching: false
    }
  },
  computed: {
    ...mapGetters('inventory', [
      'items',
      'activeRod',
      'activeBait',
      'activeNet',
      'groundbaitSpot',
      'activeGroundbaitItem'
    ]),
    floatStyle() {
      if (!this.floatPosition) {
        return {}
      }
      return {
        left: `${this.floatPosition.x}px`,
        top: `${this.floatPosition.y}px`
      }
    },
    groundbaitAreaStyle() {
      if (!this.groundbaitSpot) {
        return {}
      }
      const { x, y, radius } = this.groundbaitSpot
      const size = radius * 2
      return {
        left: `${x}px`,
        top: `${y}px`,
        width: `${size}px`,
        height: `${size}px`
      }
    },
  },
  mounted() {
    const id = Number(this.$route.params.locationId)
    this.location = locations.find(l => l.id === id)
    this.generateHotSpot()
    window.addEventListener('keydown', this.handleKeyDown)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown)
    this.clearAllIntervals()
    this.clearAllTimeouts()
  },
  methods: {
    ...mapActions('inventory', [
      'addFish',
      'useGroundbait',
      'setGroundbaitSpot',
      'useRod',
      'useNet',
      'useBait'
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
    getGroundbaitName(groundbaitId) {
      return this.items.find(i => i.id === groundbaitId)?.name || 'Прикормка'
    },
    isInGroundbaitZone() {
      if (!this.floatPosition || !this.groundbaitSpot) {
        return false
      }
      const dx = this.floatPosition.x - this.groundbaitSpot.x
      const dy = this.floatPosition.y - this.groundbaitSpot.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      return distance < this.groundbaitSpot.radius
    },
    isInNetZone() {
      if (!this.floatPosition) {
        return false
      }
      const dx = this.floatPosition.x - window.innerWidth / 2
      const dy = this.floatPosition.y - window.innerHeight
      return Math.sqrt(dx * dx + dy * dy) <= 300 && this.floatPosition.y < window.innerHeight
    },
    selectFishWithGroundbait(availableFish) {
      if (!this.isInGroundbaitZone()) {
        return availableFish[Math.floor(Math.random() * availableFish.length)]
      }
      const groundbaitConfig = groundbaitsConfig[this.groundbaitSpot.groundbaitId]
      if (!groundbaitConfig) {
        return availableFish[Math.floor(Math.random() * availableFish.length)]
      }
      const weightedFish = availableFish.flatMap(fishItem => {
        let weight = 1
        const attraction = groundbaitConfig.attraction[fishItem.id]
        if (attraction) {
          const levelBonus = 1 + (attraction - 1) * (this.groundbaitSpot.level / 5)
          weight = levelBonus
        }
        return Array(Math.ceil(weight * 10)).fill(fishItem)
      })
      return weightedFish[Math.floor(Math.random() * weightedFish.length)]
    },
    startGroundbaitMode() {
      if (this.fishingState !== 'idle') {
        return
      }
      if (this.activeGroundbaitItem === null) {
        this.message = 'Нет прикормки. Купите или выберите в инвентаре'
        setTimeout(() => {
          this.message = ''
        }, 2000)
        return
      }
      this.isGroundbaitMode = true
      this.message = 'Кликните по месту для прикормки'
      setTimeout(() => {
        this.message = ''
      }, 2000)
    },
    placeGroundbait(event) {
      if (!this.isGroundbaitMode) {
        return
      }
      const rect = this.$refs.area.getBoundingClientRect()
      let x = event.clientX - rect.left
      let y = event.clientY - rect.top
      x = Math.max(30, Math.min(rect.width - 30, x))
      y = Math.max(30, Math.min(rect.height - 100, y))
      const groundbaitItem = this.activeGroundbaitItem
      if (!groundbaitItem) {
        this.isGroundbaitMode = false
        this.message = 'Прикормка закончилась, выберите другую в инвентаре'
        setTimeout(() => {
          this.message = ''
        }, 2000)
        return
      }
      const existingSpot = this.groundbaitSpot
      if (existingSpot && existingSpot.groundbaitId === groundbaitItem.id) {
        let newLevel = existingSpot.level + 1
        if (newLevel > 5) {
          newLevel = 5
        }
        const baseRadius = 60
        const newRadius = baseRadius * (1 + (newLevel - 1) * 0.2)
        this.setGroundbaitSpot({
          x: x,
          y: y,
          radius: newRadius,
          groundbaitId: groundbaitItem.id,
          level: newLevel
        })
        this.message = `Прикормка обновлена! Уровень ${newLevel}`
      } else {
        this.setGroundbaitSpot({
          x: x,
          y: y,
          radius: 60,
          groundbaitId: groundbaitItem.id,
          level: 1
        })
        this.message = existingSpot ? `Новая прикормка: ${groundbaitItem.name}` : `Прикормка ${groundbaitItem.name} установлена!`
      }
      this.useGroundbait(groundbaitItem.id)
      setTimeout(() => {
        this.message = ''
      }, 2000)
      this.isGroundbaitMode = false
    },
    handleKeyDown(event) {
      if (event.code === 'Space' && this.fishingState === 'fighting' && !this.netUsed && this.activeNet && !this.netBroken && !this.isCatching) {
        event.preventDefault()
        this.tryUseNet()
      }
    },
    tryUseNet() {
      if (this.fishingState !== 'fighting' || !this.activeNet || this.netUsed || this.netBroken || this.isCatching) {
        return
      }
      const netItem = this.items.find(i => i.id === this.activeNet)
      if (!netItem) {
        return
      }
      const isInZone = this.isInNetZone()
      if (isInZone) {
        if (this.currentFish.size <= netItem.maxWeight) {
          this.netUsed = true
          this.clearAllIntervals()
          this.catchFishWithNet()
        } else {
          this.netBroken = true
          this.netUsed = false
          this.message = `Сачок сломался! Рыба слишком тяжелая!.`
          this.useNet(this.activeNet)
          this.clearAllIntervals()
          setTimeout(() => { 
            if (this.message.includes('сломался')) {
              this.message = ''
            }
          }, 2000)
        }
      } else {
        this.message = `Рыба слишком далеко!`
        setTimeout(() => { 
          this.message = ''
        }, 2000)
      }
    },
    catchFishWithNet() {
      if (this.isCatching || this.fishingState !== 'fighting' || !this.currentFish) {
        return
      }
      this.isCatching = true
      this.clearAllIntervals()
      this.clearAllTimeouts()
      const caughtFish = { ...this.currentFish }
      this.fishingState = 'idle'
      this.tension = 0
      this.floatPosition = null
      this.currentFish = null
      this.netUsed = false
      this.netBroken = false
      this.addFish(caughtFish)
      this.message = `Вы поймали ${caughtFish.name} ${Math.round(caughtFish.size)}г сачком!`
      this.messageTimeout = setTimeout(() => {
        this.message = ''
        this.isCatching = false
      }, 2000)
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
    handleClick(event) {
      if (this.isGroundbaitMode) {
        this.placeGroundbait(event)
      } else {
        this.cast(event)
      }
    },
    cast(event) {
      if (this.fishingState !== 'idle') {
        return
      }
      this.isCatching = false
      if (!this.activeRod) {
        this.message = 'Купите и выберите удочку в инвентаре'
        setTimeout(() => { 
          this.message = '' 
        }, 2000)
        return
      }
      if (!this.activeBait) {
        this.message = 'Выберите наживку в инвентаре'
        setTimeout(() => { 
          this.message = '' 
        }, 2000)
        return
      }
      const baitItem = this.items.find(i => i.id === this.activeBait)
      if (!baitItem || baitItem.quantity <= 0) {
        this.message = 'Наживка закончилась'
        setTimeout(() => { 
          this.message = '' 
        }, 2000)
        return
      }
      const available = fish.filter(f => f.baitId === this.activeBait)
      if (!available.length) {
        this.message = 'На эту наживку никто не клюёт'
        setTimeout(() => { 
          this.message = '' 
        }, 2000)
        return
      }
      const selected = this.selectFishWithGroundbait(available)
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
      this.netUsed = false
      this.netBroken = false
      this.useBait(this.activeBait)
      const bonus = this.getHotSpotBonus()
      const delay = (2000 + (size / 10)) / bonus
      this.biteTimeout = setTimeout(() => {
        if (this.fishingState === 'waiting' && !this.isCatching) {
          this.fishingState = 'fighting'
          this.message = `Клюет ${this.currentFish.name}!`
        }
      }, delay)
    },
    startPull() {
      if (this.fishingState !== 'fighting' || !this.currentFish || this.netUsed) {
        return
      }
      clearInterval(this.releaseInterval)
      this.releaseInterval = null
      this.message = ''
      const difficulty = this.currentFish.size / 200
      this.pullInterval = setInterval(() => {
        if (this.fishingState !== 'fighting' || this.netUsed || this.isCatching) {
          this.clearAllIntervals()
          return
        }
        this.tension = Math.min(100, this.tension + 4 + difficulty / 2)
        if (this.floatPosition) {
          const dx = (this.targetX - this.floatPosition.x) * 0.1
          const dy = (this.targetY - this.floatPosition.y) * 0.1
          this.floatPosition.x += dx
          this.floatPosition.y += dy
          if (this.floatPosition.y >= this.targetY - 20 && !this.isCatching) {
            this.catchFish()
            return
          }
        }
        const breakChance = this.tension / 200
        if (this.tension > 90 && Math.random() < breakChance && !this.isCatching) {
          this.breakRod()
          return
        }
        if (this.tension >= 100 && !this.isCatching) {
          this.breakRod()
        }
      }, 100)
    },
    stopPull() {
      if (this.fishingState !== 'fighting' || this.netUsed) {
        return
      }
      clearInterval(this.pullInterval)
      this.pullInterval = null
      this.releaseInterval = setInterval(() => {
        if (this.fishingState !== 'fighting' || this.netUsed || this.isCatching) {
          this.clearAllIntervals()
          return
        }
        this.tension = Math.max(0, this.tension - 4)
        if (this.floatPosition) {
          this.floatPosition.y = Math.max(0, this.floatPosition.y - 0.5)
        }
      }, 100)
    },
    breakRod() {
      if (this.isCatching) {
        return
      }
      this.clearAllIntervals()
      this.clearAllTimeouts()
      const brokenRodId = this.activeRod
      this.fishingState = 'idle'
      this.floatPosition = null
      this.tension = 0
      this.currentFish = null
      this.netUsed = false
      this.netBroken = false
      this.message = 'Удочка сломалась!'
      if (brokenRodId) {
        this.useRod(brokenRodId)
      }
      this.messageTimeout = setTimeout(() => {
        this.message = ''
      }, 2000)
    },
    catchFish() {
      if (this.isCatching || this.fishingState !== 'fighting' || !this.currentFish || this.netUsed) {
        return
      }
      this.isCatching = true
      this.clearAllIntervals()
      this.clearAllTimeouts()
      const caughtFish = { ...this.currentFish }
      this.fishingState = 'idle'
      this.tension = 0
      this.floatPosition = null
      this.currentFish = null
      this.netUsed = false
      this.netBroken = false
      this.addFish(caughtFish)
      this.message = `${caughtFish.name} ${Math.round(caughtFish.size)}г`
      this.messageTimeout = setTimeout(() => {
        this.message = ''
        this.isCatching = false
      }, 2000)
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
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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
  &__groundbait {
    position: absolute;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: rgba(255, 215, 0, 0.2);
    border: 2px solid rgba(255, 215, 0, 0.6);
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 5;
    &-info {
      position: absolute;
      bottom: -28px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.7);
      color: gold;
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 12px;
      white-space: nowrap;
    }
  }
  &__net {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 300px;
    pointer-events: none;
    z-index: 4;
    border-top-left-radius: 600px;
    border-top-right-radius: 600px;
    border: 2px solid black;
    border-bottom: none;
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
