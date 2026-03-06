<template>
  <div>
    <FieldTable class="game-field" ref="gridRef" tabindex="0"/>
    <div class="start-size-menu">
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
      fieldSize: 7
    }
  },
  computed: {
    ...mapGetters('field', ['getFieldSize', 'isGameActive'])
  },
  mounted() {
    this.updateFieldSize()
  },
  beforeUnmount() {
    this.stopGame()
  },
  methods: {
    ...mapActions('field', [
      'changeFieldSize',
      'movePiece'
    ]),
    ...mapActions('game', [
      'startGame',
      'stopGame'
    ]),
    updateFieldSize() {
      this.changeFieldSize(this.fieldSize)
      this.fieldSize = this.getFieldSize
    },
    handleStart() {
      if (this.isGameActive) return
      this.startGame()
      this.$refs.gridRef?.$el?.focus()
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
.start-button {
  width: 11vmin;
  height: 4vmin;
  font-size: 3vmin;
}
.game-field {
  background-color: white;
}
</style>