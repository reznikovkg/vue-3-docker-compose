<template>
  <div 
    class="grid" 
    :style="{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }"
  >
    <div
      v-for="(cell, index) in flatGrid"
      :key="index"
      class="grid__cell"
      :class="[
        cell ? `grid__cell--${cell.branch}` : 'grid__cell--empty',
        { 'grid__cell--max': cell && cell.level >= maxLevel }
      ]"      
      :data-index="index"
      :draggable="!!cell"
      :title="cell && cell.level >= maxLevel ? 'Клик — получить новый элемент (5 очков)' : ''"
      @dragstart="($event) => onDragStart($event, index, cell)"
      @dragover.prevent
      @drop.prevent="($event) => onDrop($event, index)"
      @click="() => onCellClick(index, cell)"
      @contextmenu.prevent="($event) => onSell($event, index, cell)"
    >
      <div
        v-if="cell"
        class="grid__cell-content"
      >                                     
        <img
          class="grid__img"
          :src="cellEmoji(cell.branch, cell.level)"
          :alt="`${cell.branch} ${cell.level}`"
        />
     </div>
   </div>
  </div>
</template>

<script>
export default {
  name: 'GameGrid',
  props: {
    grid: Array,
    gridSize: Number,
    maxLevel: Number,
    cellEmoji: Function
  },
  emits: ['drag-start', 'drop', 'spawn-from-max', 'sell'],
  
  computed: {
    flatGrid() {
      return this.grid || []
    }
  },
  methods: {
     onDragStart(e, index, cell) {
      if (cell) {
        this.$emit('drag-start', { index, cell })
      }
    },
    onDrop(e, index) {
        this.$emit('drop', { index })
    },
    onCellClick (index, cell) {
      if (cell && cell.level >= this.maxLevel) {
        this.$emit('spawn-from-max', index)
      }
    },
    onSell (e, index, cell) {
      if (cell) {
        this.$emit('sell', { index, cell })
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

  &__cell {
    position: relative;
    aspect-ratio: 1;
    width: 100%;         
    overflow: hidden;
    background: white;
    border-radius: 4px;
    border: 1px solid #ccc;

    &--empty {
      background: #f0f0f0;
    }

    &--fruits {
      background: #fdecea;
      color: #c62828;
    }

    &--spring {
      background: #eaf4fd;
      color: #0277bd;
    }

    &--max {
      box-shadow: 0 0 8px 2px gold;
      cursor: zoom-in;
    }
    
    &-content {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  }
    
  &__img {
    width: 100%;
    height: 100%;
    object-fit: contain;     
    image-rendering: auto;
  }
}
</style>