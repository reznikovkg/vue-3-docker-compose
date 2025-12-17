<template>
  <div class="fishing-location">
    <div class="fishing-location__header">
      <button class="fishing-location__back-button" @click="$router.push('/')">
        ← Назад к выбору
      </button>
      <h1 class="fishing-location__title">{{ location.name }}</h1>
    </div>

    <FishingArea
      :location="location"
      @catch-fish="handleCatchFish"
    />
  </div>
</template>

<script setup lang="ts">
import FishingArea from '../components/FishingArea.vue'
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const props = defineProps<{
  id: string | number
}>()

const store = useStore()
const router = useRouter()

const location = computed(() => {
  const loc = store.getters['fishing/getLocationById'](parseInt(String(props.id)))
  return loc || store.getters['fishing/getLocationById'](1)
})

const handleCatchFish = (fishData) => {
  const caughtFish = {
    ...fishData,
    timestamp: new Date().toLocaleTimeString()
  }

  store.dispatch('fishing/addFish', caughtFish)
}
</script>

<style scoped lang="less">
@button-bg: #6c757d;
@button-hover-bg: #5a6268;
@text-color: #333;
@border-color: #ddd;

.fishing-location {
  min-height: 100vh;

  &__header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    border: 1px solid @border-color;
  }

  &__back-button {
    background: @button-bg;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
      background: @button-hover-bg;
    }
  }

  &__title {
    color: @text-color;
    margin: 0;
  }
}

@media (max-width: 768px) {
  .fishing-location {
    &__header {
      flex-direction: column;
      gap: 10px;
      text-align: center;
    }
  }
}
</style>