<template>
  <div class="game-page">
    <div class="main-container">
      <div class="game-area">
        <GameGrid :gridSizeX="gridSizeX" :gridSizeY="gridSizeY" />
      </div>
      <div class="controls">
        <div class="size-controls">
          <label>
            Ширина (X):
            <input v-model.number="gridSizeX" type="number" min="4" max="20">
          </label>
          <label>
            Высота (Y):
            <input v-model.number="gridSizeY" type="number" min="4" max="20">
          </label>
        </div>
        <ModeSwitcher />
        <ShapePicker />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GameGrid from '../GameGrid.vue'
import ShapePicker from '../ShapePicker.vue'
import ModeSwitcher from '../ModeSwitcher.vue'

const gridSizeX = ref(8)
const gridSizeY = ref(8)
</script>

<style scoped>
.game-page {
  font-family: Arial, sans-serif;
  background: #f0f8ff;
  min-height: 100vh;
  padding: 20px;
}

.main-container {
  display: flex;
  max-width: 1000px;
  margin: 0 auto;
  gap: 30px;
  align-items: flex-start;
}

.game-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.controls {
  width: 500px;
  background: rgb(190, 228, 227);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.size-controls {
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
}

.size-controls label {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
}

.size-controls input {
  margin-left: 10px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 60px;
}
</style>