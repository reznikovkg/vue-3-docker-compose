<template>
  <div class="info-display">
    <h2>Информация</h2>
    <div class="info-display__section">
      <h3>Координаты лодки</h3>
      <p>X: {{ boatCoordinates.x }}</p>
      <p>Y: {{ boatCoordinates.y }}</p>
    </div>
    <div class="info-display__section">
      <h3>Зона ловли</h3>
      <p class="info-display__zone-info" :class="`info-display__zone-info--${fishingZone}`">
        {{ zoneName }}
      </p>
      <p class="info-display__zone-description">{{ zoneDescription }}</p>
    </div>
    <div class="info-display__section">
      <h3>Инвентарь</h3>
      <p>Рыб поймано: {{ inventoryCount }}</p>
    </div>
    <div class="info-display__section">
      <h3>Управление</h3>
      <p>🔼 W / ↑ - Вверх</p>
      <p>🔽 S / ↓ - Вниз</p>
      <p>◀️ A / ← - Влево</p>
      <p>▶️ D / → - Вправо</p>
      <p>Пробел - Ловить</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const boatCoordinates = computed(() => store.getters['game/getBoatCoordinates'])
const fishingZone = computed(() => store.getters['game/fishingZone'])
const inventoryCount = computed(() => store.getters['game/getInventoryCount'])

const zoneName = computed(() => {
  switch (fishingZone.value) {
    case 'low':
      return 'Низкий'
    case 'medium':
      return 'Средний'
    case 'high':
      return 'Высокий'
    default:
      return 'Неизвестно'
  }
})

const zoneDescription = computed(() => {
  switch (fishingZone.value) {
    case 'low':
      return 'Клев через 5 сек'
    case 'medium':
      return 'Клев через 3 сек'
    case 'high':
      return 'Клев через 1 сек'
    default:
      return ''
  }
})
</script>

<style scoped>
.info-display {
  width: 100%;
  height: 100%;
  border: 2px solid #333;
  background-color: #f9f9f9;
  padding: 15px;
  overflow-y: auto;
  box-sizing: border-box;
}

.info-display h2 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 20px;
  text-align: center;
  border-bottom: 2px solid #333;
  padding-bottom: 10px;
}

.info-display__section {
  margin-bottom: 20px;
  padding: 10px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-display__section h3 {
  margin: 0 0 10px 0;
  color: #555;
  font-size: 16px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 5px;
}

.info-display__section p {
  margin: 5px 0;
  color: #666;
  font-size: 14px;
}

.info-display__zone-info {
  font-weight: bold;
  font-size: 16px;
  padding: 5px;
  border-radius: 3px;
  text-align: center;
}

.info-display__zone-info--low {
  background-color: #87ceeb;
  color: white;
}

.info-display__zone-info--medium {
  background-color: #ffd700;
  color: #333;
}

.info-display__zone-info--high {
  background-color: #32cd32;
  color: white;
}

.info-display__zone-description {
  font-style: italic;
  text-align: center;
  color: #888;
}
</style>
