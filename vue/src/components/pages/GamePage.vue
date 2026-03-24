<template>
  <div class="game-page">
    <div v-if="!gameWon">
      <div class="game-page__timer">
        Time: {{ time }}s
        <RouterLink :to="{ name: $routes.INDEX}">
          <PairButton label="Back to Menu" />
        </RouterLink>
      </div>
      <div class="game-page__card-grid" :style="{ 'grid-template-columns': `repeat(${gridSize}, 100px)` }">
        <div class="game-page__card-stack" v-for="i in (difficulty * 2)" :key="i">
          <Card
            v-for="card in getCardsByPosition(i - 1)"
            :key="card.id"
            :card="card"
            @onClick="handleCardClick(card.id)"
            :is-blocked="isCardBlocked(card)"
          />
        </div>
      </div>

    </div>
    <div v-else class="game-page__win-message">
      <div class="game-page__win-message-text">You won!</div>
      <p>Your time: {{ time }}s</p>
      <PairButton :onClick="() => restartGame()" label="Restart" />
      <RouterLink :to="{ name: $routes.INDEX }">
        <PairButton label="Menu" />
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
const layers = computed(() => parseInt(route.query.layers) || 1)
const gridSize = computed(() => Math.ceil(Math.sqrt(difficulty.value * 2)))

const getCardsByPosition = (position) => {
  return cards.value.filter(card => card.position === position).sort((a, b) => a.layer - b.layer)
}

const isCardBlocked = (card) => {
  const cardsOnTop = cards.value.filter(c => c.position === card.position && c.layer > card.layer && !c.matched)
  return cardsOnTop.length > 0
}

const handleCardClick = (cardId) => {
  store.dispatch('game/flipCard', cardId)
      .then(() => store.dispatch('game/checkForMatch'))
}

const restartGame = () => {
  store.dispatch('game/initGame', { difficulty: difficulty.value, layers: layers.value })
      .then(() => store.dispatch('game/startTimer'))
}

onMounted( () => {
  store.dispatch('game/initGame', { difficulty: difficulty.value, layers: layers.value })
      .then(() => store.dispatch('game/startTimer'))
})
</script>

<style lang="scss" scoped>
.game-page {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  &__timer {
    font-size: 32px;
    margin-bottom: 20px;
  }

  &__card-grid {
    display: grid;
    grid-gap: 15px;
  }

  &__card-stack {
    position: relative;
    width: 115px;
    height: 115px;
  }

  &__win-message {
    text-align: center;
  }

  &__win-message-text {
    font-size: 32px;
    margin-bottom: 20px;
  }
}
</style>
