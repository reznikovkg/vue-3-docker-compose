<template>
  <div class="game-page">
    <div class="game-page__container">
      <div class="game-page__area">
        <GameGrid :gridSizeX="gridSizeX" :gridSizeY="gridSizeY" />
      </div>
      <div class="game-page__controls">
        <div class="game-page__stats">
          <div class="game-page__stat">
            <span class="game-page__stat-label">Баланс:</span>
            <span class="game-page__stat-value">{{ parkBalance }}</span>
          </div>
          <div class="game-page__stat">
            <span class="game-page__stat-label">Посетители:</span>
            <span class="game-page__stat-value">{{ visitorsCount }} / {{ maxVisitors }}</span>
          </div>
        </div>
        <div class="game-page__settings">
          <label class="game-page__label">
            Ширина (X):
            <input 
              v-model.number="gridSizeX" 
              type="number" 
              min="4" 
              max="20"
              class="game-page__input"
              @change="() => init()"
            >
          </label>
          <label class="game-page__label">
            Высота (Y):
            <input 
              v-model.number="gridSizeY" 
              type="number" 
              min="4" 
              max="20"
              class="game-page__input"
              @change="() => init()"
            >
          </label>
        </div>
        <div class="game-page__road-controls">
          <button 
            class="game-page__road-btn"
            :class="{ 'game-page__road-btn--active': isRoadMode }"
            @click="() => toggleRoadMode()"
          >
            {{ isRoadMode ? 'Отменить дороги' : 'Добавить дорогу' }}
          </button>
          <div v-if="isRoadMode" class="game-page__road-hint">
            Кликните на клетку для добавления/удаления дороги
          </div>
        </div>
        <ModeSwitcher />
        <ShapePicker />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import GameGrid from '../GameGrid.vue'
import ShapePicker from '../ShapePicker.vue'
import ModeSwitcher from '../ModeSwitcher.vue'

const store = useStore()

const gridSizeX = ref(8)
const gridSizeY = ref(8)

const isRoadMode = computed(() => store.getters.getIsRoadMode)
const parkBalance = computed(() => store.getters.getParkBalance)
const visitorsCount = computed(() => store.getters.getVisitorsCount)
const maxVisitors = computed(() => store.getters.getMaxVisitors)

const init = () => {
  store.dispatch('initializeGrid', {
    gridSizeX: gridSizeX.value,
    gridSizeY: gridSizeY.value
  })
}

const toggleRoadMode = () => {
  store.dispatch('setRoadMode', !isRoadMode.value)
}

onMounted(() => {
  init()
})
</script>

<style scoped lang="less">
.game-page {
  font-family: Arial, sans-serif;
  background: #f0f8ff;
  min-height: 100vh;
  padding: 20px;

  &__container {
    display: flex;
    max-width: 1200px;
    margin: 0 auto;
    gap: 150px;
    align-items: flex-start;
  }

  &__area {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__controls {
    width: 500px;
    background: rgb(190, 228, 227);
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  &__stats {
    margin-bottom: 20px;
    padding: 15px;
    background: white;
    border-radius: 8px;
  }

  &__stat {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  &__stat-label {
    font-weight: bold;
  }

  &__stat-value {
    color: #2E7D32;
    font-weight: bold;
  }

  &__settings {
    margin-bottom: 20px;
    padding: 15px;
    background: white;
    border-radius: 8px;
  }

  &__label {
    display: block;
    margin-bottom: 10px;
    font-weight: bold;
  }

  &__input {
    margin-left: 10px;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 60px;
  }

  &__road-controls {
    margin-bottom: 20px;
    padding: 15px;
    background: white;
    border-radius: 8px;
  }

  &__road-btn {
    width: 100%;
    padding: 12px;
    border: 2px solid #b0c4de;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;

    &:hover {
      background: #f5f5f5;
    }

    &--active {
      background: #ff9800;
      color: white;
      border-color: #ff9800;
    }
  }

  &__road-hint {
    margin-top: 10px;
    font-size: 12px;
    color: #666;
    text-align: center;
  }
}
</style>