<template>
  <div class="index">
    <div class="index__container">
      <div class="index__header">
        <div class="index__title">Русская рыбалка</div>
      </div>

      <LocationSelector 
        :locations="locations"
        :selected="selectedLocation"
        @change-location="changeLocation"
      />

      <FishingArea
        :background="currentLocation.background"
        :is-waiting="isWaiting"
        :is-mini-game-active="isMiniGameActive"
        :fish-progress="fishProgress"
        :line-tension="lineTension"
        :timer="timer"
        :bite-message="biteMessage"
        @cast="handleCast"
        @error="showError"
        @start-pull="handleStartPull"
        @pulling="handlePulling"
        @stop-pull="handleStopPull"
      />

      <BiteIndicator
        :last-catch="lastCatch"
        :catch-history="catchHistory"
      />

      <div v-if="errorMessage" class="index__error">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import LocationSelector from './LocationSelector.vue'
import FishingArea from './FishingArea.vue'
import BiteIndicator from './BiteIndicator.vue'

export default {
  name: 'IndexPage',
  components: {
    LocationSelector,
    FishingArea,
    BiteIndicator
  },
  data() {
    return {
      locations: [
        {
          id: 1,
          name: 'Пруд',
          background: '/img/pond.jpg',
          fish: ['Карась', 'Окунь', 'Карп']
        },
        {
          id: 2,
          name: 'Река',
          background: '/img/river.jpg',
          fish: ['Щука', 'Окунь', 'Плотва']
        },
        {
          id: 3,
          name: 'Озеро',
          background: '/img/lake.jpg',
          fish: ['Лещ', 'Судак', 'Карась']
        }
      ],
      selectedLocation: null,
      isWaiting: false,
      isMiniGameActive: false,
      timer: 0,
      biteMessage: 'Кликни по воде чтобы забросить',
      lastCatch: '',
      catchHistory: [],
      errorMessage: '',
      biteTimeout: null,
      timerInterval: null,
      fishProgress: 0,
      lineTension: 0,
      gameInterval: null,
      isPullingNow: false,
      currentFish: null
    }
  },
  computed: {
    currentLocation() {
      if (!this.selectedLocation) {
        return this.locations[0]
      }
      return this.selectedLocation
    }
  },
  methods: {
    showError(msg) {
      this.errorMessage = msg
      setTimeout(() => {
        this.errorMessage = ''
      }, 2000)
    },

    changeLocation(location) {
      this.selectedLocation = location
      this.resetFishing()
    },

    resetFishing() {
      this.isWaiting = false
      this.isMiniGameActive = false
      this.timer = 0
      this.biteMessage = 'Кликни по воде чтобы забросить'
      this.lastCatch = ''
      this.currentFish = null
      
      clearTimeout(this.biteTimeout)
      clearInterval(this.timerInterval)
      this.cleanupMiniGame()
    },

    handleCast() {
      if (this.isMiniGameActive || this.isWaiting) return
      
      this.isWaiting = true
      this.biteMessage = ''
      
      const timeToBite = Math.floor(Math.random() * 3000) + 2000 // 2-5 секунд
      this.timer = Math.floor(timeToBite / 1000)
      
      this.timerInterval = setInterval(() => {
        this.timer = this.timer - 1
      }, 1000)
      
      this.biteTimeout = setTimeout(() => {
        if (this.isWaiting) {
          this.startMiniGame()
        }
      }, timeToBite)
    },

    startMiniGame() {
      this.isWaiting = false
      this.isMiniGameActive = true
      clearInterval(this.timerInterval)
      
      const fishList = this.currentLocation.fish
      const randomIndex = Math.floor(Math.random() * fishList.length)
      this.currentFish = fishList[randomIndex]
      
      this.fishProgress = 10
      this.lineTension = 0
      
      // Игровой цикл
      this.gameInterval = setInterval(() => {
        if (!this.isMiniGameActive) return
        
        if (this.isPullingNow) {
          // Тянем - рыба плывет быстро, леска натягивается
          this.fishProgress += 3.0
          this.lineTension += 5
          
          if (this.lineTension >= 100) {
            this.lineBreak()
            return
          }
        } else {
          // Не тянем - рыба уплывает медленно, натяжение падает быстро
          this.fishProgress = Math.max(0, this.fishProgress - 0.8)  // Медленно уплывает
          this.lineTension = Math.max(0, this.lineTension - 3)     // Быстро падает
        }
        
        if (this.fishProgress >= 100) {
          this.catchFish()
        } else if (this.fishProgress <= 0) {
          this.missFish()
        }
      }, 150)
    },

    handleStartPull() {
      this.isPullingNow = true
    },

    handlePulling() {},

    handleStopPull() {
      this.isPullingNow = false
    },

    lineBreak() {
      this.biteMessage = 'Леска порвалась!'
      this.isMiniGameActive = false
      this.currentFish = null
      this.cleanupMiniGame()
      
      setTimeout(() => {
        this.biteMessage = 'Кликни по воде чтобы забросить'
      }, 1500)
    },

    catchFish() {
      this.lastCatch = this.currentFish
      const historyItem = this.currentFish + ' - ' + this.currentLocation.name
      this.catchHistory.unshift(historyItem)
      if (this.catchHistory.length > 5) {
        this.catchHistory.pop()
      }
      
      this.biteMessage = 'Рыба поймана!'
      this.isMiniGameActive = false
      this.currentFish = null
      this.cleanupMiniGame()
      
      setTimeout(() => {
        this.biteMessage = 'Кликни по воде чтобы забросить'
      }, 1500)
    },

    missFish() {
      this.biteMessage = 'Рыба сорвалась'
      this.isMiniGameActive = false
      this.currentFish = null
      this.cleanupMiniGame()
      
      setTimeout(() => {
        this.biteMessage = 'Кликни по воде чтобы забросить'
      }, 1500)
    },

    cleanupMiniGame() {
      clearInterval(this.gameInterval)
      this.isPullingNow = false
    }
  },
  created() {
    this.selectedLocation = this.locations[0]
  },
  beforeDestroy() {
    clearTimeout(this.biteTimeout)
    clearInterval(this.timerInterval)
    this.cleanupMiniGame()
  }
}
</script>

<style scoped>
.index {
  font-family: Arial;
  padding: 10px;
  background: white;
}

.index__container {
  max-width: 400px;
  margin: 0 auto;
  border: 1px solid black;
  padding: 10px;
}

.index__header {
  text-align: center;
  margin-bottom: 10px;
}

.index__title {
  font-size: 20px;
  font-weight: bold;
}

.index__error {
  margin-top: 10px;
  padding: 10px;
  background: #ffcccc;
  border: 1px solid red;
  color: red;
  text-align: center;
}
</style>