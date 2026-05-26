<template>
  <div class="game-page">
    <div class="game-page__header">
      <h1 class="game-page__title">
        Составь пару
      </h1>
      <div class="game-page__score">
        Очки: {{ score }}
      </div>
    </div>
    <div class="game-page__actions">
      <BaseButton
        text="Добавить предмет (-10)"
        data-action="add-item"
        @click="() => handleAddItem()"
      />
      <BaseButton
        text="Новая игра"
        data-action="reset-game"
        @click="() => handleResetGame()"
      />
    </div>
    <GameGrid />
    <div class="game-page__rules">
    Двойной клик по финальному предмету создаёт стартовый предмет этой ветки за 5 очков. Использовать можно 6 раз. После этого предмет исчезает. ПКМ по финальному предмету продаёт его за 30 очков. После использования финальный предмет продать нельзя.
    </div> 
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import BaseButton from './../../ui/BaseButton.vue'
import GameGrid from './../../ui/GameGrid.vue'
import { ACTIONS } from './../../store/game'

export default {
  name: 'GamePage',
  components: {
    BaseButton,
    GameGrid,
  },
  computed: {
    ...mapGetters({
      score: 'game/getScore',
    }),
  },
  mounted () {
    this.initGame()
  },
  methods: {
    ...mapActions({
      initGame: `game/${ACTIONS.INIT_GAME}`,
      addRandomItem: `game/${ACTIONS.ADD_RANDOM_ITEM}`,
      resetGame: `game/${ACTIONS.RESET_GAME}`,
    }),
    handleAddItem () {
      this.addRandomItem()
    },
    handleResetGame () {
      this.resetGame()
    },
  },
}
</script>

<style scoped lang="scss">
.game-page {
  min-height: 100vh;
  padding: 24px;
  background: #f4f4f4;
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }
  &__title {
    margin: 0;
    font-size: 36px;
  }
  &__score {
    font-size: 24px;
    font-weight: 700;
  }
  &__actions {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
  }
  &__rules {
    margin-top: 24px;
    font-size: 14px;
    line-height: 1.5;
  }
}
</style>