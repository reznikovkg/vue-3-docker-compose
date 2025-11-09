<template>
  <div
    class="gem"
    draggable="true"
    :class="[
      {
      'gem--selected': gem.selected,
      'gem--removing': gem.removing,
      'gem--new': gem.isNew,
      },
      `gem-drag--${gem.dragDirection}`
    ]"
    :style="{ backgroundColor: gem.color }"
    @dragstart="(e) => handleDragstart(e)"
    @dragover="(e) => handleDrag(e)"
    @dragleave="(e) => handleDragleave(e)"
    @drop.prevent="(e) => handleDrop(e)"
  >
    <span class="gem__type">
      {{ gem.type }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { Gem } from '@/types/game'

interface Props {
  gem: Gem
}
interface Emits {
  (e: 'drag-start', gem: Gem): void
  (e: 'drop', gem: Gem): void
  (e: 'drag', gem: Gem): void
  (e: 'drag-leave', gem: Gem): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const gem = computed(() => props.gem)

const handleDragstart = (e: DragEvent) => {
  e.dataTransfer?.setData('text/plain', gem.value.id.toString())
  e.dataTransfer!.effectAllowed = 'move'
  emit('drag-start', gem.value)
}

const handleDrag = (e: DragEvent) => {
  e.dataTransfer!.dropEffect = 'move'
  emit('drag', gem.value)
}

const handleDrop = (e: DragEvent) => {
  emit('drop', gem.value)
}
const handleDragleave = (e: DragEvent) => {
  emit('drag-leave', gem.value)
}
</script>

<style lang="scss" scoped>
.gem {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border: 2px solid #333;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: grab;
  transition: all 0.3s ease;
  user-select: none;

  &:hover {
    transform: scale(1.05);
  }

  &--selected {
    border-color: #10b981;
    box-shadow: 0 0 0 2px #10b981;
    transform: scale(1.1);
  }

  &--removing {
    animation: removeAnimation 0.3s ease-out forwards;
  }

  &--new {
    animation: newAnimation 0.5s ease-out;
  }

  &.gem-drag {
    position: relative;
    z-index: 1;
    transition: all .35s ease-in-out;
    pointer-events: auto;

    &--right {
      pointer-events: none;
      z-index: 2;

      &:not(&:hover) {
        transform: translateX(-58px);
      }
    }

    &--left {
      pointer-events: none;
      z-index: 2;

      &:not(&:hover) {
        transform: translateX(58px);
      }
    }

    &--up {
      pointer-events: none;
      z-index: 2;

      &:not(&:hover) {
        transform: translateY(58px);
      }
    }

    &--down {
      pointer-events: none;
      z-index: 2;

      &:not(&:hover) {
        transform: translateY(-58px);
      }
    }
  }
}

@keyframes removeAnimation {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
}

@keyframes newAnimation {
  0% {
    transform: translateY(-30px);
    opacity: 0;
  }
  70% {
    transform: translateY(5px);
    opacity: 1;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
