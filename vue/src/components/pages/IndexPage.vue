<template>
  <div class="menu">
    <div class="menu__container">
      <h1 class="menu__title">Найди пару</h1>
      <p class="menu__message">Выполнил Астахов Алексей</p>

      <div class="menu__difficulty">
        <h2 class="menu__difficulty-title">Выберите сложность:</h2>

        <div class="menu__difficulty-buttons">
          <button
            v-for="option in difficultyOptions"
            :key="option.value"
            class="menu__difficulty-btn"
            :class="{
              'menu__difficulty-btn--active':
                selectedDifficulty === option.value,
            }"
            @click="selectedDifficulty = option.value"
          >
            {{ option.label }} ({{ option.value }} карт)
          </button>
        </div>
      </div>

      <button class="menu__start-btn" @click="startGame">Начать игру</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "IndexPage",

  data() {
    return {
      difficultyOptions: [
        { label: "Легкий", value: 10 },
        { label: "Средний", value: 14 },
        { label: "Сложный", value: 20 },
      ],
      selectedDifficulty: 10,
    };
  },

  methods: {
    startGame() {
      this.$store.dispatch("startGame", this.selectedDifficulty);
      this.$router.push("/game");
    },
  },
};
</script>

<style lang="scss" scoped>
.menu {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    90deg,
    rgba(42, 123, 155, 1) 0%,
    rgba(87, 199, 133, 1) 50%,
    rgba(237, 221, 83, 1) 100%
  );

  &__container {
    max-width: 500px;
    width: 100%;
    padding: 40px 30px;
    background-color: white;
    border-radius: 20px;
    text-align: center;
  }

  &__title {
    font-size: 48px;
    color: black;
    margin-bottom: 0;
  }

  &__message {
    font-size: 25px;
    color: #2e2d2d;
    margin-top: 15px;
    margin-bottom: 20px;
  }

  &__difficulty {
    margin-bottom: 30px;

    &-title {
      font-size: 22px;
      color: #4f4d4d;
      margin-bottom: 20px;
    }

    &-buttons {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    &-btn {
      padding: 15px 20px;
      font-size: 16px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      background-color: white;
      color: #494545;
      cursor: pointer;

      &:hover {
        border-color: rgb(184, 13, 122);
      }

      &--active {
        border-color: rgb(184, 13, 122);
        background-color: rgb(184, 13, 122);
        color: white;
      }
    }
  }

  &__start-btn {
    width: 100%;
    padding: 18px;
    font-size: 20px;
    font-weight: bold;
    background-color: #3db828;
    color: white;
    border: none;
    border-radius: 50px;
    cursor: pointer;
  }
}
</style>
