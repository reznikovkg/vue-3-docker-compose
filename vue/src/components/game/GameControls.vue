<template>
  <section class="game-controls">
    <div class="game-controls__primary">
      <div class="game-controls__field">
        <label class="game-controls__label">Grid Size:</label>
        <input
          v-model.number="localGridSize"
          type="number"
          :min="MIN_GRID"
          :max="MAX_GRID"
          class="game-controls__input"
          :disabled="isProcessing"
        />
      </div>
      
      <button 
        @click="handleNewGame"
        class="game-controls__button"
        :disabled="isProcessing"
      >
        <span v-if="isProcessing">🔄 Processing...</span>
        <span v-else>🎮 New Game</span>
      </button>
    </div>

  </section>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useStore } from 'vuex'

const MIN_GRID = 6
const MAX_GRID = 10

const store = useStore()
const emit = defineEmits(['game-initialized'])

const gridSize = computed(() => store.state.game.gridSize)
const isProcessing = computed(() => store.state.game.isProcessing)

const localGridSize = ref(gridSize.value)

watch(localGridSize, (newSize) => {
  const validatedSize = Math.max(MIN_GRID, Math.min(MAX_GRID, newSize))
  if (validatedSize !== gridSize.value) {
    store.commit('game/SET_GRID_SIZE', validatedSize)
  }
})

const handleNewGame = async () => {
  if (isProcessing.value) return
  
  try {
    await store.dispatch('game/initializeGame')
    emit('game-initialized')
  } catch (error) {
    console.error('Failed to initialize game:', error)
  }
}
</script>

<style scoped lang="scss">
.game-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);

  &__primary {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  &__field {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__label {
    font-size: 14px;
    color: var(--game-text-strong);
    font-weight: 500;
    white-space: nowrap;
  }

  &__input {
    width: 60px;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid rgba(148, 163, 184, 0.4);
    background: rgba(255, 255, 255, 0.9);
    color: var(--game-text-strong);
    font-size: 14px;
    text-align: center;

    &:focus {
      outline: none;
      border-color: rgba(59, 130, 246, 0.5);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__button {
    padding: 10px 20px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg, #22d3ee, #3b82f6);
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 140px;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>