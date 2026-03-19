<template>
  <div class="page">
    <div class="controls">
      <div class="controls__score">Счет: {{ score }}</div>
      <div>Комбо: x{{ combo.toFixed(2) }}</div>
      <div>Бомбы: {{ bombs }}</div>
      <button @click="() => setMode('manual')">Manual</button>
      <button @click="() => setMode('auto')">Auto</button>
      <button @click="() => setMode('laser')">Laser</button>
      <button @click="() => useBombClick()">БОМБА</button>
      <button class="controls__button" @click="() => start()">Начать игру</button>
    </div>
    <BubbleGame
      :colors-count="5"
      :target-color="2"
      :intensity="1.5"
      :score-hit="1"
      :score-miss="-5"
      :bubble-size="80"
      :duration="30"
      :start-game="(cb) => registerStart(cb)"
      @finish="(val) => onFinish(val)"
    />
  </div>
</template>
<script>

import BubbleGame from '../ui/BubbleGame.vue'
import { mapGetters, mapActions } from 'vuex'
export default {
  components: { BubbleGame },
  data() {
    return {
      startHandler: null
    }
  },
  computed: {
    ...mapGetters(['score', 'combo', 'bombs'])
  },
  methods: {
    ...mapActions(['setMode', 'resetGame', 'useBomb']),
    registerStart(cb) {
      this.startHandler = cb
    },
    start() {
      this.resetGame()
      if (this.startHandler) {
        this.startHandler()
      }
    },
    useBombClick() {
      const ok = this.useBomb()
      if (!ok) alert('Бомб нет')
    },
    onFinish(val) {
      alert(`Игра окончена. Итоговый счет: ${this.score}`)
    }
  }
}
</script>
<style scoped lang="scss">
.page {
  margin: 0;
  padding: 0;
  background-color: #979ccc;
  min-height: 100vh;
}

.controls {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1000;
  display: flex;
  gap: 20px;
  align-items: center;
  background: #979ccc;
  padding: 10px 20px;
  border-radius: 30px;
  backdrop-filter: blur(5px);
  &__score {
  font-weight: bold;
  font-size: 18px;
  }
  &__button {
    background-color: #f07db6;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background-color: #ff1493;
      transform: scale(1.05);
    }
  }
}
</style>