<template>
  <div class="game">
    <div class="game__grid-wrapper">
      <GameGrid />
    </div>

    <div class="game__ui">
      <Toolbar />
      <ShapeList />
    </div>
  </div>
</template>

<script setup>
import Toolbar from '../game/Toolbar.vue'
import ShapeList from '../game/ShapeList.vue'
import GameGrid from '../game/GameGrid.vue'
</script>

<style lang="less" scoped>
.game {
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: flex-start;

  &__ui {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__grid-wrapper {
    position: relative;
    width: 900px;
    height: 600px;

    border: 2px solid #ccc;
    overflow: hidden;
  }
}
</style>
