<template>
  <section class="game-info">
    <header class="game-info__header">
      <h2 class="game-info__title">Game Stats</h2>
      <div class="game-info__level">Level {{ level }}</div>
    </header>

    <div class="game-info__content">
      <div class="game-info__field">
        <span class="game-info__label">Target Score:</span>
        <span class="game-info__value">{{ targetScore }}</span>
      </div>

      <div class="game-info__field">
        <span class="game-info__label">Your Score:</span>
        <span class="game-info__value game-info__value--score">{{ score }}</span>
      </div>

      <div class="game-info__field">
        <span class="game-info__label">Time Left:</span>
        <span class="game-info__value game-info__value--time">{{ formatTime(timeLeft) }}</span>
      </div>

      <div class="game-info__field">
        <span class="game-info__label">Moves:</span>
        <span class="game-info__value">{{ moveCount }}</span>
      </div>

      <div class="game-info__field">
        <span class="game-info__label">Crystals:</span>
        <span class="game-info__value game-info__value--crystal">
          {{ crystalsCollected }}/{{ crystalsTotal }}
        </span>
      </div>

      <div v-if="combo.active" class="combo-display">
        <div class="combo-display__title">COMBO!</div>
        <div class="combo-display__details">
          <span class="combo-display__color" :style="{ backgroundColor: combo.color }"></span>
          <span class="combo-display__count">x{{ combo.count }}</span>
          <span class="combo-display__multiplier">×{{ combo.multiplier.toFixed(1) }}</span>
        </div>
        <div v-if="combo.bonusType" class="combo-display__bonus">
          Bonus: {{ combo.bonusType }}
        </div>
      </div>

      <div v-if="bonuses.length > 0" class="bonuses-section">
        <h3 class="bonuses-section__title">Active Bonuses</h3>
        <div class="bonuses-section__list">
          <div
            v-for="(bonus, index) in bonuses"
            :key="index"
            class="bonus-item"
            @click="activateBonus(index)"
            :class="{ 'bonus-item--disabled': isProcessing }"
          >
            <span class="bonus-item__icon">{{ getBonusSymbol(bonus.type) }}</span>
            <span class="bonus-item__name">{{ getBonusName(bonus.type) }}</span>
          </div>
        </div>
      </div>

      <div v-if="isProcessing" class="processing-indicator">
        <div class="processing-indicator__spinner"></div>
        <span class="processing-indicator__text">Processing...</span>
      </div>

      <div v-if="!isGameActive" class="game-status">
        <div v-if="score >= targetScore" class="game-status__win">
          🎉 You Win! Score: {{ score }}
        </div>
        <div v-else class="game-status__lose">
          ⏰ Time's Up! Score: {{ score }}
        </div>
        <button class="game-status__restart" @click="resetGame">Play Again</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

type BonusType = 
  | 'bomb' 
  | 'vertical' 
  | 'horizontal' 
  | 'random' 
  | 'time' 
  | 'crystal_hunter'

interface BonusItem {
  type: BonusType
  id?: string
}

interface ComboState {
  active: boolean
  color: string | null
  count: number
  multiplier: number
  bonusType: BonusType | null
}

interface GameStats {
  score: number
  level: number
  targetScore: number
  timeLeft: number
  moveCount: number
  crystalsCollected: number
  crystalsTotal: number
  combo: ComboState
  bonuses: BonusItem[]
  isProcessing: boolean
}

interface StatField {
  label: string
  value: string | number
  variant?: 'default' | 'score' | 'time' | 'crystal'
}

const BONUS_CONFIG: Record<BonusType, { symbol: string; name: string }> = {
  bomb: { symbol: 'B', name: 'Bomb' },
  vertical: { symbol: 'V', name: 'Vertical' },
  horizontal: { symbol: 'H', name: 'Horizontal' },
  random: { symbol: '?', name: 'Random' },
  time: { symbol: 'T', name: 'Time+' },
  crystal_hunter: { symbol: 'C', name: 'Crystal Hunter' }
}

