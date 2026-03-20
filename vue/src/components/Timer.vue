<template>
  <div class="timer">
    {{formattedTime}}
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const seconds = ref(0)
let interval = null;

const formattedTime = computed(() => {
  const mins = Math.floor(seconds.value / 60)
  const secs = seconds.value % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

const start = () => {
  if (interval) clearInterval(interval)
  interval = setInterval(() => {
    seconds.value++
  }, 1000)
}

const stop = () => {
  if (interval) {
    clearInterval(interval)
    interval = null
  }
}

const reset = () => {
  seconds.value = 0
}

onMounted(() => {
  start()
})

defineExpose({
  start,
  stop,
  reset,
  getTime: () => seconds.value
})
</script>

<style scoped lang="scss">
$main-color: color;

.timer {
  font-size: 18px;
  font-weight: bold;
  color: $main-color;
  padding: 8px 16px;
  display: inline-block;
  margin: 10px auto;
}
</style>