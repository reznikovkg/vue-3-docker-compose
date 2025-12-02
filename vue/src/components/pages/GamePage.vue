<template>
  <div class="game-page">
    <div class="game-page__container">
      <div class="game-page__area">
        <GameGrid />
      </div>
      <div class="game-page__controls">
        <div class="game-page__stats">
          <div class="game-page__stat">
            <span class="game-page__stat-label">Баланс:</span>
            <span class="game-page__stat-value">{{ parkBalance }}</span>
          </div>
          <div class="game-page__stat">
            <span class="game-page__stat-label">Посетители:</span>
            <span class="game-page__stat-value">{{ visitorsCount }} / {{ maxVisitorsWithBonus }}</span>
          </div>
          <div class="game-page__stat">
            <span class="game-page__stat-label">Уровень зданий:</span>
            <span class="game-page__stat-value">{{ upgrades.buildings }}</span>
          </div>
          <div class="game-page__stat">
            <span class="game-page__stat-label">Уровень дорог:</span>
            <span class="game-page__stat-value">{{ upgrades.roads }}</span>
          </div>
          <div class="game-page__stat">
            <span class="game-page__stat-label">Уровень карты:</span>
            <span class="game-page__stat-value">{{ upgrades.map }}</span>
          </div>
          <div class="game-page__stat">
            <span class="game-page__stat-label">Размер карты:</span>
            <span class="game-page__stat-value">{{ storeGridSizeX }}x{{ storeGridSizeY }}</span>
          </div>
        </div>
        
        <div class="game-page__upgrades">
          <h3 class="game-page__upgrade-title">Улучшения</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <button 
            class="game-page__upgrade-btn"
            @click="() => upgradeBuildings()"
            :disabled="upgrades.buildings >= 3"
          >
            Улучшить здания ({{ buildingUpgradeCost }})
            <div class="game-page__upgrade-desc">
              Уровень {{ upgrades.buildings }} → {{ upgrades.buildings + 1 }}<br>
              Доход ×1.5, вместимость +1
            </div>
          </button>
          <button 
            class="game-page__upgrade-btn"
            @click="() => upgradeRoads()"
            :disabled="upgrades.roads >= 3"
          >
            Улучшить дороги ({{ roadUpgradeCost }})
            <div class="game-page__upgrade-desc">
              Уровень {{ upgrades.roads }} → {{ upgrades.roads + 1 }}<br>
              Бонус посетителей: +{{ getNextRoadBonus() }}
            </div>
          </button>
          <button 
            class="game-page__upgrade-btn"
            @click="() => upgradeMap()"
            :disabled="upgrades.map >= 3"
          >
            Улучшить карту ({{ mapUpgradeCost }})
            <div class="game-page__upgrade-desc">
              Уровень {{ upgrades.map }} → {{ upgrades.map + 1 }}<br>
              Размер: {{ storeGridSizeX }}x{{ storeGridSizeY }} → {{ getNextMapSize() }}
            </div>
          </button>
        </div>
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

const isRoadMode = computed(() => store.getters.getIsRoadMode)
const parkBalance = computed(() => store.getters.getParkBalance)
const visitorsCount = computed(() => store.getters.getVisitorsCount)
const maxVisitors = computed(() => store.getters.getMaxVisitors)
const upgrades = computed(() => store.getters.getUpgrades)
const roadCapacityBonus = computed(() => store.getters.getRoadCapacityBonus)
const storeGridSizeX = computed(() => store.getters.getGridSizeX)
const storeGridSizeY = computed(() => store.getters.getGridSizeY)

const maxVisitorsWithBonus = computed(() => maxVisitors.value + roadCapacityBonus.value)

const buildingUpgradeCost = computed(() => {
  switch (upgrades.value.buildings) {
    case 1: return 200
    case 2: return 400
    default: return 0
  }
})

const roadUpgradeCost = computed(() => {
  switch (upgrades.value.roads) {
    case 1: return 100
    case 2: return 300
    default: return 0
  }
})

const mapUpgradeCost = computed(() => {
  switch (upgrades.value.map) {
    case 1: return 300
    case 2: return 600
    default: return 0
  }
})

const getNextRoadBonus = () => {
  switch (upgrades.value.roads) {
    case 1: return '1 за дорогу'
    case 2: return '2 за дорогу'
    default: return 'макс.'
  }
}

const getNextMapSize = () => {
  const nextX = storeGridSizeX.value + 2
  const nextY = storeGridSizeY.value + 2
  return `${nextX}x${nextY}`
}

const init = () => {
  store.dispatch('initializeGrid')
}

const toggleRoadMode = () => {
  store.dispatch('setRoadMode', !isRoadMode.value)
}

const upgradeBuildings = () => {
  if (upgrades.value.buildings < 3) {
    store.dispatch('upgradeBuildings', buildingUpgradeCost.value)
  }
}

const upgradeRoads = () => {
  if (upgrades.value.roads < 3) {
    store.dispatch('upgradeRoads', roadUpgradeCost.value)
  }
}

const upgradeMap = () => {
  if (upgrades.value.map < 3) {
    store.dispatch('upgradeMap', mapUpgradeCost.value)
  }
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
  
  &__upgrades {
    margin-bottom: 20px;
    padding: 10px;
    background: white;
    border-radius: 8px;
  }

  &__upgrade-title {
    margin: 0 0 10px 0;
    font-size: 16px;
    font-weight: bold;
    color: #333;
    text-align: center;
  }

  &__upgrade-btn {
    padding: 8px;
    border: 1px solid #b0c4de;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.3s ease;
    text-align: left;
    margin-bottom: 8px;

    &:hover:not(:disabled) {
      background: #f5f5f5;
      border-color: #8fa8d1;
    }

    &:disabled {
      background: #e0e0e0;
      color: #9e9e9e;
      cursor: not-allowed;
      border-color: #ccc;
    }

    &:not(:disabled):active {
      background: #e3eaf3;
    }
  }

  &__upgrade-desc {
    margin-top: 4px;
    font-size: 10px;
    color: #666;
    line-height: 1.2;
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