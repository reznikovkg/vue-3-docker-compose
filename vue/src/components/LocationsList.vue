<template>
  <div class="location-list">
    <h2 class="location-list__title">Выбор локации</h2>
    
    <div class="location-list__scroll">
      <div 
        class="location-item" 
        v-for="location in locations"
        :key="location.id"
        @click="() => selectLocation(location)"
      >
        <img 
          class="location-item__image" 
          :src="'/images/' + location.image" 
          :alt="location.name"
        >
        <div class="location-item__info">
          <div class="location-item__name">{{ location.name }}</div>
        </div>
      </div>
    </div>

    <button class="location-list__close" @click="() => closeButton()">✕</button>
  </div>
</template>

<script setup>
import { getLocations } from '../content/locations'
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const locations = computed(() => getLocations())

const emit = defineEmits(['close'])

const closeButton = () => {
  emit('close')
}

const router = useRouter()
const selectLocation = (location) => {
  router.push('/location/' + location.id)
}
</script>

<style scoped>
.location-list {
  background-color: gray;
  width: 900px;
  color: black;
}

.location-list__title {
  text-align: center;
}

.location-list__scroll {
  max-height: 600px;
  overflow-y: auto;
  padding-right: 15px;
}

.location-list__close {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  color: black;
  background: rgba(255, 255, 255, 0.3);
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
}

.location-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px;
  margin-bottom: 15px;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
}

.location-item__image {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.location-item__info {
  flex: 1;
}

.location-item__name {
  font-weight: bold;
}
</style>