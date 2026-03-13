<template>
  <div class="game">
    <div class="game__content">
      <h2>Переливатор</h2>

      <div class="game__panel">
        <div class="game__time">
          Время: {{ formattedTime }}
        </div>

        <label class="game__mode">
          <input
            type="checkbox"
            v-model="isHardMode"
            @change="() => handleModeChange()"
          >
          Сложный режим
        </label>
      </div>

      <div v-if="isFinished" class="game__win">
        Игра окончена!
      </div>

      <div v-if="isHardMode && blockedFlaskIndex !== null" class="game__blocked">
        Заблокирована колба: {{ blockedFlaskIndex + 1 }}
      </div>

      <div class="game__field">
        <Flask
          v-for="(flask, index) in flasks"
          :key="index"
          :layers="flask"
          :maxLayers="MAX_LAYERS"
          :isSelected="selectedIndex === index"
          :isBlocked="blockedFlaskIndex === index"
          @select="() => selectFlask(index)"
        />
      </div>

      <div class="game__buttons">
        <button class="game__restart" @click="() => generateGame()">
          Новая игра
        </button>

        <button class="game__records-button" @click="() => openRecords()">
          Рекорды
        </button>
      </div>
    </div>

    <RecordsModal
      :isOpen="isRecordsOpen"
      :records="records"
      @close="() => closeRecords()"
    />
  </div>
</template>

<script>
import Flask from './Flask.vue'
import RecordsModal from './RecordsModal.vue'

export default {
  name: 'IndexPage',

  components: {
    Flask,
    RecordsModal
  },

  data () {
    return {
      flasks: [],
      selectedIndex: null,
      blockedFlaskIndex: null,
      MAX_LAYERS: 4,
      COLORS: ['red', 'blue', 'green', 'yellow'],
      isFinished: false,
      isHardMode: false,
      isRecordsOpen: false,
      time: 0,
      timerId: null,
      records: [],
      RECORDS_KEY: 'perelivator-records'
    }
  },

  computed: {
    formattedTime () {
      return this.formatTime(this.time)
    }
  },

  mounted () {
    this.loadRecords()
    this.generateGame()
  },

  beforeUnmount () {
    this.stopTimer()
  },

  methods: {
    generateGame () {
      this.selectedIndex = null
      this.blockedFlaskIndex = null
      this.isFinished = false

      const layers = this.createLayers()
      this.shuffle(layers)

      this.flasks = this.createEmptyFlasks()
      this.distributeLayers(layers)

      this.resetTimer()
    },

    handleModeChange () {
      if (!this.isGameStarted()) {
        this.blockedFlaskIndex = null
        this.selectedIndex = null
        return
      }

      this.generateGame()
    },

    isGameStarted () {
      return this.time > 0 || this.timerId !== null
    },

    createLayers () {
      const result = []

      this.COLORS.forEach(color => {
        for (let i = 0; i < this.MAX_LAYERS; i++) {
          result.push(color)
        }
      })

      return result
    },

    shuffle (array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp
      }
    },

    createEmptyFlasks () {
      const total = this.COLORS.length + 2
      const result = []

      for (let i = 0; i < total; i++) {
        result.push([])
      }

      return result
    },

    distributeLayers (layers) {
      layers.forEach(layer => {
        let placed = false

        while (!placed) {
          const randomIndex = Math.floor(Math.random() * this.flasks.length)

          if (this.flasks[randomIndex].length < this.MAX_LAYERS) {
            this.flasks[randomIndex].push(layer)
            placed = true
          }
        }
      })
    },

    selectFlask (index) {
      if (this.isFinished) return
      if (this.blockedFlaskIndex === index) return

      if (!this.timerId) {
        this.startTimer()
      }

      if (this.selectedIndex === null) {
        if (!this.flasks[index].length) return
        this.selectedIndex = index
        return
      }

      if (this.selectedIndex === index) {
        this.selectedIndex = null
        return
      }

      const moved = this.pour(this.selectedIndex, index)
      this.selectedIndex = null

      if (moved && this.isHardMode && !this.isFinished) {
        this.setBlockedFlask()
      }
    },

    pour (fromIndex, toIndex) {
      const from = this.flasks[fromIndex]
      const to = this.flasks[toIndex]

      if (!from.length) return false
      if (to.length >= this.MAX_LAYERS) return false

      const topColor = from[from.length - 1]

      if (to.length && to[to.length - 1] !== topColor) return false

      let count = 0

      for (let i = from.length - 1; i >= 0; i--) {
        if (from[i] !== topColor) break
        count++
      }

      const freeSpace = this.MAX_LAYERS - to.length
      const moveCount = count > freeSpace ? freeSpace : count

      if (!moveCount) return false

      for (let i = 0; i < moveCount; i++) {
        to.push(from.pop())
      }

      if (this.checkWin()) {
        this.isFinished = true
        this.stopTimer()
        this.addRecord()
        this.blockedFlaskIndex = null
      }

      return true
    },

    checkWin () {
      return this.flasks.every(flask => {
        if (!flask.length) return true
        if (flask.length !== this.MAX_LAYERS) return false
        return flask.every(color => color === flask[0])
      })
    },

    startTimer () {
      this.stopTimer()

      this.timerId = setInterval(() => {
        this.time++
      }, 1000)
    },

    stopTimer () {
      if (!this.timerId) return

      clearInterval(this.timerId)
      this.timerId = null
    },

    resetTimer () {
      this.stopTimer()
      this.time = 0
    },

    formatTime (time) {
      const minutes = Math.floor(time / 60)
      const seconds = time % 60

      const m = minutes < 10 ? '0' + minutes : minutes
      const s = seconds < 10 ? '0' + seconds : seconds

      return m + ':' + s
    },

    loadRecords () {
      const saved = localStorage.getItem(this.RECORDS_KEY)

      if (!saved) {
        this.records = []
        return
      }

      this.records = JSON.parse(saved)
    },

    saveRecords () {
      localStorage.setItem(this.RECORDS_KEY, JSON.stringify(this.records))
    },

    addRecord () {
      if (this.records.includes(this.time)) return

      this.records.push(this.time)
      this.records.sort((a, b) => a - b)
      this.records = this.records.slice(0, 10)
      this.saveRecords()
    },

    setBlockedFlask () {
      const available = []

      this.flasks.forEach((flask, index) => {
        if (flask.length) {
          available.push(index)
        }
      })

      if (!available.length) {
        this.blockedFlaskIndex = null
        return
      }

      const random = Math.floor(Math.random() * available.length)
      this.blockedFlaskIndex = available[random]
    },

    openRecords () {
      this.isRecordsOpen = true
    },

    closeRecords () {
      this.isRecordsOpen = false
    }
  }
}
</script>

<style scoped lang="scss">
.game {
  text-align: center;

  &__panel {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-bottom: 15px;
  }

  &__time {
    font-weight: bold;
  }

  &__mode {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__field {
    display: flex;
    justify-content: center;
    margin: 20px 0;
  }

  &__buttons {
    display: flex;
    justify-content: center;
    gap: 10px;
  }

  &__restart,
  &__records-button {
    padding: 6px 12px;
    cursor: pointer;
  }

  &__win {
    color: green;
    margin-bottom: 10px;
  }

  &__blocked {
    color: #8b0000;
    margin-bottom: 10px;
  }
}
</style>