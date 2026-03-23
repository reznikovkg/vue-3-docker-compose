<template>
  <div class="economy-panel">
    <div class="economy-panel__points">
      Очки: {{ points }}
    </div>
    <div class="economy-panel__kills">
      Убито: {{ totalKills }} / {{ maxEnemies }}
    </div>
    <div class="economy-panel__build-controls">
      <button
        class="economy-panel__build-button"
        :class="{
          'economy-panel__build-button--active': placeMode === 'barricade'
        }"
        @click="() => onSetPlaceMode('barricade')"
      >
        Заграждение ({{ BARRICADE_COST }})
      </button>
      <button
        class="economy-panel__build-button"
        :class="{
          'economy-panel__build-button--active': placeMode === 'artillery'
        }"
        @click="() => onSetPlaceMode('artillery')"
      >
        Артиллерия ({{ ARTILLERY_COST }})
      </button>
      <button
        class="economy-panel__spawn-ally"
        :disabled="points < ALLY_COST"
        @click="() => onSpawnAlly()"
      >
        Союзник ({{ ALLY_COST }})
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EconomyPanel',
  props: {
    points: Number,
    totalKills: Number,
    maxEnemies: Number,
    placeMode: String,
    BARRICADE_COST: Number,
    ARTILLERY_COST: Number,
    ALLY_COST: Number
  },
  emits: ['set-place-mode', 'spawn-ally'],
  methods: {
    onSetPlaceMode(mode) {
      this.$emit('set-place-mode', mode)
    },
    onSpawnAlly() {
      this.$emit('spawn-ally')
    }
  }
}
</script>

<style scoped lang="scss">
.economy-panel {
  display: flex;
  gap: 20px;
  background: #f5f5f5;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;

  &__points {
    color: #f57c00;
  }

  &__kills {
    color: #4caf50;
  }

  &__build-controls {
    display: flex;
    gap: 10px;
    margin-left: 20px;
  }

  &__build-button {
    padding: 8px 16px;
    background: #ddd;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.2s;

    &:hover {
      background: #ccc;
    }

    &--active {
      background: #4caf50;
      color: white;

      &:hover {
        background: #45a049;
      }
    }
  }

  &__spawn-ally {
    padding: 8px 16px;
    background: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: background 0.2s;

    &:hover:not(:disabled) {
      background: #357abd;
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }
}
</style>