<template>
  <div ref="bubble"
       class="bubble"
       :class="'bubble--' + size"
       :data-index="index"
       :style="{ '--bubble-color': color }">
    <div class="bubble__highlight"></div>
  </div>
</template>

<script>
export default {
  name: "Bubble",
  emits: ['expired'],
  data() {
    return {
      isFlying: false,
      startTime: 0,
    }
  },
  props: {
    index: {
      default: 0,
      type: Number,
    },
    color: {
      default: '#6ea6df',
      type: String,
    },
    size: {
      default: 'default',
      type: String,
    },
    amplitude: {
      type: Number,
      default: 30,
    },
    offset: {
      type: Number,
      default: 0
    },
  },
  methods: {
    startFlight() {
      this.isFlying = true
      this.startTime = performance.now()
      requestAnimationFrame((timestamp) => {
        this.animate(timestamp)
      });
    },
    animate(currentTime) {
      if (!this.isFlying || !this.$refs.bubble) return;

      const elapsedTime = (currentTime - this.startTime) / 1000;
      const y = elapsedTime * 0.2 * 100;
      const x = Math.sin(elapsedTime + this.offset) * this.amplitude;

      this.$refs.bubble.style.transform = `translate(${x}px, ${y}px)`;

      const fieldHeight = window.innerHeight;
      const bubbleRect = this.$refs.bubble.getBoundingClientRect();

      if (bubbleRect.top < fieldHeight) {
        requestAnimationFrame((timestamp) => this.animate(timestamp));
      } else {
        this.isFlying = false;
        this.$emit('expired', this.index);
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.startFlight()
    })
  }
}
</script>

<style lang="scss">
.bubble {
  position: absolute;
  border: 1px solid var(--bubble-color);
  background: color-mix(in srgb, var(--bubble-color), transparent 50%);
  border-radius: 50%;
  width: 40px;
  height: 40px;

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
