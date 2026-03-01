<template>
  <div
    class="card"
    :class="{ 'card--founded': card.isFounded }"
    @click="() => handleClick()"
  >
    <div class="card__content">
      <div v-if="card.isFaceUp" class="card__front">
        <img :src="card.image" class="card__image" />
        <p class="card__title">{{ card.title }}</p>
      </div>

      <div v-else class="card__back">
        <span class="card__back-icon">?</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Card",
  props: {
    card: Object,
  },
  emits: ["flip"],
  methods: {
    handleClick() {
      if (!this.card.isFounded && !this.card.isFaceUp) {
        this.$emit("flip", this.card.id);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.card {
  width: 100%;
  height: 200px;
  cursor: pointer;

  &__content {
    width: 100%;
    height: 100%;
  }

  &--founded {
    opacity: 0;
    transition: opacity 0.5s;
    pointer-events: none;
  }

  &__front,
  &__back {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 10px;
    padding: 10px;
    box-sizing: border-box;
  }

  &__front {
    background-color: white;
  }

  &__back {
    background-color: rgb(184, 13, 122);
  }

  &__image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 50%;
    margin-bottom: 10px;
  }

  &__title {
    font-weight: bold;
    color: black;
  }

  &__back-icon {
    color: yellow;
    font-size: 80px;
    font-weight: bold;
  }
}
</style>
