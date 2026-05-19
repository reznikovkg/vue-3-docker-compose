<template>
  <div
    class="cell-item"
    :class="{
      'cell-item--has-data': data,
      'cell-item--drag-active': isDrag && data,
      'cell-item--no-data': !data,
    }"
    data-cell
    :data-idx="idx"
    :draggable="!!data && !isDrag"
    @dragstart="(e) => handleDragStart(e)"
    @dragend="() => handleDragEnd()"
    @dragover.prevent
    @drop.prevent="() => handleDrop()"
    @touchstart="() => handleTouchStart()"
    @touchmove.prevent="(e) => handleTouchMove(e)"
    @touchend="(e) => handleTouchEnd(e)"
  >
    <span
      v-if="data"
      class="cell-item__num"
      :class="'cell-item__num--lvl-' + data.tier"
    >
      {{ data.val }}
    </span>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  data: { type: Object, default: null },
  idx: { type: Number, required: true },
  isDrag: { type: Boolean, default: false },
})

const emit = defineEmits([
  'start-drag',
  'stop-drag',
  'cell-drop',
  'cell-touch-move',
  'cell-touch-end',
])

const pressTimer = ref(null)

const handleDragStart = (e) => {
  if (!props.data) return

  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', String(props.idx))

  const preview = document.createElement('div')
  preview.className = 'cell-item__preview'
  preview.textContent = props.data.val
  document.body.appendChild(preview)
  e.dataTransfer.setDragImage(preview, 25, 25)
  setTimeout(() => preview.remove(), 0)

  emit('start-drag', props.data, props.idx)
}

const handleDragEnd = () => {
  emit('stop-drag')
}

const handleDrop = () => {
  emit('cell-drop', props.idx)
}

const handleTouchStart = () => {
  if (!props.data) return
  pressTimer.value = setTimeout(() => {
    emit('cell-touch-move', null, props.idx)
  }, 200)
}

const handleTouchMove = (e) => {
  if (!props.data) return
  clearTimeout(pressTimer.value)

  const t = e.touches[0]
  const el = document.elementFromPoint(t.clientX, t.clientY)
  const cellEl = el?.closest('[data-cell]')
  if (cellEl && cellEl.dataset.idx !== undefined) {
    emit('cell-touch-move', e, parseInt(cellEl.dataset.idx))
  }
}

const handleTouchEnd = (e) => {
  clearTimeout(pressTimer.value)

  const t = e.changedTouches[0]
  const el = document.elementFromPoint(t.clientX, t.clientY)
  const cellEl = el?.closest('[data-cell]')
  if (cellEl && cellEl.dataset.idx !== undefined) {
    emit('cell-touch-end', e, parseInt(cellEl.dataset.idx))
  }
}
</script>

<style lang="scss">
.cell-item {
  aspect-ratio: 1;
  background: #1e2a4a;
  border: 2px solid #2a3a5c;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s, opacity 0.15s;
  user-select: none;
  touch-action: none;
  position: relative;

  &--has-data {
    cursor: grab;
    &:active { cursor: grabbing; }
  }

  &--drag-active {
    opacity: 0.4;
    transform: scale(0.9);
  }

  &--no-data {
    background: #141e38;
    border-style: dashed;
    border-color: #253050;
  }

  &__num {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-weight: bold;
    transition: all 0.2s;

    &--lvl-0 {
      color: #5dade2;
      font-size: 26px;
    }
    &--lvl-1 {
      color: #58d68d;
      font-size: 30px;
    }
    &--lvl-2 {
      color: #f0b27a;
      font-size: 34px;
    }
    &--lvl-3 {
      color: #ec7063;
      font-size: 38px;
      font-weight: 700;
    }
    &--lvl-4 {
      color: #bb8fce;
      font-size: 42px;
      font-weight: 700;
    }
    &--lvl-5 {
      color: #48c9b0;
      font-size: 46px;
      font-weight: 800;
    }
    &--lvl-6 {
      color: #f7dc6f;
      font-size: 50px;
      font-weight: 800;
    }
    &--lvl-7 {
      color: #ff6b6b;
      font-size: 54px;
      font-weight: 900;
    }
  }

  &__preview {
    position: absolute;
    top: -9999px;
    width: 50px;
    height: 50px;
    background: #e74c3c;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    font-size: 22px;
    font-weight: bold;
    box-shadow: 0 3px 10px rgba(0,0,0,0.5);
  }
}
</style>
