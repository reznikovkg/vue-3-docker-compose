<template>
  <div
    class="enemy"
    :class="{ enemy_selected: selected }"
    :style="enemyStyle"
    @click.stop="handleClick"
  >
    <div class="enemy__health-bar" :style="{ width: `${health}%` }"></div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';

import { Point } from '@/shared/models';

export interface EnemyProps {
  position: Point;
  selected: boolean;
  health: number;
}

const props = defineProps<EnemyProps>();

const ENEMY_SIZE = 30;
const ENEMY_HALF_SIZE = ENEMY_SIZE / 2;

const enemyStyle = computed(() => ({
  'block-size': `${ENEMY_SIZE}px`,
  'inline-size': `${ENEMY_SIZE}px`,
  'left': `${props.position.x - ENEMY_HALF_SIZE}px`,
  'top': `${props.position.y - ENEMY_HALF_SIZE}px`,
  'background-color': `rgba(128, 128, 128, ${props.health / 100})`,
}));

const emit = defineEmits(['click']);

const handleClick = () => {
  emit('click');
};
</script>

<style lang="scss">
.enemy {
  position: absolute;
  border-radius: 30%;
  border: 2px solid transparent;
  opacity: 1;
  cursor: pointer;
  z-index: $z-enemy;
  top: 0;
  left: 0;
  transition:
    transform 0.2s,
    border-color 0.2s,
    opacity 0.2s;

  &_selected {
    transform: scale(1.2);
    border-color: #3d4643cc;
    opacity: 0.9;
  }

  &__health-bar {
    position: absolute;
    top: -5px;
    left: 0;
    block-size: 4px;
    border-radius: 3px;
    background-color: #0bc27fcc;
  }
}
</style>
