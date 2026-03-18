<template>
  <div class="game-page">
    <div class="game-page__header">
      <div class="game-page__score">
        Очки: {{ score }}
      </div>
      <div class="game-page__controls">
        <button
            class="button button--primary"
            :disabled="score < buyCost"
            @click="() => buyItem()"
        >
            Купить элемент ({{ buyCost }} очков)
        </button>
        <button
            class="button button--primary"
            :disabled="score < expandCost || score < expandScoreRequired"
            @click="() => expandGrid()"
        >
            Расширить сетку ({{ expandCost }} очков)
        </button>
        <button
            class="button button--primary"
            @click="() => newGame()"
        >
            Новая игра
        </button>
    </div>
</div>

    <GameGrid
      :grid="grid"
      :grid-size="gridSize"
    />
   </div>
</template>

<script setup>
import GameGrid from '../ui/GameGrid.vue'
import { useStore } from 'vuex'
import { computed, onMounted } from 'vue'

const store = useStore()
const grid = computed(() => store.state.grid)
const gridSize = computed(() => store.state.gridSize)
const score = computed(() => store.state.score)
const buyCost = computed(() => store.state.buyCost)
const expandCost = computed(() => store.getters.expandCost)
const expandScoreRequired = computed(() => store.getters.expandScoreRequired)
const newGame = () => store.dispatch('newGame')
const buyItem = () => store.dispatch('buyItem')
const expandGrid = () => store.dispatch('expandGrid')
onMounted(() => store.dispatch('loadGame'))
</script>

<style lang="scss">
.game-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  position: relative;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 10px;
    background: #fffdfd;
    border-radius: 8px;
    flex-wrap: wrap;
    gap: 10px;
  }

  &__score {
    font-size: 24px;
    font-weight: bold;
    color: #000000;
  }

  &__controls {
    display: flex;
    gap: 10px;
  }
}

.button {
  padding: 10px 20px;
  background: #9d45cd;
  color: #000000;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;

  &:hover:not(:disabled) {
    background: darken(#9d45cd, 10%);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

</style>