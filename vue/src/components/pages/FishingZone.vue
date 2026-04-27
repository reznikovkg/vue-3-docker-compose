<template>
  <div class="fishing-zone">
    <h3> Текущее место</h3>
    <div class="zone-card" :style="{ borderColor: currentZone.color }">
      <div class="zone-name">{{ currentZone.name }}</div>
      <div class="zone-desc">{{ getDescription }}</div>
    </div>
    <button @click="$emit('startFishing')" :disabled="isFishing" class="fish-button">
      {{ isFishing ? ' Ловим...' : ' Начать ловить!' }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentZone: Object,
  isFishing: Boolean
})

defineEmits(['startFishing'])

const getDescription = computed(() => {
  if (props.currentZone?.delay === 0) return ' Клюёт мгновенно!'
  if (props.currentZone?.delay < 1500) return ' Клюёт быстро'
  return 'Нужно подождать...'
})
</script>

<style scoped>
.fishing-zone {
  background: #1e2a1c;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
}

.zone-card {
  padding: 12px;
  border-radius: 12px;
  background: #2b3b26;
  margin: 12px 0;
  border-left: 5px solid;
}

.zone-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffefb9;
}

.zone-desc {
  font-size: 0.9rem;
  color: #ccc;
}

.fish-button {
  width: 100%;
  padding: 12px;
  background: #e0b354;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.fish-button:active {
  transform: scale(0.98);
}

.fish-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>