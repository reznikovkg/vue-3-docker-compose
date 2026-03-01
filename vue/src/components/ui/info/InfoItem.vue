<template>
  <div class="info-item">
    <span class="info-item__label">{{ label }}&nbsp;</span>
    <span class="info-item__text">{{ text }}</span>
  </div>
</template>

<script setup>
defineProps(['label', 'text'])
</script>

<style scoped lang="scss">
.info-item {
  padding: 0.5rem;

  &:not(:last-child) {
    border-bottom: 1px solid rgb(100, 100, 100);
  }

  &__text {
    font-weight: bold;
  }
}
</style>
