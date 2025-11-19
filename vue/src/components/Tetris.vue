<template>
  <div class="Tetris">
    <Board :board="board" />
    <div class="Sidebar">
      <GameStats :game-stats="gameStats" />
      <Previews :tetrominoes="player.tetrominoes" />
    </div>
    <GameController
      :board="board"
      :game-stats="gameStats"
      :player="player"
      @game-over="$emit('game-over', $event)"
      @player-update="setPlayer"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import Board from './Board.vue'
import GameStats from './GameStats.vue'
import Previews from './Previews.vue'
import GameController from './GameController.vue'
import { useBoard } from '../composables/useBoard.js'
import { useGameStats } from '../composables/useGameStats.js'
import { usePlayer } from '../composables/usePlayer.js'

const props = defineProps({
  rows: { type: Number, default: 20 },
  columns: { type: Number, default: 10 }
})

defineEmits(['game-over'])

const { gameStats, addLinesCleared } = useGameStats()
const { player, setPlayer, resetPlayer } = usePlayer()
const { board } = useBoard({
  rows: props.rows,
  columns: props.columns,
  player,
  resetPlayer,
  addLinesCleared
})
</script>

<style scoped>
.Tetris {
  position: relative;
  display: grid;
  grid-template-areas: "board sidebar";
  grid-template-columns: auto minmax(200px, 300px);
  grid-template-rows: 1fr;
  gap: 30px;
  justify-content: center;
  align-items: start;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

.Sidebar {
  grid-area: sidebar;
  display: flex;
  flex-direction: column;
  gap: 25px;
  background: rgba(255, 255, 255, 0.1);
  padding: 25px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

@media (max-width: 768px) {
  .Tetris {
    grid-template-areas:
      "board"
      "sidebar";
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    gap: 20px;
  }

  .Sidebar {
    flex-direction: row;
    justify-content: space-around;
    align-items: flex-start;
    padding: 20px;
    gap: 20px;
  }
}
</style>