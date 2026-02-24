<template>
  <div class="game-page">
    <GameBoard />
  </div>
</template>

<script setup lang="ts">
import GameBoard from '@/components/game/GameBoard.vue'
</script>

<style scoped lang="scss">
.game-page {
  min-height: 100vh;
  margin: 0;
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
}
</style>
