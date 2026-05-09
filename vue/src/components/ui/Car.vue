<template>
  <div class="car" v-bind="$attrs" :style="styles">
    <div class="car__cuboid">
      <div class="car__cuboid__glass"/>
      <div class="car__cuboid__front"/>
      <div class="car__cuboid__cabin__top"/>
      <div class="car__cuboid__cabin__left"/>
      <div class="car__cuboid__cabin__right"/>
      <div class="car__cuboid__body__top"/>
      <div class="car__cuboid__body__left"/>
      <div class="car__cuboid__body__right"/>
      <div class="car__cuboid__back"/>
      <div class="car__cuboid__bottom"/>
    </div>
    <div class="car__wheel" style="--y: -135%; --z: -8vw;"/>
    <div class="car__wheel" style="--y: -135%; --z: 2vw;"/>
    <div class="car__wheel" style="--y: -430%; --z: -8vw;"/>
    <div class="car__wheel" style="--y: -430%; --z: 2vw;"/>
  </div>
</template>

<script lang="ts">
export default {
  name: 'Car',
  props: {
    image: {
      type: String,
    },
    direction: {
      type: Number,
      default: 0
    },
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    }
  },
  computed: {
    styles () {
      return {
        backgroundImage: `url(${this.image})`,
        top: this.y + '%',
        left: `${this.x}%`,
        transform: `rotate(${this.direction * 180}deg)`,
        '--car-depth': '30',
      }
    }
  }
}
</script>

<style scoped lang="scss">
.car {
  width: 15.5%;
  height: 33%;
  position: absolute;
  top: 0;
  background-size: 100% 100%;
  transition: 0.5s;
  transform-style: preserve-3d;
  &__cuboid {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;

    &__glass {
      background: linear-gradient(110deg, #e2f0ff 0%, #7fb4d0 40%, #1f4b6e 80%);
      box-shadow: inset -2px -2px 5px rgba(0,0,0,0.2), inset 2px 2px 8px rgba(255,255,255,0.6);
      z-index: 6;
      position: absolute;
      width: 100%;
      height: calc(var(--car-depth) * 1vmin*0.3);
      top: 0;
      transform-origin: top;
      transform: rotateX(-90deg) rotateY(180deg) translateY(calc(var(--car-depth) * 1vmin / -2));
      border-radius: 5px;
    }

    &__front {
      background: linear-gradient(45deg, #5e4f8a, #8e7bbd, #b6a3e0);
      position: absolute;
      width: 100%;
      height: calc(var(--car-depth) * 1vmin);
      top: 0;
      transform-origin: top;
      transform: rotateX(-90deg) rotateY(180deg) translateY(calc(var(--car-depth) * 1vmin / -2));
      border-radius: 5px;
      box-shadow: inset -10px 0 15px rgba(0,0,0,0.3);
    }

    &__cabin {

      &__top {
        position: absolute;
        background: linear-gradient(145deg, #6b5f8e, #8f82b3, #b2a6d6);
        width: 100%;
        height: 40%;
        transform: translateZ(calc(var(--car-depth) * 1vmin / 2));
        box-shadow: inset -10px 0 15px rgba(0, 0, 0, 0.3);
      }

      &__left {
        background: linear-gradient(135deg, #4a3f6b, #6b5f8e, #8a7ab3);
        position: absolute;
        width: calc(var(--car-depth) * 1vmin);
        height: 100%;
        left: 0;
        transform-origin: left;
        transform: rotateY(90deg) translateX(calc(var(--car-depth) * 1vmin / -2));
        border-radius: 5px;
        box-shadow: inset -10px 0 15px rgba(0,0,0,0.3);
      }

      &__right {
        position: absolute;
        background: linear-gradient(135deg, #4a3f6b, #6b5f8e, #8a7ab3);
        position: absolute;
        width: calc(var(--car-depth) * 1vmin);
        height: 100%;
        right: 0;
        transform-origin: right;
        transform: rotateY(-90deg) translateX(calc(var(--car-depth) * 1vmin / 2));
        border-radius: 5px;
        box-shadow: inset -10px 0 15px rgba(0,0,0,0.3);
      }
    }

    &__body {

      &__top {
        background: linear-gradient(115deg, #3b315c, #5c4f85, #7c6ba8);
        position: absolute;
        width: 100%;
        height: 60%;
        transform: translateZ(calc(var(--car-depth) * 1vmin / 2)) translateY(67%);
        box-shadow: inset -10px 0 15px rgba(0,0,0,0.3);
      }

      &__left {
        background: linear-gradient(100deg, #3a2f60, #5a4d85, #7a68a8);
        border-right: 3px solid rgba(0,0,0,0.5);
        position: absolute;
        width: calc(var(--car-depth) * 1vmin);
        height: 60%;
        left: 0;
        transform-origin: left;
        transform: rotateY(90deg) translateX(calc(var(--car-depth) * 1vmin / -2)) translateY(67%);
        border-radius: 5px;
        box-shadow: inset -10px 0 15px rgba(0,0,0,0.3);
      }

      &__right {
        background: linear-gradient(100deg, #3a2f60, #5a4d85, #7a68a8);
        position: absolute;
        width: calc(var(--car-depth) * 1vmin);
        height: 60%;
        right: 0;
        transform-origin: right;
        transform: rotateY(-90deg) translateX(calc(var(--car-depth) * 1vmin / 2)) translateY(67%);
        border-radius: 5px;
        box-shadow: inset -10px 0 15px rgba(0,0,0,0.3);
      }
    }

    &__back {
      background: linear-gradient(135deg, #2f264b, #4c3d70);
      position: absolute;
      width: 100%;
      height: calc(var(--car-depth) * 1vmin);
      bottom: 0;
      transform-origin: bottom;
      transform: rotateX(-90deg) translateY(calc(var(--car-depth) * 1vmin / 2));
      border-radius: 5px;
      box-shadow: inset -10px 0 15px rgba(0,0,0,0.3);
    }

    &__bottom {
      background-color: black;
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 15px;
      box-shadow: inset -10px 0 15px rgba(0,0,0,0.3);
    }
  }

  &__wheel{
    position: absolute;
    width: 7vmin;
    height: 7vmin;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #2a2a2a, #0a0a0a);
    box-shadow: 0 0 0 0.4vmin #444, 0 0 0 0.8vmin #222, inset 0 0 0 0.2vmin #555;
    transform-style: preserve-3d;
    transform: rotateY(-90deg) translateX(50%) translateY(var(--y)) translateZ(var(--z));
  }
}
</style>