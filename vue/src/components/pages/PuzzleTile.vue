<template>
  <div
      class="puzzle__tile"
      :class="tileClasses"
      @click="() => handleClick()"
  >
    <span v-if="!isEmpty">{{ value }}</span>
  </div>
</template>

<script>
export default {
  name: 'PuzzleTile',
  props: {
    value: {
      type: Number,
      required: true,
    },
    isEmpty: {
      type: Boolean,
      default: false,
    },
    isWin: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['click'],
  computed: {
    tileClasses() {
      return {
        'puzzle__tile--empty': this.isEmpty,
        'puzzle__tile--win': this.isWin,
      }
    },
  },
  methods: {
    handleClick() {
      if (!this.isEmpty) {
        this.$emit('click')
      }
    },
  },
}
</script>

<style scoped lang="scss">
.puzzle__tile {
  width: 80px;
  height: 80px;
  background-color: #333;
  color: #fff;
  font-size: 28px;
  font-weight: bold;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: sans-serif;
  cursor: pointer;
  user-select: none;
  transition: all 0.15s ease;

  &:active {
    transform: scale(0.95);
    background-color: #555;
  }

  &--empty {
    background-color: transparent;
    cursor: default;
  }

  &--win {
    background-color: #4CAF50;
  }
}

@media (max-width: 500px) {
  .puzzle__tile {
    width: 70px;
    height: 70px;
    font-size: 24px;
  }
}

@media (max-width: 350px) {
  .puzzle__tile {
    width: 60px;
    height: 60px;
    font-size: 20px;
  }
}
</style>