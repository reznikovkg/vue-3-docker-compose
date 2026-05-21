<template>
  <div class = "game">
    <h1 class = "game__title">Переливатор</h1>

    <div class = "game__header">
      <div class = "game__timer">Время: {{ getFormattedTime }}</div>
      <Btn @click = "() => onToggleMode()">
        {{ getIsHardMode ? 'Включить лёгкий режим' : 'Включить сложный режим' }}
      </Btn>
    </div>
    <div v-if = "isWin" class = "game__win-message">
      Молодец! Все цвета разделены!
    </div>

    <div class = "game__container">
      <div class = "game__wrapper" ref = "wrapper">
        <Bottle
            v-for = "(bottle, index) in getBottle"
            :key = "bottle.id"
            :layers = "bottle.layers"
            :is-selected = "getSelected === index"
            :is-blocked = "getBlockedBottle === index"
            @select = "() => onBottleClick(index)"
            @move-start = "() => onMoveStart(index)"
            @move-swap = "(node) => onMoveEnter(node)"
            @move-end = "() => onMoveEnd()"
        />
      </div>
    </div>

    <div class = "game__controls">
      <Btn @click = "() => onRestart()">
        Начать заново
      </Btn>
    </div>

    <GameRecords :records = "getRecords" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Bottle from './../ui/Bottle.vue'
import Btn from './../ui/Btn.vue'
import GameRecords from './../ui/GameRecords.vue'
export default {
  name: 'WaterSortPage',
  components: {
    Bottle,
    Btn,
    GameRecords
  },
  data() {
    return {
      timerInterval: null,
      movedBottleIndex: null
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
  mounted() {
    this.initGame()
  },
  methods: {
    ...mapActions('waterSort', [
      'initGame',
      'handleBottleClick',
      'tickTimer',
      'toggleHardMode',
      'moveBottle'
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
    onRestart() {
      this.initGame();
      this.stopTimer();
    },
    onToggleMode() {
      this.toggleHardMode();
      this.stopTimer();
    },
    onBottleClick(index) {
      this.handleBottleClick(index);
      if (this.getIsTimerRunning && !this.timerInterval) {
        this.startTimer();
      } else if (!this.getIsTimerRunning && this.timerInterval) {
        this.stopTimer();
      }
    },
    onMoveStart(index) {
      this.movedBottleIndex = index;
    },
    onMoveEnter(targetNode) {
      if (this.movedBottleIndex !== null) {
        const wrapper = this.$refs.wrapper;
        if (!wrapper) return;
        const targetIndex = Array.from(wrapper.children).indexOf(targetNode);
        if (targetIndex !== -1 && this.movedBottleIndex !== targetIndex) {
          this.moveBottle({
            fromIndex: this.movedBottleIndex,
            toIndex: targetIndex
          });
          this.movedBottleIndex = targetIndex;
        }
      }
    },
    onMoveEnd() {
      this.movedBottleIndex = null;
    },
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
    margin-bottom: 40px;
  }
  &__wrapper {
    display: flex;
    gap: 20px;
    position: relative;
  }
}
</style>