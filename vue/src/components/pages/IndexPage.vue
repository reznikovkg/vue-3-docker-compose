<template>
  <div>
    <FieldTable class="game-field" ref="gridRef" tabindex="0"/>
    <div class="start-size-menu">
      <button class="start-button button" @click="handleStart" :disabled="isGameActive">Start</button>
      <input
        class="field-size-input"
        v-model.number="fieldSize"
        type="number"
        min="7"
        max="21"
        step="2"
        :disabled="isGameActive"
        @input="updateFieldSize"
      >
      <div>Размер: {{ getFieldSize }}</div>
      <div class="timer">Таймер: {{ timerValue }}</div>
    </div>
  </div>
</template>

<script>
import FieldTable from '@/components/Field/FieldTable.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'IndexPage',
  components: { FieldTable },
  data() {
    return {
      fieldSize: 15,
      isSpeedPressed: false
    }
  },
  computed: {
    ...mapGetters('field', ['getFieldSize', 'isGameActive']),
    ...mapGetters('game', ['getTimer']),

    timerValue() {
      return Math.ceil(this.getTimer)
    }
  },
  mounted() {
    this.updateFieldSize()
    window.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('keyup', this.handleKeyUp)
  },
  beforeUnmount() {
    this.stopGame()
    window.removeEventListener('keydown', this.handleKeyDown)
    window.removeEventListener('keyup', this.handleKeyUp)
  },
  methods: {
    ...mapActions('field', [
      'changeFieldSize',
      'movePiece'
    ]),
    ...mapActions('game', [
      'startGame',
      'stopGame',
      'startSpeedUp',
      'stopSpeedUp'
    ]),

    updateFieldSize() {
      this.changeFieldSize(this.fieldSize)
      this.fieldSize = this.getFieldSize
    },
    handleStart() {
      if (this.isGameActive) return
      this.startGame()
      this.$refs.gridRef?.$el?.focus()
    },
    handleKeyDown(event) {
      if (event.key === 'Shift' && !this.isSpeedPressed && this.isGameActive) {
        this.isSpeedPressed = true
        this.startSpeedUp()
      }
    },
    handleKeyUp(event) {
      if (event.key === 'Shift' && this.isSpeedPressed) {
        this.isSpeedPressed = false
        this.stopSpeedUp()
      }
    }
  }
}
</script>

<style scoped>
.field-size-input {
  width: 11vmin;
  height: 4vmin;
  font-size: 3vmin;
}
.start-size-menu {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3vmin;
  gap: 1vmin;
}
.button {
  font-size: 3vmin;
}
.game-field {
  background-color: white;
}
</style>