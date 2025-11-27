<template>
  <div class="tetris">
    <Board />
    <div class="sidebar">
      <GameStats />
      <Previews />
    </div>
    <GameController />
  </div>
</template>

<script setup>
import { watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import Board from './Board.vue'
import GameStats from './GameStats.vue'
import Previews from './Previews.vue'
import GameController from './GameController.vue'

const props = defineProps({
  rows: { type: Number, default: 20 },
  columns: { type: Number, default: 10 }
})

const store = useStore()

// Следим за изменениями игрока и обновляем доску
watch(
  () => store.getters['player/player'],
  () => {
    store.dispatch('board/updateBoard')
  },
  { deep: true }
)

onMounted(() => {
  console.log('Tetris component mounted')
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
  }
}
</style>