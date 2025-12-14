<template>
  <div class="upgrades-panel">
    <h3 class="upgrades-panel__title">Улучшения</h3>
    <div class="upgrades-panel__horizontal">
      <div class="upgrades-panel__category" v-if="upgradableBuildings.length > 0">
        <h4 class="upgrades-panel__category-title">Здания</h4>
        <div class="upgrades-panel__items-list">
          <div v-for="building in upgradableBuildings" :key="building.id" class="upgrades-panel__item upgrades-panel__item--horizontal">
            <div class="upgrades-panel__header">
              <span class="upgrades-panel__building-name">{{ building.name }}</span>
              <span class="upgrades-panel__level">Ур. {{ getBuildingLevel(building.id) }}/3</span>
            </div>
            <div class="upgrades-panel__bonus-details" v-if="getBuildingBonus(building.id)">
              <span class="upgrades-panel__bonus">+{{ getBuildingBonusText(building.id) }}</span>
            </div>
            <div class="upgrades-panel__details">
              <span class="upgrades-panel__income">+{{ getBuildingIncome(building.id) }} ₽</span>
            </div>
            <button 
              v-if="getBuildingLevel(building.id) < 3"
              @click="upgradeBuilding(building.id)"
              class="upgrades-panel__btn upgrades-panel__btn--horizontal"
              :disabled="getUpgradeCost('building', getBuildingLevel(building.id)) > parkBalance"
              :title="`Улучшить за ${getUpgradeCost('building', getBuildingLevel(building.id))} ₽`"
            >
              {{ getUpgradeCost('building', getBuildingLevel(building.id)) }} ₽
            </button>
            <span v-else class="upgrades-panel__max-level upgrades-panel__max-level--horizontal">MAX</span>
          </div>
        </div>
      </div>
      <div class="upgrades-panel__category">
        <h4 class="upgrades-panel__category-title">Дороги</h4>
        <div class="upgrades-panel__items-list">
          <div class="upgrades-panel__item upgrades-panel__item--horizontal">
            <div class="upgrades-panel__header">
              <span class="upgrades-panel__road-title">Уровень дорог</span>
              <span class="upgrades-panel__level">Ур. {{ roadLevel }}/3</span>
            </div>
            <div class="upgrades-panel__details">
              <span class="upgrades-panel__visitors">{{ maxVisitors }} чел.</span>
            </div>
            <button 
              v-if="roadLevel < 3"
              @click="upgradeRoads"
              class="upgrades-panel__btn upgrades-panel__btn--horizontal"
              :disabled="getUpgradeCost('road', roadLevel) > parkBalance"
              :title="`Улучшить за ${getUpgradeCost('road', roadLevel)} ₽`"
            >
              {{ getUpgradeCost('road', roadLevel) }} ₽
            </button>
            <span v-else class="upgrades-panel__max-level upgrades-panel__max-level--horizontal">MAX</span>
          </div>
        </div>
      </div>
      <div class="upgrades-panel__category">
        <h4 class="upgrades-panel__category-title">Карта</h4>
        <div class="upgrades-panel__items-list">
          <div class="upgrades-panel__item upgrades-panel__item--horizontal">
            <div class="upgrades-panel__header">
              <span class="upgrades-panel__map-title">Размер поля</span>
              <span class="upgrades-panel__level">Ур. {{ mapLevel }}/3</span>
            </div>
            <div class="upgrades-panel__details">
              <span class="upgrades-panel__size">{{ gridWidth }}×{{ gridHeight }}</span>
            </div>
            <button 
              v-if="mapLevel < 3"
              @click="upgradeMap"
              class="upgrades-panel__btn upgrades-panel__btn--horizontal"
              :disabled="getUpgradeCost('map', mapLevel) > parkBalance"
              :title="`Расширить за ${getUpgradeCost('map', mapLevel)} ₽`"
            >
              {{ getUpgradeCost('map', mapLevel) }} ₽
            </button>
            <span v-else class="upgrades-panel__max-level upgrades-panel__max-level--horizontal">MAX</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const buildings = computed(() => store.getters.hasBuildings);
const parkBalance = computed(() => store.getters.getParkBalance);
const roadLevel = computed(() => store.getters.getRoadLevel);
const mapLevel = computed(() => store.getters.getMapLevel);
const gridWidth = computed(() => store.getters.getGridWidth);
const gridHeight = computed(() => store.getters.getGridHeight);
const maxVisitors = computed(() => store.getters.maxVisitors);

