<template>
  <div class="info-panel">
    <div v-if="selectedEnemy" class="info-panel__controls">
      <button
        class="info-panel__button"
        @click="() => $emit('move', 'up')"
        :disabled="!canMoveUp"
      >↑</button>
      <button
        class="info-panel__button"
        @click="() => $emit('move', 'down')"
        :disabled="!canMoveDown"
      >↓</button>
      <button
        class="info-panel__button"
        @click="() => $emit('move', 'left')"
        :disabled="!canMoveLeft"
      >←</button>
      <button
        class="info-panel__button"
        @click="() => $emit('move', 'right')"
        :disabled="!canMoveRight"
      >→</button>
    </div>

    <div v-else-if="selectedTower" class="info-panel__tower">
      <button
        v-if="selectedTower.level < 5"
        class="info-panel__upgrade-button"
        @click="() => $emit('upgrade-tower')"
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

<script setup>
defineProps({
  selectedEnemy: Object,
  selectedTower: Object,
  canMoveUp: Boolean,
  canMoveDown: Boolean,
  canMoveLeft: Boolean,
  canMoveRight: Boolean
})

defineEmits(['move', 'upgrade-tower'])
</script>

<style scoped>
.info-panel {
  background: #f5f5f5;
  border-radius: 8px;
  width: 260px;
  min-height: 120px;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-panel__controls {
  display: flex;
  gap: 5px;
}

.info-panel__button {
  width: 45px;
  height: 45px;
  font-size: 24px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.info-panel__button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.info-panel__upgrade-button {
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

.info-panel__no-upgrade {
  text-align: center;
  color: #4CAF50;
  font-size: 16px;
}

.info-panel__no-selection {
  text-align: center;
  color: #666;
  width: 100%;
}

.info-panel__no-selection-title {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: bold;
}

.info-panel__no-selection-list {
  margin: 0;
  padding: 0;
  text-align: left;
}

.info-panel__no-selection-item {
  margin: 8px 0;
  list-style: none;
  font-size: 14px;
}
</style>