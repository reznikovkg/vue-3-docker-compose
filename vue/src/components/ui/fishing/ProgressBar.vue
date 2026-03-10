<template>
  <div v-if="show" :class="['progress-bar', `progress-bar--${type}`]">
    <div class="progress-bar__fill" :style="style"></div>
  </div>
</template>

<script setup>
defineProps(['show', 'style', 'type'])
</script>

<style scoped lang="scss">
.progress-bar {
  width: 100%;
  height: 16px;
  margin-bottom: 16px;
  background: #a6a6a6;
  border-radius: 16px;
  overflow: hidden;
  transition: width 0.1s linear;

  &__fill {
    width: 0%;
    height: 100%;
  }
}
</style>
