<template>
  <div class="car" :class="{ 'car--hit': hit }" :style="styles">
    <div class="car__body">
      <div class="car__body__top" />
      <div class="car__body__back" />
      <div class="car__body__front" />
      <div class="car__body__left" />
      <div class="car__body__right" />
      <div class="car__body__bottom" />
    </div>
    <div class="car__wheel car__wheel--fl" />
    <div class="car__wheel car__wheel--fr" />
    <div class="car__wheel car__wheel--rl" />
    <div class="car__wheel car__wheel--rr" />
  </div>
</template>

<script lang="ts">
export default {
  name: 'Car',
  props: {
    color: {
      type: String,
      default: '#d64545'
    },
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    },
    hit: {
      type: Boolean,
      default: false
    },
  },
  computed: {
    styles () {
      return {
        left: `${this.x - 7.5}%`,
        top: this.y + '%',
        '--car-color': this.color,
        '--car-dark': this.shade(this.color, -45),
      }
    }
  },
  methods: {
    shade(hex: string, delta: number) {
      const value = parseInt(hex.slice(1), 16)
      const clamp = (n: number) => Math.min(255, Math.max(0, n))
      const r = clamp(((value >> 16) & 255) + delta)
      const g = clamp(((value >> 8) & 255) + delta)
      const b = clamp((value & 255) + delta)
      return `rgb(${r}, ${g}, ${b})`
    },
  },
}
</script>

<style scoped lang="scss">
.car {
  --car-depth: 12;

  position: absolute;
  top: 0;
  width: 15%;
  height: 30%;
  transform-style: preserve-3d;
  transition: left 0.45s ease, top 0.06s linear, opacity 0.3s ease;

  &--hit {
    opacity: 0.35;
  }

  &__body {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transform: translateZ(1px);

    &__top {
      position: absolute;
      inset: 0;
      border-radius: 8px;
      transform: translateZ(calc(var(--car-depth) * 1vmin));
      background: linear-gradient(
        to bottom,
        var(--car-color) 0%,
        var(--car-color) 13%,
        #1d2837 13%,
        #2e435f 21%,
        var(--car-dark) 21%,
        var(--car-dark) 47%,
        #1d2837 47%,
        #2e435f 54%,
        var(--car-color) 54%,
        var(--car-color) 100%
      );
      box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.4);
    }

    &__back {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: calc(var(--car-depth) * 1vmin);
      transform-origin: bottom;
      transform: rotateX(-90deg);
      background:
        radial-gradient(circle at 16% 78%, #ff4d5a 0 9%, transparent 10%),
        radial-gradient(circle at 84% 78%, #ff4d5a 0 9%, transparent 10%),
        linear-gradient(to bottom, #22303f 0%, #22303f 24%, var(--car-color) 24%);
    }

    &__front {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: calc(var(--car-depth) * 1vmin);
      transform-origin: top;
      transform: rotateX(90deg);
      background: var(--car-color);
    }

    &__left {
      position: absolute;
      left: 0;
      top: 0;
      width: calc(var(--car-depth) * 1vmin);
      height: 100%;
      transform-origin: left;
      transform: rotateY(-90deg);
      background: var(--car-dark);
    }

    &__right {
      position: absolute;
      right: 0;
      top: 0;
      width: calc(var(--car-depth) * 1vmin);
      height: 100%;
      transform-origin: right;
      transform: rotateY(90deg);
      background: var(--car-dark);
    }

    &__bottom {
      position: absolute;
      inset: 0;
      border-radius: 8px;
      background: rgba(10, 12, 16, 0.75);
    }
  }

  &__wheel {
    position: absolute;
    width: 4.5vmin;
    height: 4.5vmin;
    border-radius: 50%;
    background: radial-gradient(circle at 32% 32%, #3d3d3d, #0a0a0a);
    transform: rotateX(90deg);

    &--fl {
      top: 1%;
      left: -2%;
    }

    &--fr {
      top: 1%;
      right: -2%;
    }

    &--rl {
      bottom: 1%;
      left: -2%;
    }

    &--rr {
      bottom: 1%;
      right: -2%;
    }
  }
}
</style>
