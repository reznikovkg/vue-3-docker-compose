<template>
  <div class="artillery-strike" :style="strikeStyle">
    <div class="artillery-strike__explosion" :style="explosionStyle"></div>
    <div class="artillery-strike__shockwave" :style="shockwaveStyle"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { Point } from '@/shared/models';

export interface ArtilleryStrikeProps {
  position: Point;
  maxRadius: number;
  elapsed: number;
  duration: number;
}

const props = defineProps<ArtilleryStrikeProps>();

const progress = computed(() => Math.min(1, props.elapsed / props.duration));

const strikeStyle = computed(() => ({
  left: `${props.position.x}px`,
  top: `${props.position.y}px`,
}));

const currentRadius = computed(() => props.maxRadius * progress.value);

const explosionStyle = computed(() => {
  const opacity = 1 - progress.value;
  return {
    'width': `${currentRadius.value * 2}px`,
    'height': `${currentRadius.value * 2}px`,
    'margin-left': `-${currentRadius.value}px`,
    'margin-top': `-${currentRadius.value}px`,
    'opacity': opacity,
    'background': `radial-gradient(circle,
      rgba(255, 100, 0, ${opacity}) 0%,
      rgba(255, 150, 0, ${opacity * 0.7}) 40%,
      rgba(255, 200, 0, ${opacity * 0.3}) 70%,
      transparent 100%)`,
  };
});

const shockwaveStyle = computed(() => {
  const opacity = (1 - progress.value) * 0.5;
  return {
    'width': `${currentRadius.value * 2.2}px`,
    'height': `${currentRadius.value * 2.2}px`,
    'margin-left': `-${currentRadius.value * 1.1}px`,
    'margin-top': `-${currentRadius.value * 1.1}px`,
    'opacity': opacity,
    'border': `2px solid rgba(255, 150, 0, ${opacity})`,
  };
});
</script>

<style lang="scss">
.artillery-strike {
  position: absolute;
  z-index: calc($z-tower + 2);
  pointer-events: none;

  &__explosion {
    position: absolute;
    border-radius: 50%;
    animation: explode 1s ease-out;
  }

  &__shockwave {
    position: absolute;
    border-radius: 50%;
    animation: shockwave 1s ease-out;
  }
}

@keyframes explode {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes shockwave {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}
</style>
