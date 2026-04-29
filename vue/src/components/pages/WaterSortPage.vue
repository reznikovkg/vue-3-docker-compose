<template>
  <div class = "game">
    <h1 class = "game__title">Переливатор</h1>

    <div class = "game__header">
      <div class = "game__timer">Время: {{ getFormattedTime }}</div>
      <Btn @click = "() => toggleHardMode()">
        {{ getIsHardMode ? 'Включить лёгкий режим' : 'Включить сложный режим' }}
      </Btn>
    </div>
    <div v-if = "isWin" class = "game__win-message">
      Молодец! Все цвета разделены!
    </div>

    <div class = "game__container">
      <Bottle
          v-for = "(bottle, index) in getBottle"
          :key = "index"
          :layers = "bottle"
          :is-selected = "getSelected === index"
          :is-blocked = "getBlockedBottle === index"
          :max-layers = "4"
          @select = "() => handleBottleClick(index)"
      />
    </div>

    <div class = "game__controls">
      <Btn @click = "() => initGame()">
        Начать заново
      </Btn>
    </div>

    <div class = "game__records-container">
      <div v-if = "getRecords.easy.length > 0" class = "game__records">
        <h2 class = "game__records-title">Топ 10 лучших результатов в лёгком режиме</h2>
        <ol class = "game__records-list">
          <li v-for = "(time, idx) in getRecords.easy" :key = "idx">
            {{ formatRecord(time) }}
          </li>
        </ol>
      </div>
      <div v-if = "getRecords.hard.length > 0" class = "game__records">
        <h2 class = "game__records-title">Топ 10 лучших результатов в сложном режиме</h2>
        <ol class = "game__records-list">
          <li v-for = "(time, idx) in getRecords.hard" :key = "idx">
            {{ formatRecord(time) }}
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Bottle from './../ui/Bottle.vue'
import Btn from './../ui/Btn.vue'

export default {
  name: 'WaterSortPage',
  components: {
    Bottle,
    Btn
  },
  data() {
    return {
      timerInterval: null
    }
  },
  computed: {
    ...mapGetters('waterSort', [
      'getBottle',
      'getSelected',
      'isWin',
      'getFormattedTime',
      'getRecords',
      'getIsHardMode',
      'getBlockedBottle',
      'getTime',
      'getIsTimerRunning'
    ])
  },
  watch: {
    getIsTimerRunning(newVal) {
      if (newVal) {
        this.startTimer()
      } else {
        this.stopTimer()
      }
    }
  },
  mounted() {
    this.initGame()
  },
  methods: {
    ...mapActions('waterSort', [
      'initGame',
      'handleBottleClick',
      'tickTimer',
      'toggleHardMode'
    ]),
    startTimer() {
      this.stopTimer()
      this.timerInterval = setInterval(() => {
        if (!this.isWin) {
          this.tickTimer()
        }
      }, 1000)
    },
    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
        this.timerInterval = null
      }
    },
    formatRecord(seconds) {
      const m = Math.floor(seconds / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    }
  }
}
</script>

<style scoped lang = "scss">
.game {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;

  &__container {
    display: flex;
    gap: 20px;
    margin-top: 50px;
  }
  &__win-message {
    color: #2ecc71;
    font-weight: bold;
    font-size: 24px;
    margin-bottom: 20px;
  }
  &__controls {
    margin-top: 30px;
  }
  &__records {
    background: #f5f5f5;
    padding: 20px 40px;
    border-radius: 12px;
    text-align: center;
  }
  &__records-title {
    margin-bottom: 15px;
    font-size: 20px;
    color: #444;
  }
  &__records-list {
    list-style-type: decimal;
    text-align: left;
    padding-left: 20px;
    margin: 0;

    li {
      font-size: 18px;
      margin-bottom: 8px;
      color: #555;
    }
  }
}
</style>