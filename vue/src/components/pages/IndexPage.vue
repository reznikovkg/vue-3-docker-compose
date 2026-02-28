<template>
  <div class="index">
    <div class="index__container">
      <div class="index__header">
        <div class="index__title">Русская рыбалка</div>
      </div>

      <div class="index__location">
        <select class="index__select" v-model="selectedLocation" @change="changeLocation">
          <option v-for="item in locations" :key="item.id" :value="item">
            {{ item.name }}
          </option>
        </select>
      </div>

      <div class="index__water">
        <div class="index__bite" :class="{ 'index__bite--active': isBiting }">
          {{ biteMessage }}
        </div>

        <button class="index__button" @click="handleClick" :disabled="isWaiting">
          {{ buttonText }}
        </button>

        <div class="index__timer" v-if="isWaiting">
          {{ timer }} сек
        </div>
      </div>

      <div class="index__catch" v-if="lastCatch">
        Поймано: {{ lastCatch }}
      </div>

      <!-- НОВАЯ ФИЧА: История поклевок -->
      <div class="index__history" v-if="catchHistory.length > 0">
        <div class="index__history-title">История улова:</div>
        <div class="index__history-list">
          <div v-for="(item, idx) in catchHistory" :key="idx" class="index__history-item">
            {{ item }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IndexPage',
  data() {
    return {
      locations: [
        {
          id: 1,
          name: 'Пруд',
          fish: ['Карась', 'Окунь', 'Карп']
        },
        {
          id: 2,
          name: 'Река',
          fish: ['Щука', 'Окунь', 'Плотва']
        },
        {
          id: 3,
          name: 'Озеро',
          fish: ['Лещ', 'Судак', 'Карась']
        }
      ],
      selectedLocation: null,
      isWaiting: false,
      isBiting: false,
      timer: 0,
      biteMessage: 'Забросьте удочку',
      lastCatch: '',
      catchHistory: [], // НОВОЕ: для истории
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
    changeLocation() {
      this.isWaiting = false
      this.isBiting = false
      this.timer = 0
      this.biteMessage = 'Забросьте удочку'
      this.lastCatch = ''
      
      // ИСПРАВЛЕНИЕ: очищаем таймеры при смене локации
      clearTimeout(this.biteTimeout)
      clearTimeout(this.missTimeout)
      clearInterval(this.timerInterval)
      
      // Дополнительно сбрасываем отображение таймера
      this.timer = 0
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
      
      // НОВОЕ: добавляем в историю
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
/* Стили без изменений, но добавляем для истории */
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

.index__location {
  margin-bottom: 10px;
}

.index__select {
  width: 100%;
  padding: 5px;
  border: 1px solid black;
  background: white;
}

.index__water {
  border: 1px solid black;
  height: 200px;
  margin-bottom: 10px;
  padding: 10px;
  background: #f0f0f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.index__bite {
  border: 1px solid black;
  padding: 5px;
  margin-bottom: 5px;
  width: 100%;
  text-align: center;
  background: white;
}

.index__bite--active {
  background: yellow;
}

.index__button {
  border: 1px solid black;
  padding: 5px 10px;
  margin-bottom: 5px;
  background: white;
  cursor: pointer;
  width: 100%;
}

.index__button:hover {
  background: #f0f0f0;
}

.index__button:disabled {
  background: #e0e0e0;
  cursor: not-allowed;
}

.index__timer {
  border: 1px solid black;
  padding: 5px;
  width: 100%;
  text-align: center;
  background: white;
}

.index__catch {
  border: 1px solid black;
  padding: 5px;
  text-align: center;
  background: #e0e0e0;
  margin-bottom: 10px;
}

/* НОВЫЕ СТИЛИ для истории */
.index__history {
  border: 1px solid black;
  padding: 10px;
  background: #f9f9f9;
}

.index__history-title {
  font-weight: bold;
  margin-bottom: 5px;
  font-size: 14px;
}

.index__history-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.index__history-item {
  font-size: 12px;
  padding: 2px 0;
  border-bottom: 1px dotted #ccc;
}

.index__history-item:last-child {
  border-bottom: none;
}
</style>