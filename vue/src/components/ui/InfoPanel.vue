<template>
  <div class="info-panel">
    <div v-if="selectedEnemy" class="info-panel__controls">
      <button
        :disabled="!canMoveUp"
        class="info-panel__button"
        @click="() => onMove('up')"
      >↑</button>
      <button
        :disabled="!canMoveDown"
        class="info-panel__button"
        @click="() => onMove('down')"
      >↓</button>
      <button
        :disabled="!canMoveLeft"
        class="info-panel__button"
        @click="() => onMove('left')"
      >←</button>
      <button
        :disabled="!canMoveRight"
        class="info-panel__button"
        @click="() => onMove('right')"
      >→</button>
    </div>

    <div v-else-if="selectedTower" class="info-panel__tower">
      <button
        v-if="selectedTower.level < 5"
        class="info-panel__upgrade-button"
        @click="() => onUpgrade()"
      >
        Улучшить ({{ selectedTower.level + 1 }})
      </button>

      <div v-else class="info-panel__no-upgrade">
        Максимальный уровень
      </div>
    </div>

    <div v-else class="info-panel__no-selection">
      <p class="info-panel__no-selection-title">Выберите:</p>
      <ul class="info-panel__no-selection-list">
        <li class="info-panel__no-selection-item">Врага - чтобы управлять</li>
        <li class="info-panel__no-selection-item">Пустую позицию - чтобы построить</li>
        <li class="info-panel__no-selection-item">Башню - чтобы улучшить</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InfoPanel',
  emits: ['move', 'upgrade-tower'],
  props: {
    selectedEnemy: Object,
    selectedTower: Object,
    canMoveUp: Boolean,
    canMoveDown: Boolean,
    canMoveLeft: Boolean,
    canMoveRight: Boolean
  },
  methods: {
    onMove (direction) {
      this.$emit('move', direction)
    },
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
  align-items: center;
  justify-content: center;

  &__controls {
    display: flex;
    gap: 5px;
  }

  &__button {
    width: 45px;
    height: 45px;
    font-size: 24px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
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
}
</style>