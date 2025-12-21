<template>
  <div class="barricade" :style="barricadeStyle">
    <div class="barricade__health-bar" :style="healthBarStyle"></div>
    <div class="barricade__body" :style="barricadeBodyStyle">
      <div class="barricade__texture"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { Point } from '@/shared/models';
import { BarricadeType } from '@/shared/types';

export interface BarricadeProps {
  position: Point;
  health: number;
  maxHealth: number;
  barricadeType: BarricadeType;
  size: number;
  width: number;
  angle?: number;
}

const props = withDefaults(defineProps<BarricadeProps>(), {
  angle: 0,
});

const BARRICADE_COLORS: Record<BarricadeType, string> = {
  wooden: 'rgba(139, 90, 43, 0.9)',
  stone: 'rgba(128, 128, 128, 0.9)',
  metal: 'rgba(80, 80, 90, 0.95)',
};

const HEALTH_BAR_COLORS: Record<BarricadeType, string> = {
  wooden: '#8b5a2bcc',
  stone: '#808080cc',
  metal: '#505a5acc',
};

const barricadeStyle = computed(() => ({
  left: `${props.position.x}px`,
  top: `${props.position.y}px`,
  width: `${props.width}px`,
  height: `${props.size}px`,
  transform: `translate(-50%, -50%) rotate(${props.angle}rad)`,
}));

const ratio = computed(() =>
  Math.max(0, Math.min(1, props.health / props.maxHealth))
);

const healthBarStyle = computed(() => ({
  'width': `${Math.round(ratio.value * 100)}%`,
  'background-color': HEALTH_BAR_COLORS[props.barricadeType],
}));

const barricadeBodyStyle = computed(() => ({
  'background-color': BARRICADE_COLORS[props.barricadeType],
  'opacity': ratio.value,
}));
</script>

<style lang="scss">
.barricade {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  position: absolute;
  z-index: $z-tower;
  top: 0;
  left: 0;

  &__body {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    border: 2px solid rgba(0, 0, 0, 0.3);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
    position: relative;
    overflow: hidden;
  }

  &__texture {
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 5px,
      rgba(0, 0, 0, 0.1) 5px,
      rgba(0, 0, 0, 0.1) 10px
    );
  }

  &__health-bar {
    block-size: 4px;
    border-radius: 3px;
    z-index: calc($z-tower + 1);
    position: absolute;
    top: -8px;
    left: 0;
  }
}
</style>
