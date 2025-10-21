<template>
  <div class="game-page">
    <div class="game-page__container">
      <div class="game-page__area">
        <GameGrid :gridSizeX="gridSizeX" :gridSizeY="gridSizeY" />
      </div>
      <div class="game-page__controls">
        <div class="game-page__settings">
          <label class="game-page__label">
            Ширина (X):
            <input 
              v-model.number="gridSizeX" 
              type="number" 
              min="4" 
              max="20"
              class="game-page__input"
            >
          </label>
          <label class="game-page__label">
            Высота (Y):
            <input 
              v-model.number="gridSizeY" 
              type="number" 
              min="4" 
              max="20"
              class="game-page__input"
            >
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

<style scoped lang="less">
.game-page {
  font-family: Arial, sans-serif;
  background: #f0f8ff;
  min-height: 100vh;
  padding: 20px;

  &__container {
    display: flex;
    max-width: 1200px;
    margin: 0 auto;
    gap: 150px;
    align-items: flex-start;
  }

  &__area {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__controls {
    width: 500px;
    background: rgb(190, 228, 227);
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  &__settings {
    margin-bottom: 20px;
    padding: 15px;
    background: white;
    border-radius: 8px;
  }

  &__label {
    display: block;
    margin-bottom: 10px;
    font-weight: bold;
  }

  &__input {
    margin-left: 10px;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 60px;
  }
}
</style>