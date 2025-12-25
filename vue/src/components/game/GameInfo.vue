<template>
  <section class="game-info">
    <header class="game-info__header">
      <h2 class="game-info__title">{{ title }}</h2>
      <div class="game-info__level">Level {{ gameStats.level }}</div>
    </header>

    <div class="game-info__content">
      <GameStatField
        v-for="stat in gameStatFields"
        :key="stat.label"
        :label="stat.label"
        :value="stat.value"
        :variant="stat.variant"
      />

      <div v-if="gameStats.combo.active" class="combo-display">
        <div class="combo-display__title">COMBO!</div>
        <div class="combo-display__details">
          <span 
            v-if="gameStats.combo.color" 
            class="combo-display__color" 
            :style="{ backgroundColor: gameStats.combo.color }" 
          />
          <span class="combo-display__count">x{{ gameStats.combo.count }}</span>
          <span class="combo-display__multiplier">×{{ gameStats.combo.multiplier.toFixed(1) }}</span>
        </div>
        <div v-if="gameStats.combo.bonusType" class="combo-display__bonus">
          Bonus: {{ getBonusName(gameStats.combo.bonusType) }}
        </div>
      </div>

      <div v-if="hasBonuses" class="bonuses-section">
        <h3 class="bonuses-section__title">Active Bonuses</h3>
        <div class="bonuses-section__list">
          <button
            v-for="(bonus, index) in gameStats.bonuses"
            :key="bonus.id || index"
            class="bonus-item"
            :disabled="gameStats.isProcessing"
            @click="activateBonus(index)"
          >
            <span class="bonus-item__icon">{{ getBonusSymbol(bonus.type) }}</span>
            <span class="bonus-item__name">{{ getBonusName(bonus.type) }}</span>
          </button>
        </div>
      </div>

      <div v-if="gameStats.isProcessing" class="processing-indicator">
        <div class="processing-indicator__spinner" />
        <span class="processing-indicator__text">Processing...</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

// ============== TYPES ==============
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

// ============== CONSTANTS ==============
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

// ============== COMPONENT LOGIC ==============
const store = useStore()

// Unified game stats computed property
const gameStats = computed<GameStats>(() => ({
  score: store.getters.score ?? DEFAULT_STATS.score,
  level: store.getters.level ?? DEFAULT_STATS.level,
  targetScore: store.getters.targetScore ?? DEFAULT_STATS.targetScore,
  timeLeft: store.getters.timeLeft ?? DEFAULT_STATS.timeLeft,
  moveCount: store.getters.moveCount ?? DEFAULT_STATS.moveCount,
  crystalsCollected: store.getters.crystalsCollected ?? DEFAULT_STATS.crystalsCollected,
  crystalsTotal: store.getters.crystalsTotal ?? DEFAULT_STATS.crystalsTotal,
  combo: store.getters.combo ?? DEFAULT_STATS.combo,
  bonuses: store.getters.bonuses ?? DEFAULT_STATS.bonuses,
  isProcessing: store.getters.isProcessing ?? DEFAULT_STATS.isProcessing
}))

// Helper function to format time
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Bonus helper functions
const getBonusSymbol = (type: string): string => 
  BONUS_CONFIG[type as BonusType]?.symbol ?? '?'

const getBonusName = (type: string): string => 
  BONUS_CONFIG[type as BonusType]?.name ?? 'Unknown'

// Computed properties
const title = TITLE

const gameStatFields = computed<StatField[]>(() => [
  { 
    label: 'Target Score:', 
    value: gameStats.value.targetScore 
  },
  { 
    label: 'Your Score:', 
    value: gameStats.value.score,
    variant: 'score' 
  },
  { 
    label: 'Time Left:', 
    value: formatTime(gameStats.value.timeLeft),
    variant: 'time' 
  },
  { 
    label: 'Moves:', 
    value: gameStats.value.moveCount 
  },
  { 
    label: 'Crystals:', 
    value: `${gameStats.value.crystalsCollected}/${gameStats.value.crystalsTotal}`,
    variant: 'crystal' 
  }
])

const hasBonuses = computed(() => gameStats.value.bonuses.length > 0)

// Event handlers
const activateBonus = (index: number): void => {
  if (!gameStats.value.isProcessing) {
    store.dispatch('game/activateBonus', index)
  }
}

// ============== COMPONENTS ==============
// Sub-component for stat field (defined in template)
const GameStatField = {
  props: {
    label: { type: String, required: true },
    value: { type: [String, Number], required: true },
    variant: { type: String, default: 'default' }
  },
  template: `
    <div class="game-info__field">
      <span class="game-info__label">{{ label }}</span>
      <span 
        class="game-info__value" 
        :class="'game-info__value--' + variant"
      >
        {{ value }}
      </span>
    </div>
  `
}
</script>

<style scoped lang="scss">
// ============== CSS VARIABLES ==============
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

// ============== ANIMATIONS ==============
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

// ============== MAIN CONTAINER ==============
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
}

// ============== HEADER ==============
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

// ============== CONTENT ==============
.game-info__content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// ============== STAT FIELDS ==============
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

// ============== COMBO DISPLAY ==============
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

// ============== BONUSES SECTION ==============
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

// ============== PROCESSING INDICATOR ==============
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
</style>