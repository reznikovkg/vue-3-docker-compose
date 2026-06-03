<template>
  <div class = "pause-overlay">
    <div class = "pause-overlay__content">
      <h2 class = "pause-overlay__title">
        {{ title }}
      </h2>

      <BaseButton
        v-if = "!gameOver"
        @click = "() => resume()"
      >
        Continue
      </BaseButton>

      <BaseButton @click = "() => restart()">
        Restart
      </BaseButton>
    </div>
  </div>
</template>

<script>
import BaseButton from './BaseButton.vue'

export default {
  name: 'PauseOverlay',

  components: {
    BaseButton
  },

  props: {
    gameOver: {
      type: Boolean,
      default: false
    }
  },

  emits: ['resume', 'restart'],

  computed: {
    title() {
      if (this.gameOver) {
        return 'Game Over'
      }

      return 'Pause'
    }
  },

  methods: {
    resume() {
      this.$emit('resume')
    },

    restart() {
      this.$emit('restart')
    }
  }
}
</script>

<style scoped lang="scss">
.pause-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;

  display: grid;
  justify-content: center;
  align-content: center;

  background: rgba(0, 0, 0, 0.45);

  &__content {
    display: grid;
    gap: 12px;

    min-width: 220px;
    padding: 24px;

    background: #ffffff;
  }

  &__title {
    color: #000000;
  }
}
</style>