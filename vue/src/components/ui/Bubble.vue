<template>
  <div ref="bubble"
       class="bubble"
       :class="['bubble--' + color, 'bubble--' + size]"
       @click="() => pop()">
    <div class="bubble__highlight"></div>
  </div>
</template>

<script>
export default {
  name: "Bubble",
  emits: ['pop'],
  data() {
    return {
      isFlying: false,
      startTime: 0,
    }
  },
  props: {
    color: {
      default: 'default',
      type: String,
    },
    size: {
      default: 'default',
      type: String,
    },
  },
  methods: {
    startFlight() {
      this.isFlying = true;
      this.startTime = performance.now();

      requestAnimationFrame((timestamp) => {
        this.animate(timestamp)
      });
    },
    animate(currentTime) {
      if (!this.isFlying || !this.$refs.bubble) return

      const elapsedTime = currentTime - this.startTime
      const progress = Math.min(elapsedTime / 5000, 1)
      this.$refs.bubble.style.transform = `translateY(${progress * 100}px)`

      if (elapsedTime < 5000) {
        requestAnimationFrame((timestamp) => this.animate(timestamp))
      } else {
        this.isFlying = false
      }
    },
    pop() {
      this.$emit('pop');
      this.isFlying = false;

    }
  },
  mounted() {
    this.$nextTick(() => {
      this.startFlight()
    });
  }
}
</script>

<style lang="scss">
.bubble {
  position: absolute;
  border: 1px solid #6ea6df;
  background: rgba(110, 166, 223, 0.5);
  border-radius: 50%;
  width: 40px;
  height: 40px;

  &--blue {
    border: 1px solid #0879ea;
    background: rgba(8, 121, 234, 0.5);
  }

  &--breeze {
    border: 1px solid #06b8a2;
    background: rgba(6, 184, 162, 0.5);
  }

  &--purple {
    border: 1px solid #7506dc;
    background: rgba(117, 6, 220, 0.5);
  }

  &--pink {
    border: 1px solid #ad39ba;
    background: rgba(173, 57, 186, 0.5);
  }

  &--small {
    width: 20px;
    height: 20px;
  }

  &--medium {
    width: 40px;
    height: 40px;
  }

  &--big {
    width: 80px;
    height: 80px;
  }

  &__highlight {
    position: absolute;
    top: 15%;
    left: 15%;
    width: 30%;
    height: 30%;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 50%;
    filter: blur(2px);
  }
}
</style>
