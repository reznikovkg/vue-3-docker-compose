<template>
  <section class="game-info">
    <header class="game-info__header">
      <h2 class="game-info__title">Game Stats</h2>
      <div class="game-info__level">Level {{ levelValue }}</div>
    </header>

    <div class="game-info__content">
      <div class="game-info__field">
        <span class="game-info__label">Target Score:</span>
        <span class="game-info__value">{{ targetScoreValue }}</span>
      </div>

      <div class="game-info__field">
        <span class="game-info__label">Your Score:</span>
        <span class="game-info__value game-info__value--score">{{ scoreValue }}</span>
      </div>

      <div class="game-info__field">
        <span class="game-info__label">Time Left:</span>
        <span class="game-info__value game-info__value--time">{{ formatTime(timeLeftValue) }}</span>
      </div>

      <div class="game-info__field">
        <span class="game-info__label">Moves:</span>
        <span class="game-info__value">{{ moveCountValue }}</span>
      </div>

      <div class="game-info__field">
        <span class="game-info__label">Crystals:</span>
        <span class="game-info__value game-info__value--crystal">
          {{ crystalsCollectedValue }}/{{ crystalsTotalValue }}
        </span>
      </div>

      <div v-if="comboValue.active" class="combo-display">
        <div class="combo-display__title">COMBO!</div>
        <div class="combo-display__details">
          <span class="combo-display__color" :style="{ backgroundColor: comboValue.color }"></span>
          <span class="combo-display__count">x{{ comboValue.count }}</span>
          <span class="combo-display__multiplier">×{{ comboValue.multiplier.toFixed(1) }}</span>
        </div>
        <div v-if="comboValue.bonusType" class="combo-display__bonus">
          Bonus: {{ getBonusName(comboValue.bonusType) }}
        </div>
      </div>

      <div v-if="bonusesValue.length > 0" class="bonuses-section">
        <h3 class="bonuses-section__title">Active Bonuses</h3>
        <div class="bonuses-section__list">
          <div
            v-for="(bonus, index) in bonusesValue"
            :key="index"
            class="bonus-item"
            @click="activateBonus(index)"
          >
            <span class="bonus-item__icon">{{ getBonusSymbol(bonus.type) }}</span>
            <span class="bonus-item__name">{{ getBonusName(bonus.type) }}</span>
          </div>
        </div>
      </div>

      <div v-if="isProcessingValue" class="processing-indicator">
        <div class="processing-indicator__spinner"></div>
        <span class="processing-indicator__text">Processing...</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

// Безопасные вычисляемые свойства с значениями по умолчанию
const scoreValue = computed(() => store.getters.score || 0)
const levelValue = computed(() => store.getters.level || 1)
const targetScoreValue = computed(() => store.getters.targetScore || 10000)
const timeLeftValue = computed(() => store.getters.timeLeft || 120)
const moveCountValue = computed(() => store.getters.moveCount || 0)
const crystalsCollectedValue = computed(() => store.getters.crystalsCollected || 0)
const crystalsTotalValue = computed(() => store.getters.crystalsTotal || 0)
const comboValue = computed(() => store.getters.combo || { 
  active: false, 
  color: null, 
  count: 0, 
  multiplier: 1,
  bonusType: null
})
const bonusesValue = computed(() => store.getters.bonuses || [])
const isProcessingValue = computed(() => store.getters.isProcessing || false)

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const getBonusSymbol = (bonusType: string) => {
  const symbols: Record<string, string> = {
    bomb: 'B',
    vertical: 'V',
    horizontal: 'H',
    random: '?',
    time: 'T',
    crystal_hunter: 'C'
  }
  return symbols[bonusType] || '?'
}

const getBonusName = (bonusType: string) => {
  const names: Record<string, string> = {
    bomb: 'Bomb',
    vertical: 'Vertical',
    horizontal: 'Horizontal',
    random: 'Random',
    time: 'Time+',
    crystal_hunter: 'Crystal Hunter'
  }
  return names[bonusType] || 'Unknown'
}

const activateBonus = (index: number) => {
  if (!isProcessingValue.value) {
    store.dispatch('game/activateBonus', index)
  }
}
</script>

<style scoped lang="scss">
.game-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(129, 140, 248, 0.18));
  border: 1px solid rgba(148, 163, 184, 0.2);
  backdrop-filter: blur(12px);
  min-width: 280px;
}

.game-info__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  padding-bottom: 16px;
}

.game-info__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--game-text-strong);
}

.game-info__level {
  background: linear-gradient(135deg, #22d3ee, #3b82f6);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.game-info__content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.game-info__field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.game-info__label {
  font-size: 14px;
  color: var(--game-text-muted);
  font-weight: 500;
}

.game-info__value {
  font-size: 14px;
  color: var(--game-text-strong);
  font-weight: 600;
}

.game-info__value--score {
  color: #facc15;
  text-shadow: 0 0 8px rgba(250, 204, 21, 0.3);
  font-size: 16px;
}

.game-info__value--time {
  color: #ef4444;
  font-weight: 700;
}

.game-info__value--crystal {
  color: gold;
}

.combo-display {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2));
  border: 1px solid rgba(168, 85, 247, 0.4);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  animation: pulse 1.5s infinite;
}

.combo-display__title {
  font-size: 16px;
  font-weight: 700;
  color: #a855f7;
  margin-bottom: 8px;
}

.combo-display__details {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 6px;
}

.combo-display__color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid white;
}

.combo-display__count {
  font-weight: 600;
  color: var(--game-text-strong);
}

.combo-display__multiplier {
  background: #facc15;
  color: #0f172a;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
}

.combo-display__bonus {
  font-size: 12px;
  color: var(--game-text-muted);
  font-weight: 500;
}

.bonuses-section__title {
  font-size: 14px;
  color: var(--game-text-strong);
  margin: 0 0 12px 0;
  font-weight: 600;
}

.bonuses-section__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bonus-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.bonus-item:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}

.bonus-item__icon {
  font-size: 16px;
  font-weight: bold;
}

.bonus-item__name {
  font-size: 12px;
  color: var(--game-text-strong);
  font-weight: 500;
}

.processing-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  font-size: 13px;
  color: var(--game-text-muted);
}

.processing-indicator__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@media (prefers-color-scheme: dark) {
  .game-info {
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(14, 165, 233, 0.15));
    border-color: rgba(148, 163, 184, 0.25);
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