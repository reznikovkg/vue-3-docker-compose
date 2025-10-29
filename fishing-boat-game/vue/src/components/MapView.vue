<template>
  <div class="map-view-container">
    <div class="map-layer" :style="mapStyle">
      <div
        class="fishing-zone fishing-zone--medium"
        :style="getZoneStyle(mediumZone.x, mediumZone.y, mediumZone.radius)"
      ></div>
      <div
        class="fishing-zone fishing-zone--high"
        :style="getZoneStyle(highZone.x, highZone.y, highZone.radius)"
      ></div>
    </div>
    <div class="boat"></div>
    <div class="coordinates">
      X: {{ boatCoordinates.x }} / Y: {{ boatCoordinates.y }}
    </div>
    <div class="fishing-zone-display">
      Зона: {{ fishingZoneName }} ({{ fishingZone }})
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const boatCoordinates = computed(() => store.getters['game/getBoatCoordinates'])
const mediumZone = computed(() => store.getters['game/getMediumZone'])
const highZone = computed(() => store.getters['game/getHighZone'])
const fishingZone = computed(() => store.getters['game/fishingZone'])

const mapStyle = computed(() => {
  return {
    transform: `translate(calc(-50% + ${-boatCoordinates.value.x}px), calc(-50% + ${-boatCoordinates.value.y}px))`
  }
})

const getZoneStyle = (x: number, y: number, radius: number) => {
  return {
    width: `${radius * 2}px`,
    height: `${radius * 2}px`,
    left: `calc(50% + ${x - radius}px)`,
    top: `calc(50% + ${y - radius}px)`
  }
}

const fishingZoneName = computed(() => {
  switch (fishingZone.value) {
    case 'low':
      return 'Низкий'
    case 'medium':
      return 'Средний'
    case 'high':
      return 'Высокий'
    default:
      return ''
  }
})

const handleKeydown = (event: KeyboardEvent) => {
  const key = event.key.toLowerCase()
  const keys = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd']
  
  if (keys.includes(key)) {
    event.preventDefault()
    
    switch (key) {
      case 'arrowup':
      case 'w':
        store.dispatch('game/runMoveBoat', { x: 0, y: -10 })
        break
      case 'arrowdown':
      case 's':
        store.dispatch('game/runMoveBoat', { x: 0, y: 10 })
        break
      case 'arrowleft':
      case 'a':
        store.dispatch('game/runMoveBoat', { x: -10, y: 0 })
        break
      case 'arrowright':
      case 'd':
        store.dispatch('game/runMoveBoat', { x: 10, y: 0 })
        break
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.map-view-container {
  width: 100%;
  height: 100%;
  border: 2px solid #333;
  background-color: #87ceeb;
  position: relative;
  overflow: hidden;
  min-height: 400px;
  cursor: crosshair;
}

.map-layer {
  position: absolute;
  width: 300%;
  height: 300%;
  top: 50%;
  left: 50%;
  transform-origin: center center;
  transition: transform 0.1s linear;
  background-color: #87ceeb;
  z-index: 1;
}

.boat {
  width: 50px;
  height: 50px;
  background-color: #f00;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  border: 2px solid #8B0000;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.coordinates {
  position: absolute;
  top: 10px;
  left: 10px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 8px 12px;
  border-radius: 5px;
  z-index: 20;
  font-weight: bold;
  font-size: 14px;
}

.fishing-zone-display {
  position: absolute;
  top: 45px;
  left: 10px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 8px 12px;
  border-radius: 5px;
  z-index: 20;
  font-weight: bold;
  font-size: 14px;
}

.fishing-zone {
  position: absolute;
  border-radius: 50%;
  opacity: 0.6;
  z-index: 5;
  border: 3px solid rgba(255, 255, 255, 0.5);
  transition: opacity 0.3s;
}

.fishing-zone:hover {
  opacity: 0.8;
}

.fishing-zone--medium {
  background-color: #FFD700;
}

.fishing-zone--high {
  background-color: #32CD32;
}
</style>
