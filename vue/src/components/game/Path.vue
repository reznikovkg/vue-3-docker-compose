<template>
  <svg class="path" viewBox="0 0 800 600" preserveAspectRatio="none">
    <polygon class="path__fill" :points="pathPoints" />
    <polygon class="path__stroke" :points="pathPoints" />
  </svg>
</template>

<script setup>
defineProps({
  pathPoints: String
})
</script>

<style scoped lang="scss">
.path {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;

  &__fill {
    fill: #8B7355;
    fill-opacity: 0.6;
  }

  &__stroke {
    fill: none;
    stroke: #5D4037;
    stroke-width: 2;
    stroke-dasharray: 5, 5;
  }
}
</style>