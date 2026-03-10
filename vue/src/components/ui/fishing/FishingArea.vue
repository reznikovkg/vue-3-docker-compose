<template>
  <div class="fishing-area" @click="(event) => onClick(event)"></div>
</template>

<script setup>
defineProps(['onClick'])
</script>

<style scoped lang="scss">
.fishing-area {
  position: absolute;
  inset: 50% 0 0 0;

  cursor:
    url('/rod-cursor.webp') 12 12,
    pointer;
}
</style>
