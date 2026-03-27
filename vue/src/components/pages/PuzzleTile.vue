<template>
  <div
      class="game-area__tile"
      :class="tileClasses"
      :style="tileSize"
      @click="() => handleClick()"
  >
    <span v-if="!isVoid">{{ num }}</span>
  </div>
</template>

<script>
export default {
  name: 'PuzzleTile',
  props: {
    num: {
      type: Number,
      required: true
    },
    isVoid: {
      type: Boolean,
      default: false
    },
    finished: {
      type: Boolean,
      default: false
    },
    tileSize: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['click'],
  computed: {
    tileClasses() {
      return {
        'game-area__tile--empty': this.isVoid,
        'game-area__tile--complete': this.finished
      }
    }
  },
  methods: {
    handleClick() {
      if (!this.isVoid) {
        this.$emit('click')
      }
    }
  }
}
</script>

<style scoped lang="scss">
.game-area__tile {
  width: 100%;
  height: 100%;
  background-color: #1976d2;
  color: #fff;
  font-weight: bold;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: sans-serif;
  cursor: pointer;
  user-select: none;
  transition: all 0.15s ease;
  box-sizing: border-box;

  &:active {
    transform: scale(0.95);
    background-color: #42a5f5;
  }

  &--empty {
    background-color: transparent;
    cursor: default;
  }

  &--complete {
    background-color: #81c784;
    color: #000;
  }
}
</style>