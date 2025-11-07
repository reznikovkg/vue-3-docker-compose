<template>
  <div
    class="gem"
    :class="{
      'gem--selected': gem.selected,
      'gem--removing': gem.removing,
      'gem--new': gem.isNew
    }"
    :style="{ backgroundColor: gem.color }"
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

const props = defineProps<Props>()

const gem = computed(() => props.gem)
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
  cursor: pointer;
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
