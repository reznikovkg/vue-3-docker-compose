<template>
  <div class="index">
    <div class="index__container">
      <div class="index__header">
        <div class="index__title">Русская рыбалка</div>
      </div>

      <LocationSelector 
        :items="locations" 
        :value="selectedLocation"
        @change-location="changeLocation"
      />

      <FishingArea
        :background="currentLocation.background"
        :is-waiting="isWaiting"
        :is-biting="isBiting"
        :timer="timer"
        :bite-message="biteMessage"
        :button-text="buttonText"
        @cast="handleClick"
      />

      <BiteIndicator
        :last-catch="lastCatch"
        :catch-history="catchHistory"
      />
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
      isBiting: false,
      timer: 0,
      biteMessage: 'Забросьте удочку',
      lastCatch: '',
      catchHistory: [],
      biteTimeout: null,
      missTimeout: null,
      timerInterval: null
    }
  },
  computed: {
    currentLocation() {
      if (!this.selectedLocation) {
        return this.locations[0]
      }
      return this.selectedLocation
    },
    buttonText() {
      if (this.isWaiting) {
        return 'Ожидание'
      }
      if (this.isBiting) {
        return 'Подсечь'
      }
      return 'Забросить'
    }
  },
  methods: {
    changeLocation(location) {
      this.selectedLocation = location
      this.isWaiting = false
      this.isBiting = false
      this.timer = 0
      this.biteMessage = 'Забросьте удочку'
      this.lastCatch = ''
      
      clearTimeout(this.biteTimeout)
      clearTimeout(this.missTimeout)
      clearInterval(this.timerInterval)
    },
    handleClick() {
      if (this.isBiting) {
        this.catchFish()
      } else if (!this.isWaiting) {
        this.startFishing()
      }
    },
    startFishing() {
      this.isWaiting = true
      this.biteMessage = 'Ожидание поклевки'
      
      const timeToBite = Math.floor(Math.random() * 3000) + 2000
      this.timer = Math.floor(timeToBite / 1000)
      
      this.timerInterval = setInterval(() => {
        this.timer = this.timer - 1
      }, 1000)
      
      this.biteTimeout = setTimeout(() => {
        if (this.isWaiting) {
          this.bite()
        }
      }, timeToBite)
    },
    bite() {
      this.isWaiting = false
      this.isBiting = true
      this.biteMessage = 'Клюет!'
      clearInterval(this.timerInterval)
      
      this.missTimeout = setTimeout(() => {
        if (this.isBiting) {
          this.missFish()
        }
      }, 3000)
    },
    catchFish() {
      const fishList = this.currentLocation.fish
      const randomIndex = Math.floor(Math.random() * fishList.length)
      const fish = fishList[randomIndex]
      
      this.lastCatch = fish
      
      const historyItem = fish + ' - ' + this.currentLocation.name
      this.catchHistory.unshift(historyItem)
      if (this.catchHistory.length > 5) {
        this.catchHistory.pop()
      }
      
      this.biteMessage = 'Поймана рыба'
      this.isBiting = false
      
      clearTimeout(this.biteTimeout)
      clearTimeout(this.missTimeout)
      clearInterval(this.timerInterval)
    },
    missFish() {
      this.biteMessage = 'Рыба сорвалась'
      this.isBiting = false
      
      clearTimeout(this.missTimeout)
      
      setTimeout(() => {
        if (!this.isWaiting && !this.isBiting) {
          this.biteMessage = 'Забросьте удочку'
        }
      }, 1500)
    }
  },
  created() {
    this.selectedLocation = this.locations[0]
  },
  beforeDestroy() {
    clearTimeout(this.biteTimeout)
    clearTimeout(this.missTimeout)
    clearInterval(this.timerInterval)
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
</style>