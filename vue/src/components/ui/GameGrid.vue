<template>
  <div 
    class="grid" 
    :class="{ 'grid--disabled': gameOver }"
    :style="{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }"
  >
    <div
      v-for="(cell, index) in flatGrid"
      :key="index"
      class="grid__cell"
      :class="cell ? `grid__cell--${cell.level}` : 'grid__cell--empty'"
      :data-index="index"
      :draggable="!!cell && !gameOver"
      @dragstart="($event) => onDragStart($event, index, cell)"
      @dragover.prevent
      @drop.prevent="($event) => onDrop($event, index)"
    >
      {{ cell ? cell.level : '' }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'GameGrid',
  props: {
    grid: Array,
    gridSize: Number,
    draggedItem: Object,
    gameOver: Boolean
  },
  emits: ['drag-start', 'drop'],
  
  computed: {
    flatGrid() {
      return this.grid || []
    }
  },
  
  methods: {
     onDragStart(e, index, cell) {
      if (cell && !this.gameOver) {
        this.$emit('drag-start', { index, cell })
      }
    },
    
    onDrop(e, index) {
      if (!this.gameOver) {
        this.$emit('drop', { index })
      }
    }
  }
}
</script>

<style lang="scss">
.grid {
  display: grid;
  gap: 2px;
  background: #000;
  padding: 2px;
  border-radius: 8px;
  margin: 20px 0;

  &--disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &__cell {
    aspect-ratio: 1;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: bold;
    border-radius: 4px;
    border: 1px solid #ccc;

    &--empty {
      background: #f0f0f0;
    }

    &--1 { background: #ffcdd2; color: #c62828; }
    &--2 { background: #fff9c4; color: #fbc02d; }
    &--3 { background: #c8e6c9; color: #2e7d32; }
    &--4 { background: #b3e5fc; color: #0277bd; }
    &--5 { background: #e1bee7; color: #6a1b9a; }
    &--6 { background: #c0e8eb; color: #0099ff; }
    &--7 { background: #cbd17e; color: #f2ff00; }
    &--8 { background: #9ed4a3; color: #00ff11; }
    &--9 { background: #b0bbce; color: #0066ff; }
    &--10 { background: #ad6eb8; color: #9d00ff; }
  }
}
</style>