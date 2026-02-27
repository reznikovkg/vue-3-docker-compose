<template>
  <div class="location-list">
    <h2 class="locations-title">Выбор локации</h2>
    <div class="locations-scroll">
      <div class="location-item" v-for="location in locations"
        @click="() => selectLocation(location)"
      >
        <img class="location-image" :src="'/images/' + location.image" alt="Горы">
        <div class="location-info">
          <div class="location-name">{{ location.name }}</div>
        </div>
      </div>

      <button class="close-btn" @click="() => closeButton()">✕</button>
    </div>
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

.locations-scroll {
  max-height: 600px;
  overflow-y: auto;
  padding-right: 15px;
}

.locations-title {
  text-align: center;
}

.location-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
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

.close-btn {
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
}
</style>