const DEFAULT_COMBO: ComboState = {
  active: false,
  color: null,
  count: 0,
  multiplier: 1,
  bonusType: null
}

const DEFAULT_STATS: GameStats = {
  score: 0,
  level: 1,
  targetScore: 10000,
  timeLeft: 120,
  moveCount: 0,
  crystalsCollected: 0,
  crystalsTotal: 0,
  combo: DEFAULT_COMBO,
  bonuses: [],
  isProcessing: false
}

const TITLE = 'Game Stats'

const store = useStore()

const score = computed(() => store.getters['game/score'])
const level = computed(() => store.getters['game/level'] || 1)
const targetScore = computed(() => store.getters['game/targetScore'] || 10000)
const timeLeft = computed(() => store.getters['game/timeLeft'] || 0)
const moveCount = computed(() => store.getters['game/moveCount'] || 0)
const crystalsCollected = computed(() => store.getters['game/crystalsCollected'] || 0)
const crystalsTotal = computed(() => store.getters['game/crystalsTotal'] || 0)
const combo = computed(() => store.getters['game/combo'] || { 
  active: false, 
  color: null, 
  count: 0, 
  multiplier: 1,
  bonusType: null
})
const bonuses = computed(() => store.getters['game/bonuses'] || [])
const isProcessing = computed(() => store.getters['game/isProcessing'] || false)
const isGameActive = computed(() => store.getters['game/isGameActive'])

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) {
    return '0:00'
  }
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
    time_minus: 'T-',
    time_plus: 'T+',
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
    time_minus: 'Time-',
    time_plus: 'Time+',
    crystal_hunter: 'Crystal Hunter'
  }
  return names[bonusType] || 'Unknown'
}

const activateBonus = (index: number) => {
  if (!isProcessing.value && isGameActive.value) {
    store.dispatch('game/activateBonus', index)
  }
}

const resetGame = () => {
  store.dispatch('game/resetGame')
}
</script>

<style scoped lang="scss">
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

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

  @media (prefers-color-scheme: dark) {
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(14, 165, 233, 0.15));
    border-color: rgba(148, 163, 184, 0.25);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(148, 163, 184, 0.2);
    padding-bottom: 16px;
  }

  &__title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--game-text-strong);
  }

  &__level {
    background: linear-gradient(135deg, #22d3ee, #3b82f6);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 16px;
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
  }

  &__value {
    font-size: 14px;
    color: var(--game-text-strong);
    font-weight: 600;

    &--score {
      color: #facc15;
      text-shadow: 0 0 8px rgba(250, 204, 21, 0.3);
      font-size: 16px;
    }

    &--time {
      color: #ef4444;
      font-weight: 700;
    }

    &--crystal {
      color: gold;
    }
  }
}

.combo-display {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2));
  border: 1px solid rgba(168, 85, 247, 0.4);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  animation: pulse 1.5s infinite;

  &__title {
    font-size: 16px;
    font-weight: 700;
    color: #a855f7;
    margin-bottom: 8px;
  }

  &__details {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  &__color {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid white;
  }

  &__count {
    font-weight: 600;
    color: var(--game-text-strong);
  }

  &__multiplier {
    background: #facc15;
    color: #0f172a;
    padding: 2px 6px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
  }

  &__bonus {
    font-size: 12px;
    color: var(--game-text-muted);
    font-weight: 500;
  }
}

.bonuses-section {
  &__title {
    font-size: 14px;
    color: var(--game-text-strong);
    margin: 0 0 12px 0;
    font-weight: 600;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
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
  width: 100%;
  text-align: left;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(59, 130, 246, 0.3);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &__icon {
    font-size: 16px;
    font-weight: bold;
  }

  &__name {
    font-size: 12px;
    color: var(--game-text-strong);
    font-weight: 500;
  }
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

  &__spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(59, 130, 246, 0.3);
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}
</style>