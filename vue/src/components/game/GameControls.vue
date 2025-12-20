<template>
  <footer class="runner-game__controls">
    <div class="runner-game__controls-primary">
      <button
        type="button"
        class="runner-game__control"
        @click="() => emitStart()"
      >
        {{ isRunning ? 'Перезапуск' : 'Старт' }}
      </button>
      <button
        type="button"
        class="runner-game__control runner-game__control--secondary"
        :disabled="!isRunning"
        @click="() => emitJump()"
      >
        Прыжок
      </button>
      <button
        type="button"
        class="runner-game__control runner-game__control--accent"
        :disabled="!isRunning"
        @click="() => emitShoot()"
      >
        Огонь
      </button>
    </div>
    <div class="runner-game__controls-meta">
      <div class="runner-game__badge">
        Врагов побеждено: <strong>{{ defeated }}</strong>
      </div>
      <div class="runner-game__badge">
        Монеты: <strong>{{ coinsCollected }}</strong>
      </div>
      <div class="runner-game__badge runner-game__badge--muted">
        Урон: пуля {{ damage.bullet }}, препятствие {{ damage.obstacle }}, столкновение с врагом {{ damage.enemy }}
      </div>
      <div class="runner-game__badge runner-game__badge--muted">
        Управление: W — прыжок, пробел — стрельба
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
type DamageConfig = {
  bullet: number
  obstacle: number
  enemy: number
}

const props = defineProps<{
  isRunning: boolean
  defeated: number
  coinsCollected: number
  damage: DamageConfig
}>()

const emit = defineEmits<{
  (event: 'start'): void
  (event: 'jump'): void
  (event: 'shoot'): void
}>()

const emitStart = () => emit('start')
const emitJump = () => props.isRunning && emit('jump')
const emitShoot = () => props.isRunning && emit('shoot')
</script>

<style scoped lang="scss">
.runner-game {
  &__controls {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px 10px 4px;
    border-radius: 14px;
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(226, 232, 240, 0.06);
  }

  &__controls-primary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
  }

  &__control {
    padding: 12px 16px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #22d3ee, #0ea5e9);
    color: #0b1120;
    font-weight: 700;
    letter-spacing: 0.01em;
    cursor: pointer;
    box-shadow: 0 10px 22px rgba(14, 165, 233, 0.35);
    transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 12px 26px rgba(14, 165, 233, 0.45);
    }

    &:disabled {
      opacity: 0.65;
      cursor: not-allowed;
      box-shadow: none;
    }
  }

  &__control--secondary {
    background: linear-gradient(135deg, #fbbf24, #f97316);
    color: #0f172a;
    box-shadow: 0 10px 22px rgba(249, 115, 22, 0.32);
  }

  &__control--accent {
    background: linear-gradient(135deg, #a855f7, #6366f1);
    color: #0b1120;
    box-shadow: 0 10px 22px rgba(99, 102, 241, 0.35);
  }

  &__controls-meta {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
  }

  &__badge {
    padding: 8px 12px;
    border-radius: 10px;
    background: rgba(226, 232, 240, 0.08);
    border: 1px solid rgba(148, 163, 184, 0.18);
    color: #e2e8f0;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-width: 160px;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum' 1;
  }

  &__badge--muted {
    color: rgba(226, 232, 240, 0.7);
  }
}
</style>
