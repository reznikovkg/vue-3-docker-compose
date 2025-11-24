<template>
  <div class="location-selector">
    <h2 class="location-selector__title">🌊 Выберите водоем</h2>
    <div class="location-selector__list">
      <div
        v-for="location in locations"
        :key="location.id"
        class="location-selector__card"
        @click="goToLocation(location)"
      >
        <div class="location-image" :style="{ backgroundImage: `url(${location.image})` }">
          <div class="location-overlay">
            <h3>{{ location.name }}</h3>
            <p>{{ location.description }}</p>
            <div class="fish-preview">
              <span v-for="fish in location.fish" :key="fish.name" class="fish-emoji">
                {{ fish.emoji }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Location } from '../types'

const router = useRouter()

defineProps<{
  locations: Location[]
}>()

const goToLocation = (location: Location) => {
  console.log('Navigating to location:', location.id, location.name)
  router.push(`/location/${location.id}`)
}
</script>

<style scoped lang="less">
@primary-color: #4CAF50;
@text-color: #333;
@card-hover-color: #4CAF50;

.location-selector {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
  height: fit-content;

  h2 {
    margin-bottom: 15px;
    color: @text-color;
  }
}

.location-selector__list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.location-selector__card {
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 3px solid transparent;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    border-color: @card-hover-color;
  }
}

.location-image {
  height: 100px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.location-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  color: white;
  padding: 10px;

  h3 {
    margin-bottom: 5px;
    font-size: 1em;
  }

  p {
    font-size: 0.7em;
    opacity: 0.9;
    margin-bottom: 5px;
  }
}

.fish-preview {
  display: flex;
  gap: 5px;
}

.fish-emoji {
  font-size: 0.8em;
}
</style>