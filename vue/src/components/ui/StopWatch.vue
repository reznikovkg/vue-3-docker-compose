<template>
  <div class="stopwatch">
    <p class="stopwatch__text">{{ showTime }}</p>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Stopwatch',
  data() {
    return {
      timer: null
    }
  },
  computed: {
    ...mapGetters([
      'getTime',
      'getIsGameWon'
    ]),
    showTime() {
      const minutes = Math.floor(this.getTime / 60)
      const seconds = this.getTime % 60

      if (minutes > 0) {
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      }

      return `${seconds.toString().padStart(2, '0')}`
    }
  },
  mounted() {
    this.timer = setInterval(() => {
      if (!this.getIsGameWon) {
        this.setTime({ time: this.getTime + 1 })
      }
    }, 1000)
  },
  beforeUnmount() {
    clearInterval(this.timer)
  },
  methods: {
    ...mapActions([
      'setTime'
    ])
  }
}
</script>

<style scoped lang="scss">
.stopwatch {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  padding: 14px 20px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.62);
  backdrop-filter: blur(10px);
  box-shadow:
    0 10px 24px rgba(41, 65, 85, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.55);

  &__text {
    color: #243746;
    font-size: 28px;
    font-weight: 800;
    line-height: 1;
    text-align: center;
  }
}
</style>