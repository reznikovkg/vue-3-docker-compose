<template>
  <div class="tetris">
    <Board />
    <div class="sidebar">
      <GameStats />
      <Previews />
    </div>
    <GameController />
    <TouchControls />
  </div>
</template>

<script setup>
import Board from './Board.vue'
import GameStats from './GameStats.vue'
import Previews from './Previews.vue'
import GameController from './GameController.vue'
import TouchControls from './TouchControls.vue'

const props = defineProps({
  rows: { type: Number, default: 20 },
  columns: { type: Number, default: 10 }
})
</script>

<style lang="scss" scoped>
.tetris {
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
  overflow: hidden; /* Блокируем внутренний скролл */
}

.sidebar {
  grid-area: sidebar;
  display: flex;
  flex-direction: column;
  gap: 25px;
  background: rgba(255, 255, 255, 0.1);
  padding: 25px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: 768px) {
    flex-direction: row;
    justify-content: space-around;
    align-items: flex-start;
    padding: 20px;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .tetris {
    grid-template-areas:
      "board"
      "sidebar";
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    gap: 20px;
    padding: 10px;
    padding-bottom: 150px; /* Уменьшено место для кнопок */
    max-height: 100vh;
    max-height: 100dvh;
    overflow: hidden;
  }
}

@media (max-width: 480px) {
  .tetris {
    padding: 5px;
    padding-bottom: 160px;
    gap: 15px;
  }
}
</style>