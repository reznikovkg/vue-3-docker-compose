<template>
  <div class="game-board">
    <GameBoardControls
      :grid-size="gridSize"
      @size-change="(size) => handleSizeChange(size)"
      @reset="initializeBoard"
    />

    <div class="game-board__grid">
      <div
        v-for="(rowGems, rowIndex) in gameBoard"
        :key="rowIndex"
        class="game-board__row"
      >
        <Gem
          v-for="gem in rowGems"
          :key="gem.id"
          :gem="gem"
          @click="() => handleGemSelect(gem)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameBoard } from "@/composables"
import Gem from "@/components/parts/game/Gem.vue"
import GameBoardControls from "@/components/parts/game/GameBoardControls.vue"

const {
  gameBoard,
  gridSize,

  initializeBoard,
  handleGemSelect,
  handleSizeChange,
} = useGameBoard()

initializeBoard()
</script>

<style lang="scss" scoped>
.game-board {
  display: flex;
  flex-direction: column;
  gap: 20px;

  &__grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__row {
    display: flex;
    gap: 8px;
    justify-content: center;
  }
}
</style>
