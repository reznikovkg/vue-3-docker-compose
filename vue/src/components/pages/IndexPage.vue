<template>
  <div class="index">
    <div class="index__container">
      <div class="index__header">
        <div class="index__title">Русская рыбалка</div>
      </div>

      <LocationSelector
        :locations="locations"
        :selected="selectedLocation"
        @change-location="(location) => changeLocation(location)"
      />

      <FishingArea
        :background="currentLocation.background"
        :message="message"
        :is-fishing="isFishing"
        :is-waiting-bite="isWaitingBite"
        :is-fish-hooked="isFishHooked"
        :float-x="floatX"
        :float-y="floatY"
        :rod-load="rodLoad"
        :fish-distance="fishDistance"
        @cast="(position) => handleCast(position)"
        @start-pull="() => handleStartPull()"
        @stop-pull="() => handleStopPull()"
        @error="(message) => showError(message)"
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
          fish: ['Щука', 'Плотва', 'Окунь']
        },
        {
          id: 3,
          name: 'Озеро',
          background: '/img/lake.jpg',
          fish: ['Лещ', 'Судак', 'Карась']
        }
      ],
      selectedLocation: null,
      isFishing: false,
      isWaitingBite: false,
      isFishHooked: false,
      isPulling: false,
      floatX: 0,
      floatY: 0,
      rodLoad: 0,
      fishDistance: 0,
      currentFish: '',
      lastCatch: '',
      catchHistory: [],
      message: 'Кликни по воде чтобы забросить',
      errorMessage: '',
      biteTimeout: null,
      fishInterval: null,
      pullInterval: null,
      loadInterval: null,
      fishPowerInterval: null
    }
  },
  computed: {
    currentLocation() {
      if (this.selectedLocation) {
        return this.selectedLocation
      }

      return this.locations[0]
    }
  },
  methods: {
    showError(message) {
      this.errorMessage = message

      setTimeout(() => {
        this.errorMessage = ''
      }, 2000)
    },

    changeLocation(location) {
      this.selectedLocation = location
      this.resetFishing()
    },

    handleCast(position) {
      if (this.isFishing || this.isWaitingBite || this.isFishHooked) {
        return
      }

      this.clearFishingTimers()

      this.isFishing = true
      this.isWaitingBite = true
      this.isFishHooked = false
      this.isPulling = false
      this.rodLoad = 0
      this.fishDistance = 90
      this.currentFish = ''
      this.floatX = position.x
      this.floatY = position.y
      this.message = 'Ожидание поклевки...'

      const timeToBite = Math.floor(Math.random() * 3000) + 2000

      this.biteTimeout = setTimeout(() => {
        this.startBite()
      }, timeToBite)
    },

    startBite() {
      if (!this.isFishing) {
        return
      }

      const fishList = this.currentLocation.fish
      const randomIndex = Math.floor(Math.random() * fishList.length)

      this.currentFish = fishList[randomIndex]
      this.isWaitingBite = false
      this.isFishHooked = true
      this.message = 'Клюет! Подтяни поплавок к себе!'

      this.startFishMove()
      this.startFishEscape()
    },

    startFishMove() {
      clearInterval(this.fishInterval)

      this.fishInterval = setInterval(() => {
        if (!this.isFishHooked) {
          return
        }

        if (this.isPulling) {
          return
        }

        const centerX = 50

        if (this.floatX <= centerX) {
          this.floatX = this.floatX - 2.5
        } else {
          this.floatX = this.floatX + 2.5
        }

        this.floatY = this.floatY - 1.5

        if (this.floatX < 8) {
          this.floatX = 8
        }

        if (this.floatX > 92) {
          this.floatX = 92
        }

        if (this.floatY < 52) {
          this.floatY = 52
        }

        if (this.floatY > 88) {
          this.floatY = 88
        }
      }, 210)
    },

    startFishEscape() {
      clearInterval(this.fishPowerInterval)

      this.fishPowerInterval = setInterval(() => {
        if (!this.isFishHooked) {
          return
        }

        if (!this.isPulling) {
          this.fishDistance = this.fishDistance + 2.2
        } else {
          this.fishDistance = this.fishDistance - 0.7
        }

        if (this.fishDistance < 0) {
          this.fishDistance = 0
        }

        if (this.fishDistance >= 100) {
          this.missFish()
        }
      }, 230)
    },

    handleStartPull() {
      if (!this.isFishHooked) {
        return
      }

      this.isPulling = true
      this.message = 'Тяни осторожно!'

      clearInterval(this.pullInterval)
      clearInterval(this.loadInterval)

      this.pullInterval = setInterval(() => {
        if (!this.isPulling || !this.isFishHooked) {
          return
        }

        const centerX = 50

        if (this.floatX < centerX) {
          this.floatX = this.floatX + 2
        } else if (this.floatX > centerX) {
          this.floatX = this.floatX - 2
        }

        this.floatY = this.floatY + 2
        this.fishDistance = this.fishDistance - 2.2

        if (this.floatX < 8) {
          this.floatX = 8
        }

        if (this.floatX > 92) {
          this.floatX = 92
        }

        if (this.floatY > 84) {
          this.floatY = 84
        }

        if (this.fishDistance < 0) {
          this.fishDistance = 0
        }

        if (this.floatY >= 80 && this.floatX >= 43 && this.floatX <= 57 && this.fishDistance <= 8) {
          this.catchFish()
        }
      }, 180)

      this.loadInterval = setInterval(() => {
        if (!this.isPulling || !this.isFishHooked) {
          return
        }

        this.rodLoad = this.rodLoad + 7

        if (this.rodLoad >= 100) {
          this.breakRod()
        }
      }, 210)
    },

    handleStopPull() {
      this.isPulling = false

      clearInterval(this.pullInterval)
      clearInterval(this.loadInterval)

      if (this.isFishHooked) {
        this.message = 'Рыба тянет поплавок в сторону'
        this.startRodRelax()
      }
    },

    startRodRelax() {
      clearInterval(this.loadInterval)

      this.loadInterval = setInterval(() => {
        if (this.isPulling || !this.isFishHooked) {
          clearInterval(this.loadInterval)
          return
        }

        this.rodLoad = this.rodLoad - 8

        if (this.rodLoad <= 0) {
          this.rodLoad = 0
          clearInterval(this.loadInterval)
        }
      }, 170)
    },

    catchFish() {
      this.lastCatch = this.currentFish

      const catchItem = this.currentFish + ' - ' + this.currentLocation.name
      this.catchHistory.unshift(catchItem)

      if (this.catchHistory.length > 5) {
        this.catchHistory.pop()
      }

      this.message = 'Рыба поймана!'
      this.finishFishing()
    },

    missFish() {
      this.message = 'Рыба сорвалась'
      this.finishFishing()
    },

    breakRod() {
      this.message = 'Удочка сломалась!'
      this.finishFishing()
    },

    finishFishing() {
      this.clearFishingTimers()
      this.isFishing = false
      this.isWaitingBite = false
      this.isFishHooked = false
      this.isPulling = false
      this.rodLoad = 0
      this.fishDistance = 0
      this.currentFish = ''

      setTimeout(() => {
        if (!this.isFishing && !this.isFishHooked) {
          this.message = 'Кликни по воде чтобы забросить'
        }
      }, 1500)
    },

    resetFishing() {
      this.clearFishingTimers()
      this.isFishing = false
      this.isWaitingBite = false
      this.isFishHooked = false
      this.isPulling = false
      this.floatX = 0
      this.floatY = 0
      this.rodLoad = 0
      this.fishDistance = 0
      this.currentFish = ''
      this.lastCatch = ''
      this.message = 'Кликни по воде чтобы забросить'
    },

    clearFishingTimers() {
      clearTimeout(this.biteTimeout)
      clearInterval(this.fishInterval)
      clearInterval(this.pullInterval)
      clearInterval(this.loadInterval)
      clearInterval(this.fishPowerInterval)
    }
  },
  created() {
    this.selectedLocation = this.locations[0]
  },
  beforeUnmount() {
    this.clearFishingTimers()
  }
}
</script>
<style scoped lang="scss">
.index {
  font-family: Arial, sans-serif;
  padding: 10px;
  background: #ffffff;

  &__container {
    max-width: 400px;
    margin: 0 auto;
    border: 1px solid #000000;
    padding: 10px;
    background: #ffffff;
  }

  &__header {
    text-align: center;
    margin-bottom: 10px;
  }

  &__title {
    font-size: 22px;
    font-weight: bold;
  }

  &__error {
    margin-top: 10px;
    padding: 10px;
    border: 1px solid #cc0000;
    background: #ffd9d9;
    color: #cc0000;
    text-align: center;
  }
}
</style>