<template>
  <div ref="mazeShellElement" class="gamePage__mazeShell" :style="mazeStyle">
    <div class="gamePage__actions">
      <button
        type="button"
        class="gamePage__actionButton"
        :disabled="props.isResetDisabled"
        @click="() => onResetClick()"
      >
        Reset
      </button>

      <RouterLink
        class="gamePage__actionButton gamePage__indexLink"
        :to="{ name: ROUTES.INDEX }"
      >
        Index
      </RouterLink>
    </div>

    <div class="gamePage__maze" :aria-label="mazeAriaLabel">
      <div
        v-for="cell in mazeCells"
        :key="`${cell.row}-${cell.column}`"
        class="gamePage__cell"
        :class="{
          gamePage__cellVisited: cell.isVisited,
          gamePage__cellWall: cell.type === props.cellTypes.WALL,
        }"
      >
        <span
          v-if="cell.isPlayer"
          class="gamePage__player"
          aria-hidden="true"
        >
          {{ playerProgressLabel }}
        </span>
      </div>
    </div>

    <span
      ref="playerLabelMeasureElement"
      class="gamePage__player gamePage__playerMeasure"
      aria-hidden="true"
    >
      {{ playerFullProgressLabel }}
    </span>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
} from 'vue'
import { RouterLink } from 'vue-router'

import { ROUTES } from '@/router/index.js'
import type {
  CellTypes,
  MazeBoardCell,
  MazeCell,
  Player,
  Progress,
} from './types'

const props = defineProps<{
  maze: MazeCell[][]
  player: Player
  progress?: Progress
  cellTypes: CellTypes
  isResetDisabled: boolean
}>()

const emit = defineEmits<{
  (event: 'reset'): void
}>()

const mazeShellElement = ref<HTMLElement | null>(null)
const playerLabelMeasureElement = ref<HTMLElement | null>(null)
const shouldUseCompactPlayerLabel = ref(false)

let playerLabelResizeObserver: ResizeObserver | null = null

const mazeRows = computed(() => props.maze.length)
const mazeColumns = computed(() => props.maze[0]?.length ?? 0)

const mazeCells = computed<MazeBoardCell[]>(() => {
  return props.maze.flatMap((row, rowIndex) => {
    return row.map((cell, columnIndex) => ({
      row: rowIndex,
      column: columnIndex,
      type: cell.type,
      isVisited: cell.visited && cell.type !== props.cellTypes.WALL,
      isPlayer:
        props.player.row === rowIndex && props.player.column === columnIndex,
    }))
  })
})

const playerFullProgressLabel = computed(() => {
  if (!props.progress?.total) {
    return ''
  }

  return `${props.progress.current}/${props.progress.total}`
})

const playerRemainingLabel = computed(() => {
  if (!props.progress?.total) {
    return ''
  }

  return `${Math.max(props.progress.total - props.progress.current, 0)}`
})

const playerProgressLabel = computed(() => {
  if (!playerFullProgressLabel.value) {
    return ''
  }

  if (shouldUseCompactPlayerLabel.value) {
    return playerRemainingLabel.value
  }

  return playerFullProgressLabel.value
})

const mazeStyle = computed(() => ({
  '--maze-columns': `${Math.max(mazeColumns.value, 1)}`,
  '--maze-rows': `${Math.max(mazeRows.value, 1)}`,
}))

const mazeAriaLabel = computed(() => {
  return `Maze ${mazeRows.value} by ${mazeColumns.value}, player at row ${props.player.row}, column ${props.player.column}`
})

const onResetClick = () => {
  emit('reset')
}

const updatePlayerLabelMode = () => {
  nextTick(() => {
    const playerMarkerElement = mazeShellElement.value?.querySelector<HTMLElement>(
      '.gamePage__player:not(.gamePage__playerMeasure)',
    )
    const playerMeasureElement = playerLabelMeasureElement.value

    if (
      !playerMarkerElement ||
      !playerMeasureElement ||
      !playerFullProgressLabel.value
    ) {
      shouldUseCompactPlayerLabel.value = false

      return
    }

    const playerMarkerRect = playerMarkerElement.getBoundingClientRect()
    const playerMeasureRect = playerMeasureElement.getBoundingClientRect()

    shouldUseCompactPlayerLabel.value =
      playerMeasureRect.width > playerMarkerRect.width ||
      playerMeasureRect.height > playerMarkerRect.height
  })
}

onMounted(() => {
  updatePlayerLabelMode()

  if (typeof ResizeObserver === 'undefined') {
    return
  }

  playerLabelResizeObserver = new ResizeObserver(() => {
    updatePlayerLabelMode()
  })

  if (mazeShellElement.value) {
    playerLabelResizeObserver.observe(mazeShellElement.value)
  }

  if (playerLabelMeasureElement.value) {
    playerLabelResizeObserver.observe(playerLabelMeasureElement.value)
  }
})

onUpdated(() => {
  updatePlayerLabelMode()
})

onBeforeUnmount(() => {
  playerLabelResizeObserver?.disconnect()
})
</script>

<style scoped lang="scss">
.gamePage {
  &__mazeShell {
    --game-maze-max-height: calc(
      var(--gameSurfaceHeight) - var(--gameControlStripHeight) -
        var(--gameSpace3)
    );

    position: relative;
    flex: 0 0 auto;
    width: min(
      100%,
      calc(var(--game-maze-max-height) * (var(--maze-columns) / var(--maze-rows)))
    );
    max-width: 100%;
    min-width: 0;
    margin: 0 auto;
  }

  &__actions {
    position: absolute;
    top: var(--gameSpace1);
    right: var(--gameSpace1);
    z-index: 1;
    display: grid;
    justify-items: end;
    gap: var(--gameSpace1);
    max-width: calc(100% - (var(--gameSpace1) * 2));
  }

  &__actionButton {
    border: 1px solid var(--color-border-hover);
    background: color-mix(in srgb, var(--color-background) 78%, transparent);
    color: var(--color-heading);
    font: inherit;
    opacity: 1;
    padding: var(--gameSpace1) var(--gameSpace2);
    line-height: 1.2;
  }

  &__indexLink {
    text-decoration: none;
  }

  &__maze {
    display: grid;
    grid-template-columns: repeat(var(--maze-columns), minmax(0, 1fr));
    width: 100%;
    aspect-ratio: var(--maze-columns) / var(--maze-rows);
    border: 1px solid var(--color-border-hover);
    background: var(--color-background);
  }

  &__cell {
    aspect-ratio: 1;
    border: 1px solid var(--color-border);
    background: var(--color-background);
    display: grid;
    place-items: center;

    &Visited {
      background: color-mix(
        in srgb,
        var(--color-heading) 12%,
        var(--color-background)
      );
    }

    &Wall {
      background: var(--color-background-mute);
    }
  }
  &__player {
    width: 78%;
    height: 78%;
    border: 1px solid var(--color-heading);
    background: var(--color-heading);
    color: var(--color-background);
    display: grid;
    place-items: center;
    padding: var(--gameSpace1);
    font-size: clamp(0.5rem, 1.3vw, 0.875rem);
    font-weight: 600;
    line-height: 1;
    text-align: center;
    white-space: nowrap;

    &Measure {
      position: absolute;
      top: 0;
      left: 0;
      width: auto;
      height: auto;
      visibility: hidden;
      pointer-events: none;
    }
  }
}
</style>
