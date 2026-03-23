<template>
  <div class="tower-panel">
    <div class="tower-panel__header">
      <h2 class="tower-panel__title">Selection</h2>
      <p class="tower-panel__text">Tower info, enemy info and economy</p>
    </div>

    <div class="tower-panel__card">
      <p class="tower-panel__card-title">Economy</p>
      <p class="tower-panel__line">Gold: {{ gold }}</p>
    </div>

    <div v-if="selectedTower" class="tower-panel__card">
      <p class="tower-panel__card-title">Selected tower</p>
      <p class="tower-panel__line">Type: {{ selectedTower.type }}</p>
      <p class="tower-panel__line">Level: {{ selectedTower.level }}</p>
      <p class="tower-panel__line">Range: {{ towerStats ? towerStats.range : '-' }}</p>
      <p class="tower-panel__line">Damage: {{ towerStats ? towerStats.damage : '-' }}</p>

      <div class="tower-panel__button-row">
        <button
            class="tower-panel__button"
            type="button"
            @click="() => emitUpgradeTower(selectedTower.id)"
        >
          Upgrade
        </button>

        <button
            class="tower-panel__button tower-panel__button--danger"
            type="button"
            @click="() => emitRemoveTower(selectedTower.id)"
        >
          Remove
        </button>
      </div>
    </div>

    <div v-else class="tower-panel__empty-state">
      <p class="tower-panel__empty-text">No tower selected</p>
    </div>

    <div v-if="selectedEnemy" class="tower-panel__card">
      <p class="tower-panel__card-title">Selected enemy</p>
      <p class="tower-panel__line">Id: {{ selectedEnemy.id }}</p>
      <p class="tower-panel__line">HP: {{ Math.round(selectedEnemy.hp) }}</p>
      <p class="tower-panel__line">X: {{ selectedEnemy.pos.x }}</p>
      <p class="tower-panel__line">Y: {{ selectedEnemy.pos.y }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TowerPanel',

  props: {
    selectedTower: {
      type: Object,
      default: null
    },
    selectedEnemy: {
      type: Object,
      default: null
    },
    getTowerStats: {
      type: Function,
      required: true
    },
    gold: {
      type: Number,
      required: true
    }
  },

  emits: [
    'upgrade-tower',
    'remove-tower'
  ],

  computed: {
    towerStats () {
      if (!this.selectedTower) {
        return null
      }

      return this.getTowerStats(this.selectedTower.type, this.selectedTower.level)
    }
  },

  methods: {
    emitUpgradeTower (towerId) {
      this.$emit('upgrade-tower', towerId)
    },

    emitRemoveTower (towerId) {
      this.$emit('remove-tower', towerId)
    }
  }
}
</script>

<style scoped lang="scss">
.tower-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

  &__card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px;
    border-radius: 12px;
    background: var(--panel-2);
    border: 1px solid var(--line);
  }

  &__card-title {
    margin: 0;
    font-weight: bold;
  }

  &__line {
    margin: 0;
    color: var(--text);
  }

  &__empty-state {
    padding: 14px;
    border-radius: 12px;
    background: var(--panel-2);
    border: 1px solid var(--line);
  }

  &__empty-text {
    margin: 0;
    color: var(--muted);
  }

  &__button-row {
    display: flex;
    gap: 10px;
    margin-top: 8px;
  }

  &__button {
    border: 1px solid var(--line);
    background: transparent;
    color: var(--text);
    padding: 10px 12px;
    border-radius: 12px;
    cursor: pointer;
  }

  &__button--danger {
    border-color: rgba(239, 68, 68, 0.45);
  }
}
</style>