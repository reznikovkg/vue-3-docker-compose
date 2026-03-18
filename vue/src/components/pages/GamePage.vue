<template>
  <div class="game-page">
    <div v-if="!gameWon">
      <div class="timer">Time: {{ time }}s</div>
      <div class="card-grid" :style="{ 'grid-template-columns': `repeat(${gridSize}, 100px)` }">
        <Card
          v-for="card in cards"
          :key="card.id"
          :selected="card.flipped"
          :matched="card.matched"
          :label="card.flipped || card.matched ? card.value.toString() : ''"
          :onClick="() => handleCardClick(card.id)"
        />
      </div>
    </div>
    <div v-else class="win-message">
      <div class="win-message-text">You won!</div>
      <p>Your time: {{ time }}s</p>
      <PairButton :onClick="() => restartGame">Restart</PairButton>
      <RouterLink :to="{ name: $routes.INDEX }">
        <PairButton>Menu</PairButton>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import PairButton from "@/components/ui/PairButton.vue"

const store = useStore()
const route = useRoute()

const cards = computed(() => store.getters['game/getCards'])
const time = computed(() => store.getters['game/getTime'])
const gameWon = computed(() => store.getters['game/isFinish'])
const difficulty = computed(() => parseInt(route.query.difficulty) || 6)
const gridSize = computed(() => Math.ceil(Math.sqrt(difficulty.value * 2)))

const handleCardClick = (cardId) => {
  store.dispatch('game/flipCard', cardId)
      .then(() => store.dispatch('game/checkForMatch'))
}

const restartGame = () => {
  store.dispatch('game/initGame', difficulty.value)
      .then(() => store.dispatch('game/startTimer'))
}

onMounted( () => {
  store.dispatch('game/initGame', difficulty.value)
      .then(() => store.dispatch('game/startTimer'))
})
</script>

<style lang="scss" scoped>
.game-page {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.timer {
  font-size: 32px;
  margin-bottom: 20px;
}

.card-grid {
  display: grid;
  grid-gap: 10px;
}

.win-message {
  text-align: center;
  &-text {
    font-size: 32px;
    margin-bottom: 20px;
  }
}
</style>
