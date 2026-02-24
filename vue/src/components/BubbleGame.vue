<template>
  <div class="c-game">
    <slot name="start" :onStart="handleStart">
      <button type="button" class="c-game__start" @click="() => handleStart()">
        <slot name="start-label"></slot>
      </button>
    </slot>

    <div class="c-game__field">
      <button
        v-for="bubble in bubbles"
        :key="bubble.id"
        type="button"
        class="c-game__bubble"
        :class="'c-game__bubble--' + bubble.color"
        :style="{ top: bubble.top + 'px', left: bubble.left + 'px' }"
        @click="() => handleBubbleClick(bubble.id)"
      ></button>
    </div>
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
      bubbles: [
        { id: 1, color: 'red', top: 50, left: 60 },
        { id: 2, color: 'blue', top: 140, left: 220 },
        { id: 3, color: 'green', top: 240, left: 120 },
        { id: 4, color: 'red', top: 320, left: 360 }
      ],
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
    },

    handleBubbleClick(id) {
      const clickedBubbleId = id
      void clickedBubbleId
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
  position: relative;
  width: 640px; // Пока будет так
  height: 480px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
}

.c-game__bubble {
  position: absolute;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
}

.c-game__bubble--red {
  background: #ff4d4f;
}

.c-game__bubble--blue {
  background: #4096ff;
}

.c-game__bubble--green {
  background: #73d13d;
}
</style>
