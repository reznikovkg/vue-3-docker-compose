<template>
  <div
      class="puzzle__tile"
      :class="tileClasses"
      :style="tileStyle"
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
    tileStyle: {
      type: Object,
      default: () => ({}),
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
  width: 100%;
  height: 100%;
  background-color: #333;
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
</style>