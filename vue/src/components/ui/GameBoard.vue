<template>
  <div
      class="board"
      :style="boardStyle"
  >
    <button
        v-for="(value, index) in gameBoard"
        :key="index"
        class="tile"
        :class="{ empty: value === 0 }"
        @click="() => moveTile(index)"
    >
      {{ value === 0 ? '' : value }}
    </button>
  </div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex'

export default {
  name: 'GameBoard',
  computed: {
    ...mapGetters({
      gameBoard: 'getGameBoard',
      gameWidth: 'getGameWidth',
      gameHeight: 'getGameHeight'
    }),
    boardStyle() {
      return {
        gridTemplateColumns: `repeat(${this.gameWidth}, 85px)`
      }
    }
  },
  methods: {
    ...mapActions({
      moveTile: 'moveTile'
    })
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/styles";

.board {
  display: grid;
  gap: 12px;
  background: $boardBg;
  padding: 20px;
  border-radius: 30px;
}

.tile {
  @include tileBase;
  @include tileShadow;

  &.empty {
    background: $tileEmptyBg;
    box-shadow: inset 0 0 0 2px $tileEmptyBorder, 0 4px 0 $tileEmptyShadow;
    color: transparent;

    &::after {
      content: '○';
      font-size: 32px;
      color: $tileEmptySymbol;
    }
  }

  &:active {
    transform: translateY(4px);
    box-shadow: 0 0 0 $tileShadow, 0 4px 12px $shadowColorActive;
  }
}
</style>
