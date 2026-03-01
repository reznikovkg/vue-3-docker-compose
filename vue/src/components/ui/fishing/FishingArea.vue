<template>
  <div
    :class="['fishing-area', { 'fishing-area--rod-cursor': showRodCursor }]"
    @click="() => onClick()"
  ></div>
</template>

<script setup>
defineProps(['onClick', 'showRodCursor'])
</script>

<style scoped lang="scss">
.fishing-area {
  position: absolute;
  inset: 50% 0 0 0;

  &--rod-cursor {
    cursor:
      url('/rod-cursor.webp') 12 12,
      pointer;
  }
}
</style>
