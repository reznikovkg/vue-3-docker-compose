<template>
  <div
    @keydown.up="move(0, -1)"
    @keydown.down="move(0, 1)"
    @keydown.left="move(-1, 0)"
    @keydown.right="move(1, 0)">
    <FieldTable class="game-field" ref="gridRef" tabindex="0" :isSpeedUp="isSpeedPressed"/>
    <div class="game-menu">
      <button class="start-button" @click="handleStart" :disabled="isGameActive">Start</button>
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
      <div>Таймер: {{ timerValue }}</div>
      <div>Очки: {{ getScore }}</div>
      <div>
        Режим: 
        <select class="mode-selector" :disabled="isGameActive">
          <option value="" disabled>Выберите режим</option>
          <option 
            v-for="(label, key) in MODES" 
            :key="key" 
            :value="label"
            @click="() => setMode(label)"
          >
            {{ label }}
          </option>
        </select>
      </div>
      
    </div>
  </div>
</template>

<script>
import FieldTable from '@/components/Field/FieldTable.vue'
import { MODES } from "@/store/game"
import { ROTATE_DIRECTION } from "@/store/cube"
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'IndexPage',
  components: { FieldTable },
  data() {
    return {
      fieldSize: 15,
      isSpeedPressed: false,
      MODES
    }
  },
  computed: {
    ...mapGetters('field', ['getFieldSize', 'isGameActive']),
    ...mapGetters('game', ['getTimer','getScore', 'getIsGameStarted']),
    ...mapGetters('cube', ['getCentralCubePosition']),

    timerValue() {
      return Math.ceil(this.getTimer)
    },
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
      'stopSpeedUp',
      'setMode'
    ]),
    ...mapActions('cube', ['rotateIsland','changeCentralCubePosition']),

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
      if (event.code === 'Space' && !this.isSpeedPressed && this.isGameActive) {
        event.preventDefault()
        this.isSpeedPressed = true
        this.startSpeedUp()
      }
      else if (event.key.toLowerCase() === 'a' && this.isGameActive)
      {
        event.preventDefault()
        this.rotateIsland(ROTATE_DIRECTION.LEFT)

      }
      else if (event.key.toLowerCase() === 'd' && this.isGameActive)
      {
        event.preventDefault()
        this.rotateIsland(ROTATE_DIRECTION.RIGHT)

      }
    },
    handleKeyUp(event) {
      if (event.code === 'Space' && this.isSpeedPressed) {
        event.preventDefault()
        this.isSpeedPressed = false
        this.stopSpeedUp()
      }
    },
    move(dx, dy){
      if (!this.getIsGameStarted) {
        return
      }

      let {x, y} = this.getCentralCubePosition
      
      x += dx
      y += dy

      this.changeCentralCubePosition({x: x, y: y})
    }
  }
}
</script>

<style scoped>
.field-size-input {
  font-size: 2.3vmin;
}
.game-menu {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.3vmin;
  gap: 1vmin;
}
.start-button {
  font-size: 2.3vmin;
}
.mode-selector {
  font-size: 2.3vmin;
}
.game-field {
  background-color: white;
}
</style>