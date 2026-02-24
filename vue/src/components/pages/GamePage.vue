<template>
  <div class="game">
    <header class="game__header">
      <button class="game__back-button" @click="goToMenu">В меню</button>
      <h1 class="game__timer">00:00</h1>
    </header>

    <div
      class="game__cards-container"
      :class="`game__cards-container--${cards.length}`"
    >
      <Card
        v-for="card in cards"
        :key="card.id"
        :card="card"
        @flip="handleFlip"
      />
    </div>

    <div v-if="isGameFinished" class="game-over">
      <div class="game-over__content">
        <h2 class="game-over__title">Game Over!</h2>
        <p class="game-over__message">Вы нашли все пары!</p>

        <div class="game-over__buttons">
          <button
            class="game-over__button game-over__button--restart"
            @click="restartGame"
          >
            Играть снова
          </button>
          <button
            class="game-over__button game-over__button--menu"
            @click="goToMenu"
          >
            В меню
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Card from "../Card.vue";
import { mapState, mapGetters } from "vuex";

export default {
  name: "GamePage",

  components: {
    Card,
  },

  computed: {
    ...mapState(["cards"]),
    ...mapGetters(["isGameFinished"]),
  },

  methods: {
    handleFlip(cardId) {
      this.$store.dispatch("flipCard", cardId);
    },

    restartGame() {
      const difficulty = this.$store.state.difficulty;
      this.$store.dispatch("startGame", difficulty);
    },

    goToMenu() {
      this.$store.dispatch("resetGame");
      this.$router.push("/");
    },
  },
};
</script>

<style lang="scss" scoped>
.game {
  min-height: 100vh;
  background: linear-gradient(
    90deg,
    rgba(42, 123, 155, 1) 0%,
    rgba(87, 199, 133, 1) 50%,
    rgba(237, 221, 83, 1) 100%
  );
  padding: 20px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: white;
    padding: 15px 20px;
    border-radius: 10px;
    margin-bottom: 30px;
  }

  &__back-button {
    padding: 8px 16px;
    background-color: #4cd834;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
  }

  &__timer {
    font-size: 24px;
    color: black;
    margin: 0;
  }

  &__cards-container {
    display: grid;
    gap: 30px;
    justify-content: center;
    max-width: 1200px;
    margin: 0 auto;

    &--10 {
      grid-template-columns: repeat(5, 1fr);
    }

    &--14 {
      grid-template-columns: repeat(7, 1fr);
    }

    &--20 {
      grid-template-columns: repeat(8, 1fr);
    }
  }
}

.game-over {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;

  &__content {
    background-color: white;
    padding: 40px;
    border-radius: 20px;
    text-align: center;
    max-width: 400px;
    width: 90%;
  }

  &__title {
    font-size: 42px;
    color: black;
    margin-bottom: 15px;
  }

  &__message {
    font-size: 22px;
    color: rgb(113, 109, 109);
    margin-bottom: 10px;
  }

  &__buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 30px;
  }

  &__button {
    padding: 12px 25px;
    font-size: 16px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s;

    &--restart {
      background-color: #4cd834;
      color: white;
    }

    &--menu {
      background-color: gray;
      color: black;
    }
  }
}
</style>
