<template>
  <div
      class="puzzle__tile"
      :class="tileClasses"
      :style="tileStyle"
      @click="() => handleClick()"
  >
    <span v-if="!isEmpty">{{ value }}</span>
    <span v-if="isBlocked" class="puzzle__tile__blocked">🚫</span>
    <span v-if="isFrozen" class="puzzle__tile__frozen">❄️</span>
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
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isFrozen: {
      type: Boolean,
      default: false,
    },
    tileStyle: {
      type: Object,
      default: () => ({}),
    },
    allowAnyMove: {
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
        'puzzle__tile--blocked': this.isBlocked,
        'puzzle__tile--special': this.allowAnyMove && !this.isEmpty,
        'puzzle__tile--frozen': this.isFrozen,
      }
    },
  },
  methods: {
    handleClick() {
      if (!this.isEmpty && !this.isFrozen) {
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
  box-sizing: border-box;
  transition: transform 0.2s ease, background-color 0.2s ease;

  &:active {
    transform: scale(0.95);
    background-color: #555;
  }

  &--empty {
    background-color: transparent;
    cursor: default;
    transform: scale(0);
  }

  &--win {
    background-color: #4CAF50;
  }

  &--blocked {
    background-color: #666;
    cursor: not-allowed;
    opacity: 0.6;

    &::after {
      content: '🚫';
      position: absolute;
      font-size: 20px;
      opacity: 0.8;
    }
  }

  &--special {
    background-color: #667eea;
    animation: specialGlow 1.5s ease-in-out infinite;

    &:active {
      background-color: #764ba2;
    }
  }

  &--frozen {
    background-color: #00bcd4;
    cursor: not-allowed;
    opacity: 0.8;

    &::after {
      content: '❄️';
      position: absolute;
      font-size: 20px;
      opacity: 0.8;
    }
  }

  &__blocked {
    position: absolute;
    font-size: 20px;
    opacity: 0.8;
  }

  &__frozen {
    position: absolute;
    font-size: 20px;
    opacity: 0.8;
  }
}

@keyframes specialGlow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(102, 126, 234, 0.5);
  }
  50% {
    box-shadow: 0 0 15px rgba(102, 126, 234, 0.8);
  }
}
</style>