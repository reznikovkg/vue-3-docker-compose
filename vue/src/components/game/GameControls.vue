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
          :disabled="isProcessingValue"
        />
      </div>
      
      <button 
        @click="handleNewGame"
        class="game-controls__button"
        :disabled="isProcessingValue"
      >
        <span v-if="isProcessingValue" class="game-controls__button-text">🔄 Processing...</span>
        <span v-else class="game-controls__button-text">🎮 New Game</span>
      </button>
    </div>
    
    <div class="game-controls__progress">
      <div class="progress-bar">
        <div 
          class="progress-bar__fill" 
          :style="{ width: progressPercentage + '%' }"
        ></div>
        <span class="progress-bar__text">
          {{ scoreValue }} / {{ targetScoreValue }}
        </span>
      </div>
    </div>
    
    <div v-if="isProcessingValue" class="game-controls__loading">
      <span class="game-controls__loading-text">Processing matches...</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'

const MIN_GRID = 6
const MAX_GRID = 10

const store = useStore()
const emit = defineEmits(['game-initialized'])

// Вычисляемые свойства с безопасными значениями по умолчанию
const gridSizeValue = computed(() => store.getters.gridSize || 8)
const isProcessingValue = computed(() => store.getters.isProcessing || false)
const scoreValue = computed(() => store.getters.score || 0)
const targetScoreValue = computed(() => store.getters.targetScore || 10000)
const timeLeftValue = computed(() => store.getters.timeLeft || 120)

const localGridSize = ref(gridSizeValue.value)

let timerInterval: NodeJS.Timeout | null = null

const progressPercentage = computed(() => {
  return Math.min(100, (scoreValue.value / targetScoreValue.value) * 100)
})

watch(localGridSize, (newSize) => {
  const validatedSize = Math.max(MIN_GRID, Math.min(MAX_GRID, newSize))
  if (validatedSize !== gridSizeValue.value) {
    store.commit('game/SET_GRID_SIZE', validatedSize)
  }
})

const handleNewGame = () => {
  if (isProcessingValue.value) return
  
  store.dispatch('game/initializeGame').then(() => {
    emit('game-initialized')
    startTimer()
  })
}

const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval)
  
  timerInterval = setInterval(() => {
    if (timeLeftValue.value > 0) {
      store.dispatch('game/updateTimer')
    } else {
      if (timerInterval) clearInterval(timerInterval)
    }
  }, 1000)
}

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<style scoped lang="scss">
.game-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.game-controls__primary {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.game-controls__field {
  display: flex;
  align-items: center;
  gap: 10px;
}

.game-controls__label {
  font-size: 14px;
  color: var(--game-text-strong);
  font-weight: 500;
  white-space: nowrap;
}

.game-controls__input {
  width: 60px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: rgba(255, 255, 255, 0.9);
  color: var(--game-text-strong);
  font-size: 14px;
  text-align: center;
}

.game-controls__input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.game-controls__input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.game-controls__button {
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
}

.game-controls__button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.game-controls__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.game-controls__button-text {
  display: block;
}

.game-controls__progress {
  width: 100%;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.progress-bar__fill {
  height: 100%;
  background: linear-gradient(90deg, #22d3ee, #3b82f6);
  border-radius: 10px;
  transition: width 0.3s ease;
}

.progress-bar__text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.game-controls__loading {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  font-size: 13px;
  color: var(--game-text-muted);
}

.game-controls__loading-text {
  display: block;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>