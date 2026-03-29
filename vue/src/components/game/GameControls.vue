<template>
  <div class="gamePage__controls" aria-label="Maze directional controls">
    <button
      type="button"
      class="gamePage__control gamePage__controlLeft"
      :disabled="isDirectionDisabled(props.directions.LEFT)"
      @click="() => onMoveClick(props.directions.LEFT)"
    >
      ←
    </button>
    <button
      type="button"
      class="gamePage__control gamePage__controlUp"
      :disabled="isDirectionDisabled(props.directions.UP)"
      @click="() => onMoveClick(props.directions.UP)"
    >
      ↑
    </button>
    <button
      type="button"
      class="gamePage__control gamePage__controlDown"
      :disabled="isDirectionDisabled(props.directions.DOWN)"
      @click="() => onMoveClick(props.directions.DOWN)"
    >
      ↓
    </button>
    <button
      type="button"
      class="gamePage__control gamePage__controlRight"
      :disabled="isDirectionDisabled(props.directions.RIGHT)"
      @click="() => onMoveClick(props.directions.RIGHT)"
    >
      →
    </button>
  </div>
</template>

<script setup lang="ts">
import type { AvailableMoves, GameDirections } from './types'

const props = defineProps<{
  directions: GameDirections
  availableMoves?: AvailableMoves
  isComplete: boolean
}>()

const emit = defineEmits<{
  (event: 'move', direction: string): void
}>()

const onMoveClick = (direction: string) => {
  emit('move', direction)
}

const isDirectionDisabled = (direction?: string) => {
  if (!direction || props.isComplete) {
    return true
  }

  return !props.availableMoves?.[direction]
}
</script>

<style scoped lang="scss">

.gamePage {
  &__controls {
    flex: 0 0 auto;
    align-self: center;
    width: min(100%, var(--gameControlsBaseWidth));
    height: var(--gameControlStripHeight);
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-template-rows: repeat(2, minmax(0, 1fr));
    gap: var(--gameSpace1);
  }

  &__control {
    min-height: 0;
    height: 100%;
    display: grid;
    place-items: center;
    padding: 0;
    border: 1px solid var(--color-border-hover);
    background: var(--color-background-soft);
    color: var(--color-heading);
    font: inherit;
    font-size: 1.125rem;
    line-height: 1;
    opacity: 1;

    &Left {
      grid-column: 1;
      grid-row: 1 / span 2;
    }

    &Up {
      grid-column: 2;
      grid-row: 1;
    }

    &Down {
      grid-column: 2;
      grid-row: 2;
    }

    &Right {
      grid-column: 3;
      grid-row: 1 / span 2;
    }
  }
}

@media (max-width: 45rem) {
  .gamePage {
    &__controls {
      width: 100%;
    }
  }
}
</style>
