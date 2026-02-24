<template>
  <div class="c-game">
    <slot name="start" :onStart="handleStart">
      <button type="button" class="c-game__start" @click="() => handleStart()">
        <slot name="start-label"></slot>
      </button>
    </slot>

    <div class="c-game__field"></div>
  </div>
</template>

<script>
export default {
  name: 'BubbleGame',

  props: {
    colorsCount: {
      type: Number,
      default: 3
    },
    targetColor: {
      type: String,
      default: 'red'
    },
    intensity: {
      type: Number,
      default: 1
    },
    scoreHit: {
      type: Number,
      default: 1
    },
    scoreMiss: {
      type: Number,
      default: -5
    },
    onStart: {
      type: Function,
      default: null
    }
  },

  emits: ['finish', 'update:score'],

  data() {
    return {
      score: 0,
      bubbles: [],
      isRunning: false
    }
  },

  methods: {
    handleStart() {
      this.isRunning = true

      if (typeof this.onStart === 'function') {
        this.onStart()
      }

      this.$emit('update:score', this.score)
    }
  }
}
</script>

<style lang="scss">
.c-game {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.c-game__start {
  width: fit-content;
}

.c-game__field {
  width: 640px; // Пока будет так
  height: 480px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
}
</style>
