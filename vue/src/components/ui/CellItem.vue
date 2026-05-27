<template>
  <div
    class="cell-item"
    :class="{ 'cell-item--empty': !item }"
    @dragover.prevent
    @drop.prevent="handleDrop"
  >
    <div
      v-if="item"
      class="cell-item__inner"
      draggable="true"
      @dragstart="handleDragStart"
      @click="handleClick"
      @contextmenu.prevent="handleRightClick"
    >
      <span
        class="cell-item__num"
        :class="`cell-item__num--branch-${item.branch} cell-item__num--lvl-${item.level}`"
      >
        {{ item.level }}
      </span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  item: { type: Object, default: null },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
})

const emit = defineEmits(['drag-start', 'drop', 'cell-click', 'cell-right-click'])

const handleDragStart = () => emit('drag-start', { x: props.x, y: props.y })
const handleDrop = () => emit('drop', { x: props.x, y: props.y })
const handleClick = () => emit('cell-click', { x: props.x, y: props.y, item: props.item })
const handleRightClick = () => emit('cell-right-click', { x: props.x, y: props.y })
</script>

<style scoped lang="scss">
.cell-item {
  width: 64px;
  height: 64px;
  background: #1e2a4a;
  border: 2px solid #2a3a5c;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  position: relative;
  flex-shrink: 0;

  &--empty {
    background: #141e38;
    border-style: dashed;
    border-color: #253050;
    cursor: default;
  }

  &__inner {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;

    &:active {
      cursor: grabbing;
    }
  }

  &__num {
    font-weight: bold;
    line-height: 1;
    pointer-events: none;

    &--lvl-1 { font-size: 26px; }
    &--lvl-2 { font-size: 34px; }
    &--lvl-3 { font-size: 42px; font-weight: 700; }
    &--lvl-4 { font-size: 50px; font-weight: 800; }

    &--branch-1 { color: #5dade2; }
    &--branch-2 { color: #58d68d; }
    &--branch-3 { color: #f0b27a; }
  }
}
</style>
