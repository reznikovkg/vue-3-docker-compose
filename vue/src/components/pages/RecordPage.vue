<template>
  <div class="controls">
    <h1>Рекорды</h1>
    <div
        v-for="(time, index) in recs"
        :key="index"
        class="control-row"
    >
      {{ index + 1 }}
      <span class="record-time">{{ formatTime(time) }}</span>
    </div>
  </div>
  <RouterLink :to="{ name: $routes.INDEX }">Назад</RouterLink>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const recs = computed(() => store.getters.getRecords)

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
$main-color: gold;

.controls {
  text-align: center;
  padding: 20px;
  gap: 15px;
  display: flex;
  flex-direction: column;
  font-size: 16px;
  align-items: center;
}
.control-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  width: 400px;
}
.record-time {
  font-size: 18px;
  font-weight: bold;
  color: $main-color
}
</style>