const upgradableBuildings = computed(() => {
  return buildings.value.filter(building => 
    building && building.price_for_visitor > 0 && building.type !== 'road' 
  );
});

const getBuildingLevel = (buildingId) => store.getters.getBuildingLevel(buildingId);
const getBuildingIncome = (buildingId) => store.getters.getBuildingIncome(buildingId);

const getBuildingBonus = (buildingId) => {
  return store.getters.getBuildingBonus(buildingId);
};

const getBuildingBonusText = (buildingId) => {
  const bonus = getBuildingBonus(buildingId);
  if (!bonus || Object.keys(bonus).length === 0) 
  {
    return '';
  }
  const bonusNames = {
    fatigue: 'Усталость',
    hunger: 'Голод',
    boredom: 'Скука',
    need: 'Нужда'
  };
  
  return Object.entries(bonus)
    .map(([stat, value]) => `${bonusNames[stat] || stat} ${value}`)
    .join(', ');
};

const getUpgradeCost = (type, currentLevel) => {
  const costs = {
    building: currentLevel * 250,
    road: currentLevel * 150,
    map: currentLevel * 500
  };
  return costs[type] || 0;
};

const upgradeBuilding = (buildingId) => {
  store.dispatch('upgradeBuilding', buildingId);
};

const upgradeRoads = () => {
  store.dispatch('upgradeRoads');
};

const upgradeMap = () => {
  store.dispatch('upgradeMap');
};
</script>

<style scoped lang="less">
.upgrades-panel {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 12px;
  margin-top: 20px;
  font-size: 11px;
  
  &__title {
    margin-bottom: 10px;
    color: #333;
    border-bottom: 1px solid #4CAF50;
    padding-bottom: 5px;
    font-size: 14px;
    font-weight: bold;
  }
  
  &__horizontal {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
  }
  
  &__category {
    flex: 1;
    min-width: 150px;
    max-width: 200px;
    
    &-title {
      color: #555;
      margin-bottom: 8px;
      font-size: 12px;
      font-weight: bold;
      text-align: center;
      padding-bottom: 4px;
      border-bottom: 1px solid #ddd;
    }
  }
  
  &__items-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  &__item {
    background: white;
    border-radius: 5px;
    padding: 6px;
    border: 1px solid #ddd;
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    &--horizontal {
      min-height: 70px;
      justify-content: space-between;
    }
  }
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  &__building-name,
  &__road-title,
  &__map-title {
    font-weight: bold;
    font-size: 10px;
    color: #333;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  &__level {
    font-size: 9px;
    color: #666;
    background: #f0f0f0;
    padding: 1px 4px;
    border-radius: 3px;
    margin-left: 4px;
  }
  
  &__bonus-details {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 16px;
  }
  
  &__bonus {
    font-size: 9px;
    font-weight: bold;
    padding: 2px 6px;
    border-radius: 3px;
    color: #9C27B0;
    background-color: #f3e5f5;
    text-align: center;
  }
  
  &__details {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 18px;
  }
  
  &__income,
  &__visitors,
  &__size {
    font-size: 9px;
    font-weight: bold;
    padding: 2px 6px;
    border-radius: 3px;
  }
  
  &__income {
    color: #4CAF50;
    background-color: #f1f8e9;
  }
  
  &__visitors {
    color: #2196F3;
    background-color: #e3f2fd;
  }
  
  &__size {
    color: #FF9800;
    background-color: #fff3e0;
  }
  
  &__btn {
    background: #4CAF50;
    color: white;
    border: none;
    padding: 4px 6px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 10px;
    transition: background 0.3s;
    min-height: 22px;
    line-height: 1;
    white-space: nowrap;
    text-align: center;
    width: 100%;
    
    &:hover:not(:disabled) {
      background: #45a049;
    }
    
    &:disabled {
      background: #ccc;
      cursor: not-allowed;
      color: #888;
    }
  }
  
  &__max-level {
    color: #888;
    font-style: italic;
    font-size: 10px;
    text-align: center;
    padding: 4px;
    background: #f8f8f8;
    border-radius: 3px;
    border: 1px dashed #ddd;
  }
}
</style>