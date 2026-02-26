<template>
  <div
    class="c-game-cell"
    :class="{
      'c-game-cell--draggable': item,
      'c-game-cell--dragging': isDragging && item,
      'c-game-cell--empty': !item
    }"
    :data-index="index"
    :draggable="!!item && !isDragging"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @dragover.prevent
    @drop="onDrop"
    @touchstart="onTouchStart"
    @touchmove.prevent="onTouchMove"
    @touchend="onTouchEnd"
  >
    <span v-if="item" class="c-game-cell__letter" :class="`c-game-cell__letter--tier-${item.tier}`">
      {{ item.value }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'GameCell',

  props: {
    item: {
      type: Object,
      default: null
    },
    index: {
      type: Number,
      required: true
    },
    isDragging: {
      type: Boolean,
      default: false
    }
  },

  emits: ['drag-start', 'drag-end', 'drop', 'touch-move', 'touch-end'],

  data() {
    return {
      longPressTimer: null
    }
  },

  methods: {
    onDragStart(event) {
      if (!this.item) return

      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', this.index.toString())

      const dragIcon = document.createElement('div')
      dragIcon.className = 'c-game-cell__drag-preview'
      dragIcon.textContent = this.item.value
      document.body.appendChild(dragIcon)
      event.dataTransfer.setDragImage(dragIcon, 25, 25)

      setTimeout(() => document.body.removeChild(dragIcon), 0)

      this.$emit('drag-start', this.item, this.index)
    },

    onDragEnd() {
      this.$emit('drag-end')
    },

    onDrop(event) {
      event.preventDefault()
      this.$emit('drop', this.index)
    },

    onTouchStart() {
      if (!this.item) return

      this.longPressTimer = setTimeout(() => {
        this.$emit('touch-move', this.index)
      }, 200)
    },

    onTouchMove(event) {
      if (!this.item) return

      clearTimeout(this.longPressTimer)

      const touch = event.touches[0]
      const element = document.elementFromPoint(touch.clientX, touch.clientY)
      const cellElement = element?.closest('.c-game-cell')

      if (cellElement) {
        const targetIndex = cellElement.dataset.index
        if (targetIndex !== undefined) {
          this.$emit('touch-move', parseInt(targetIndex))
        }
      }
    },

    onTouchEnd(event) {
      clearTimeout(this.longPressTimer)

      const touch = event.changedTouches[0]
      const element = document.elementFromPoint(touch.clientX, touch.clientY)
      const cellElement = element?.closest('.c-game-cell')

      if (cellElement) {
        const targetIndex = cellElement.dataset.index
        if (targetIndex !== undefined) {
          this.$emit('touch-end', event, parseInt(targetIndex))
        }
      }
    }
  }
}
</script>

<style lang="scss">
.c-game-cell {
  aspect-ratio: 1;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  user-select: none;
  touch-action: none;

  &--draggable {
    cursor: grab;

    &:active {
      cursor: grabbing;
    }
  }

  &--dragging {
    opacity: 0.5;
    transform: scale(0.95);
  }

  &--empty {
    background: #f8f8f8;
    border-style: dashed;
  }

  &__letter {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    transition: all 0.3s ease;

    &--tier-0 {
      color: #4a90e2;
      font-size: 28px;
    }

    &--tier-1 {
      color: #50c878;
      font-size: 32px;
      font-weight: 600;
    }

    &--tier-2 {
      color: #f5a623;
      font-size: 36px;
      font-weight: 600;
    }

    &--tier-3 {
      color: #e67e22;
      font-size: 40px;
      font-weight: 700;
    }

    &--tier-4 {
      color: #e74c3c;
      font-size: 44px;
      font-weight: 700;
    }

    &--tier-5 {
      color: #9b59b6;
      font-size: 48px;
      font-weight: 800;
    }

    &--tier-6 {
      color: #f1c40f;
      font-size: 52px;
      font-weight: 800;

    }

    &--tier-7 {
      color: #e74c3c;
      font-size: 56px;
      font-weight: 900;
    }
  }

  &__drag-preview {
    position: absolute;
    top: -1000px;
    width: 50px;
    height: 50px;
    background: #667eea;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    font-size: 24px;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
}


</style>