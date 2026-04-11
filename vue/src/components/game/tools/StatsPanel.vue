<template>
  <div class="stats">
    <div class="stats__item">Balance {{ stats.balance }}</div>
    <div class="stats__item">Buildings {{ stats.buildingsCount }}</div>
    <div class="stats__item">Roads {{ stats.roadsCount }}</div>
    <div class="stats__item">Visitors {{ stats.visitorsCount }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const stats = computed(() => store.getters.stats)
</script>

<style scoped lang="less">
.stats {
  display: flex;
  gap: 12px;
  padding: 10px;
  background: #222;
  color: white;
  border-radius: 8px;

  &__item {
    font-size: 14px;
  }
}
</style>
