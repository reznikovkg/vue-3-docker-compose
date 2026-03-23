<template>
  <div class="control-panel">
    <div class="control-panel__header">
      <h2 class="control-panel__title">Controls</h2>
      <p class="control-panel__text">Build, spawn and test damage manually</p>
    </div>

    <div class="control-panel__section">
      <p class="control-panel__section-label">Build mode</p>

      <div class="control-panel__button-grid">
        <button
            v-for="towerType in towerTypes"
            :key="towerType"
            class="control-panel__button"
            :class="{ 'control-panel__button--active': buildMode === towerType }"
            type="button"
            @click="() => emitSelectBuild(towerType)"
        >
          <span class="control-panel__button-title">{{ getTowerTitle(towerType) }}</span>
          <span class="control-panel__button-price">{{ getTowerPrice(towerType) }} gold</span>
        </button>
      </div>
    </div>

    <div class="control-panel__section">
      <p class="control-panel__section-label">Enemy test</p>

      <div class="control-panel__button-column">
        <button
            class="control-panel__button"
            type="button"
            @click="() => emitSpawnEnemy()"
        >
          Spawn enemy at green point
        </button>

        <button
            class="control-panel__button"
            type="button"
            @click="() => emitRunStep()"
        >
          Run damage step
        </button>

        <button
            class="control-panel__button control-panel__button--danger"
            type="button"
            @click="() => emitResetLevel()"
        >
          Reset level
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { TOWER_CONFIG } from '@/constants/gameConstants'

export default {
  name: 'ControlPanel',

  props: {
    buildMode: {
      type: String,
      default: null
    },
    towerTypes: {
      type: Array,
      required: true
    }
  },

  emits: [
    'select-build',
    'spawn-enemy',
    'run-step',
    'reset-level'
  ],

  methods: {
    emitSelectBuild (towerType) {
      this.$emit('select-build', towerType)
    },

    emitSpawnEnemy () {
      this.$emit('spawn-enemy')
    },

    emitRunStep () {
      this.$emit('run-step')
    },

    emitResetLevel () {
      this.$emit('reset-level')
    },

    getTowerTitle (towerType) {
      const config = TOWER_CONFIG[towerType]

      if (!config) {
        return towerType
      }

      return config.title
    },

    getTowerPrice (towerType) {
      const config = TOWER_CONFIG[towerType]

      if (!config) {
        return 0
      }

      return config.price
    }
  }
}
</script>

<style scoped lang="scss">
.control-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 18px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);

  &__header {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__title {
    margin: 0;
    font-size: 22px;
  }

  &__text {
    margin: 0;
    color: var(--muted);
    font-size: 14px;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__section-label {
    margin: 0;
    font-size: 14px;
    color: var(--muted);
  }

  &__button-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  &__button-column {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__button {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    border: 1px solid var(--line);
    background: var(--panel-2);
    color: var(--text);
    padding: 10px 12px;
    border-radius: 12px;
    cursor: pointer;

    &:hover {
      border-color: var(--accent);
    }

    &--active {
      background: rgba(56, 189, 248, 0.14);
      border-color: var(--accent);
    }

    &--danger {
      border-color: rgba(239, 68, 68, 0.4);
    }
  }

  &__button-title {
    font-weight: bold;
  }

  &__button-price {
    color: var(--muted);
    font-size: 13px;
  }
}
</style>