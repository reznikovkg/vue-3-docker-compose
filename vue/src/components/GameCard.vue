<template>
  <div
    class="card"
    :class="{
      opened: card.opened,
      removed: card.removed
    }"
    @click="flip"
  >
    <div v-if="!card.opened">
      ?
    </div>

    <img
      v-if="card.opened"
      :src="`/src/assets/cards/${card.value}.png`"
      class="card__image"
    />

    <div class="card__layer">
      {{ card.layer }}
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'GameCard',

  props: {
    card: Object
  },

  methods: {
    ...mapActions([
      'flipCard'
    ]),

    flip() {
      this.flipCard(this.card.id)
    }
  }
}
</script>

<style scoped lang="scss">
.card {
  width: 120px;
  height: 120px;

  background: white;

  border-radius: 10px;

  display: flex;
  justify-content: center;
  align-items: center;

  position: relative;

  border: 2px solid purple;

  cursor: pointer;

  overflow: hidden;

  font-size: 32px;

  &.opened {
    background: #dfb8ff;
  }

  &.removed {
    opacity: 0;
    pointer-events: none;
  }

  &__image {
    width: 70px;
    height: 70px;
    object-fit: contain;
  }

  &__layer {
    position: absolute;
    bottom: 5px;
    right: 5px;
    font-size: 12px;
  }
}
</style>