<template>
  <div class="c-stopwatch">
    <span class="c-stopwatch__time">{{ formattedTime }}</span>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'StopWatch',
  props: {},
  computed: {
    ...mapGetters('game', [
      'getCurrentTime'
    ]),
    formattedTime() {
      const minutes = Math.floor(this.getCurrentTime / 60)
      const seconds = Math.floor(this.getCurrentTime % 60)
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
  },
  methods: {
    ...mapActions('game', [])
  }
}
</script>

<style lang="scss" scoped>
.c-stopwatch {
  display: inline-block;
  &__time {
    font-family: monospace;
    font-size: 24px;
    font-weight: bold;
    &--default {
      color: #333;
    }
    &--primary {
      color: #3498db;
    }
  }
}
</style>