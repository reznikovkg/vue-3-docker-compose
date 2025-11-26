<template>
  <div
    class="gem"
    :class="[
      {
      'gem--selected': gem.selected,
      'gem--removing': gem.removing,
      'gem--new': gem.isNew,
      },
      `gem-swapped--${gem.swapDirection}`
    ]"
    :style="{ backgroundColor: gem.color }"
    @click="() => handleClick()"
    @mousedown="() => handleMousedown()"
    @mousemove="() => handleMousemove()"
    @mouseup="() => handleMouseup()"
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
  (e: 'click', gem: Gem): void
  (e: 'mousedown', gem: Gem): void
  (e: 'mousemove', gem: Gem): void
  (e: 'mouseup', gem: Gem): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const gem = computed(() => props.gem)

const handleClick = () => {
  emit('click', gem.value)
}

const handleMousedown = () => {
  emit('mousedown', gem.value)
}

const handleMousemove = () => {
  emit('mousemove', gem.value)
}

const handleMouseup = () => {
  emit('mouseup', gem.value)
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
  position: relative;

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

  &.gem-swapped {
    position: relative;
    z-index: 1;
    transition: all .35s ease-in-out;
    transform: scale(1) translate(0);
    pointer-events: auto;

    &--right {
      pointer-events: none;
      z-index: 2;
      transform: scale(1) translateX(58px);
    }

    &--left {
      pointer-events: none;
      z-index: 2;
      transform: scale(1) translateX(-58px);
    }

    &--up {
      pointer-events: none;
      z-index: 2;
      transform: scale(1) translateY(-58px);
    }

    &--down {
      pointer-events: none;
      z-index: 2;
      transform: scale(1) translateY(58px);
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
