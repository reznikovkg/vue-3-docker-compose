<template>
  <div class="game-board">
    <div class="game-board--score">Счет: {{score}}</div>
    <div class="game-board--grid">
      <div v-for="(row, y) in grid" :key="y" class="game-board--row">
        <Cell
          v-for="(cell, x) in row"
          :key="x"
          :item="cell"
          :x="x"
          :y="y"
          @drop="onDrop"
          @drag-start="onDragStart"
          />
      </div>
    </div>
    <button class="game-board--btn" @click="spawn">Добавить</button>
    <button class="game-board--btn" @click="restart">Перезапустить</button>
  </div>
</template>
<script>
import {mapGetters, mapActions} from 'vuex';
import Cell from "@/components/ui/Cell.vue";
export default {
  name: "GameBoard",
  components: {Cell},
  data() {
    return {
      dragged: null
    }
  },
  computed: {
    ...mapGetters('game', {
      grid: 'getGrid',
      score: 'getScore',
      size: 'getSize'
    })
  },
  mounted() {
    this.initGame();
  },
  methods: {
    ...mapActions('game', ['initGame', 'restart', 'spawn', 'handleDrop']),
    onDragStart(position) {
      this.dragged = position;
    },
    onDrop(positionTo) {
      if (!this.dragged) return;
      this.handleDrop({positionFrom: this.dragged, positionTo});
      this.dragged = null;
    }
  }
}
</script>
<style scoped lang="scss">
.game-board {
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: white;

  &--score {
    font-size: 20px;
  }

  &--grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: #0f172a;
    padding: 12px;
    border-radius: 12px;
  }

  &--row {
    display: flex;
    gap: 10px;
  }

  &--btn {
    padding: 8px;
    border-radius: 6px;
    background: #22c55e;
    color: white;
    border: none;
    cursor: pointer;
  }
}
</style>