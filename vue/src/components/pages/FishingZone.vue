<template>
  <div class="fishing-zone">
    <h3> Текущее место</h3>
    <div class="zone-card" :style="{ borderColor: currentZone.color }">
      <div class="zone-name">{{ currentZone.name }}</div>
      <div class="zone-desc">{{ getDescription }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  currentZone: Object,
  isFishing: Boolean
})

const emit = defineEmits(['startFishing'])

const getDescription = computed(() => {
  if (props.currentZone?.delay === 0) return 'Клюёт мгновенно!'
  if (props.currentZone?.delay < 1500) return 'Клюёт быстро'
  return 'Нужно подождать...'
})

const handleKeyPress = (event) => {
  if (event.code === 'Space' && !props.isFishing) {
    event.preventDefault()
    emit('startFishing')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})
</script>

<style scoped>
.fishing-zone {
  background: #075ee2;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
}

.zone-card {
  padding: 12px;
  border-radius: 12px;
  background: #0db0d1;
  margin: 12px 0;
  border-left: 5px solid;
}

.zone-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: #1c0edc;
}

.zone-desc {
  font-size: 0.9rem;
  color: #ccc;
}

.fishing-status {
  text-align: center;
  padding: 12px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  font-size: 1.1rem;
  color: white;
}
</style>