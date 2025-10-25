<template>
  <section class="game-info">
    <header class="game-info__header">
      <h2 class="game-info__title">Game Stats</h2>
    </header>

    <div class="game-info__content">
      <div class="game-info__field">
        <span class="game-info__label">Selected:</span>
        <span class="game-info__value">
          {{ selectedCell ? `(${selectedCell.x}, ${selectedCell.y})` : 'None' }}
        </span>
      </div>

      <div class="game-info__field">
        <span class="game-info__label">Grid Size:</span>
        <span class="game-info__value">{{ gridSize }} × {{ gridSize }}</span>
      </div>

      <div class="game-info__field">
        <span class="game-info__label">Matches:</span>
        <span class="game-info__value">{{ matchedCount }}</span>
      </div>

      <div class="game-info__field">
        <span class="game-info__label">Score:</span>
        <span class="game-info__value score-value">{{ score }}</span>
      </div>

      <div class="game-info__field" v-if="isProcessing">
        <span class="game-info__label status">Processing...</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const selectedCell = computed(() => store.state.game.selectedCell)
const gridSize = computed(() => store.state.game.gridSize)
const matchedSet = computed(() => store.state.game.matchedSet)
const score = computed(() => store.state.game.score)
const isProcessing = computed(() => store.state.game.isProcessing)

const matchedCount = computed(() => matchedSet.value.size)
</script>

<style scoped lang="scss">
.game-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(129, 140, 248, 0.18));
  border: 1px solid rgba(148, 163, 184, 0.2);
  backdrop-filter: blur(12px);
  min-width: 200px;

  &__header {
    border-bottom: 1px solid rgba(148, 163, 184, 0.2);
    padding-bottom: 12px;
  }

  &__title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--game-text-strong);
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__field {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  &__label {
    font-size: 14px;
    color: var(--game-text-muted);
    font-weight: 500;
    
    &.status {
      color: #facc15;
      font-weight: 600;
    }
  }

  &__value {
    font-size: 14px;
    color: var(--game-text-strong);
    font-weight: 600;
    
    &.score-value {
      color: #facc15;
      text-shadow: 0 0 8px rgba(250, 204, 21, 0.3);
      font-size: 16px;
    }
  }

  @media (prefers-color-scheme: dark) {
    & {
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(14, 165, 233, 0.15));
      border-color: rgba(148, 163, 184, 0.25);
    }
  }
}

:root {
  --game-text-strong: #0f172a;
  --game-text-muted: rgba(15, 23, 42, 0.7);
}

@media (prefers-color-scheme: dark) {
  :root {
    --game-text-strong: #f8fafc;
    --game-text-muted: rgba(226, 232, 240, 0.7);
  }
}
</style>