<template>
  <main class="gamePage" aria-label="Game surface">
    <section class="gamePage__surface">
      <GameMazeBoard
        :maze="gameState.maze"
        :player="gameState.player"
        :progress="gameState.progress"
        :cell-types="cellTypes"
        :is-reset-disabled="isResetDisabled"
        @reset="() => onResetCurrentMaze()"
      />

      <GameControls
        :directions="directions"
        :available-moves="gameState.availableMoves"
        :is-complete="isComplete"
        @move="(direction) => onMovePlayer(direction)"
      />
    </section>

    <GameWinnerOverlay
      :is-complete="isComplete"
      @action="() => onWinnerAction()"
    />
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

import GameControls from '../game/GameControls.vue'
import GameMazeBoard from '../game/GameMazeBoard.vue'
import GameWinnerOverlay from '../game/GameWinnerOverlay.vue'

import type { RootState } from '../game/types'

const GAME_ACTIONS = {
  INITIALIZE_GAME: 'game/initializeGame',
  MOVE_PLAYER: 'game/movePlayer',
}

const store = useStore<RootState>()

const gameState = computed(() => store.state.game)
const configurations = computed(() => gameState.value.configurations ?? [])
const cellTypes = computed(() => gameState.value.cellTypes)
const directions = computed(() => gameState.value.directions)

const currentConfigurationIndex = computed(() => {
  return configurations.value.findIndex((configuration) => {
    return configuration.id === gameState.value.currentLevel?.id
  })
})

const isComplete = computed(() => Boolean(gameState.value.isComplete))
const isMazeSwitchDisabled = computed(() => configurations.value.length <= 1)
const isResetDisabled = computed(() => !gameState.value.currentLevel?.id)

const onMovePlayer = (direction: string) => {
  store.dispatch(GAME_ACTIONS.MOVE_PLAYER, direction)
}

const onResetCurrentMaze = () => {
  const currentLevelId = gameState.value.currentLevel?.id

  if (!currentLevelId) {
    return
  }

  store.dispatch(GAME_ACTIONS.INITIALIZE_GAME, currentLevelId)
}

const onCycleMazeConfiguration = () => {
  if (isMazeSwitchDisabled.value) {
    return
  }

  const nextIndex =
    (currentConfigurationIndex.value + 1) % configurations.value.length
  const nextConfiguration =
    configurations.value[nextIndex] ?? configurations.value[0]

  if (!nextConfiguration) {
    return
  }

  store.dispatch(GAME_ACTIONS.INITIALIZE_GAME, nextConfiguration.id)
}

const onWinnerAction = () => {
  if (isMazeSwitchDisabled.value) {
    onResetCurrentMaze()

    return
  }

  onCycleMazeConfiguration()
}
</script>

<style scoped lang="scss">
.gamePage {
  --gameSpace1: 0.5rem;
  --gameSpace2: 0.75rem;
  --gameSpace3: 1rem;
  --gameSpace4: 1.5rem;
  --gamePageInlinePadding: 2rem;
  --gameViewportPadding: 4rem;
  --gameControlStripHeight: clamp(3.5rem, 12dvh, 4.75rem);
  --gameControlsBaseWidth: 30rem;
  --gameSurfaceHeight: calc(100dvh - var(--gameViewportPadding));

  grid-column: 1 / -1;
  width: calc(100dvw - (var(--gamePageInlinePadding) * 2));
  max-width: none;
  height: var(--gameSurfaceHeight);
  min-width: 0;
  min-height: 0;
  margin-block: 0;
  margin-inline: calc(50% - 50dvw + var(--gamePageInlinePadding));
}

.gamePage__surface {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: var(--gameSpace3);
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}
</style>
