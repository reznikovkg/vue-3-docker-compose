<template>
  <div class="info-panel">
    <div
      v-if="selectedTower"
      class="info-panel__tower"
    >
      <div class="info-panel__tower-info">
        <div class="info-panel__tower-info-row">
          Уровень: {{ selectedTower.level }}
        </div>
        <div class="info-panel__tower-info-row">
          Урон: {{ Math.round(selectedTower.damage) }}
        </div>
        <div class="info-panel__tower-info-row">
          Скорость: {{ selectedTower.attackSpeed.toFixed(1) }}
        </div>
        <div class="info-panel__tower-info-row">
          Радиус: {{ selectedTower.radius }}
        </div>
        <div class="info-panel__tower-info-row">
          Убийств: {{ selectedTower.kills || 0 }}
        </div>
      </div>

      <button
        v-if="selectedTower.level < 5"
        class="info-panel__upgrade-button"
        :class="{ 'info-panel__upgrade-button--insufficient': points < upgradeCost }"
        @click="() => onUpgrade()"
      >
        Улучшить до {{ selectedTower.level + 1 }} уровня
        <span class="info-panel__cost">({{ upgradeCost }})</span>
      </button>

      <div v-else class="info-panel__no-upgrade">
        Максимальный уровень
      </div>
    </div>

    <div v-else class="info-panel__no-selection">
      <p class="info-panel__no-selection-title">Выберите:</p>
      <ul class="info-panel__no-selection-list">
        <li class="info-panel__no-selection-item">
          Пустую позицию - построить башню ({{ towerCost }} очков)
        </li>
        <li class="info-panel__no-selection-item">
          Башню - чтобы улучшить
        </li>
      </ul>
      <div
        class="info-panel__points"
        :class="{ 'info-panel__points--insufficient': points < towerCost }"
      >
        Доступно очков: {{ points }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InfoPanel',
  emits: ['upgrade-tower'],
  props: {
    selectedTower: Object,
    points: Number,
    towerCost: Number,
    upgradeCost: Number
  },
  methods: {
    onUpgrade () {
      this.$emit('upgrade-tower')
    }
  }
}
</script>

<style scoped lang="scss">
.info-panel {
  background: #f5f5f5;
  border-radius: 8px;
  width: 260px;
  min-height: 120px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  position: relative;

  &__tower-info {
    margin-bottom: 15px;
    padding: 10px;
    background: #e0e0e0;
    border-radius: 6px;
    font-size: 14px;
  }

  &__tower-info-row {
    margin: 5px 0;
  }

  &__upgrade-button {
    width: 100%;
    padding: 12px;
    font-size: 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    background: #ff9800;
    color: white;
    transition: background 0.2s;

    &:hover:not(:disabled) {
      background: #f57c00;
    }

    &--insufficient {
      background: #ffb74d;
      cursor: not-allowed;
      opacity: 0.7;

      &:hover {
        background: #ffb74d;
      }
    }
  }

  &__cost {
    display: block;
    font-size: 12px;
    margin-top: 4px;
  }

  &__no-upgrade {
    text-align: center;
    color: #4CAF50;
    font-size: 16px;
  }

  &__no-selection {
    text-align: center;
    color: #666;
    width: 100%;
  }

  &__no-selection-title {
    margin: 0 0 10px 0;
    font-size: 16px;
    font-weight: bold;
  }

  &__no-selection-list {
    margin: 0;
    padding: 0;
    text-align: left;
  }

  &__no-selection-item {
    margin: 8px 0;
    list-style: none;
    font-size: 14px;
  }

  &__points {
    padding: 10px;
    background: #4caf50;
    color: white;
    border-radius: 6px;
    font-weight: bold;
    font-size: 16px;
    transition: background 0.2s;

    &--insufficient {
      background: #f44336;
    }
  }
}
</style>