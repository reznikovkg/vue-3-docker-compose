<template>
  <div class="board-wrapper">
    <div class="board-wrapper__layer">
      Текущий слой: {{ currentLayer }}
    </div>

    <div
      v-for="layer in layers"
      :key="layer"
      :class="[
        'board',
        'board-' + layer,
        {
          'board--active': layer === currentLayer
        }
      ]"
    >
      <GameCard
        v-for="card in getCards(layer)"
        :key="card.id"
        :card="card"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import GameCard from './GameCard.vue'

export default {
  name: 'GameBoard',

  components: {
    GameCard
  },

  computed: {
    ...mapGetters([
      'cards',
      'layers',
      'currentLayer'
    ])
  },

  methods: {
    getCards(layer) {
      return this.cards.filter(card => {
        return (
          card.layer === layer &&
          !card.removed
        )
      })
    }
  }
}
</script>

<style scoped lang="scss">
.board-wrapper {
  position: relative;

  width: 700px;
  height: 700px;

  margin: 0 auto;

  &__layer {
    position: absolute;

    top: -50px;
    left: 0;

    font-size: 28px;
    font-weight: bold;
  }
}

.board {
  position: absolute;

  display: grid;

  grid-template-columns: repeat(4, 120px);

  gap: 10px;

  background: #dcdcdc;

  padding: 10px;

  border-radius: 10px;

  pointer-events: none;

  &--active {
    background: transparent;

    pointer-events: all;
  }
}

.board-1 {
  top: 0;
  left: 0;
  z-index: 5;
}

.board-2 {
  top: 20px;
  left: 20px;
  z-index: 4;
}

.board-3 {
  top: 40px;
  left: 40px;
  z-index: 3;
}

.board-4 {
  top: 60px;
  left: 60px;
  z-index: 2;
}

.board-5 {
  top: 80px;
  left: 80px;
  z-index: 1;
}
</style>