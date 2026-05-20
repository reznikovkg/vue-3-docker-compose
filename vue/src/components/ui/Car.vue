<template>
  <div class="car" v-bind="$attrs" :style="styles">
    <div class="car__cuboid">
      <div class="car__cuboid__front" style="--deg: 45deg; --color1: #5e4f8a; --color2: #8e7bbd; --color3: #b6a3e0; --height: 1;"/>
      <div class="car__cuboid__front" style="--deg: 110deg; --color1:#e2f0ff 0%; --color2: #7fb4d0 40%; --color3: #1f4b6e 80%; --height: 0.3;"/>
      <div class="car__cuboid__top" style="--deg: 145deg; --color1: #6b5f8e; --color2: #8f82b3; --color3: #b2a6d6; --height: 40%; --transY: 0%;"/>
      <div class="car__cuboid__left" style="--deg: 135deg; --color1: #4a3f6b; --color2: #6b5f8e; --color3: #8a7ab3; --height: 40%; --transY: 0%;"/>
      <div class="car__cuboid__right" style="--deg: 135deg; --color1: #4a3f6b; --color2: #6b5f8e; --color3: #8a7ab3; --height: 40%; --transY: 0%;"/>
      <div class="car__cuboid__top" style="--deg: 115deg; --color1: #3b315c; --color2: #5c4f85; --color3: #7c6ba8; --height: 60%; --transY: 67%;"/>
      <div class="car__cuboid__left" style="--deg: 100deg; --color1: #3a2f60; --color2: #5a4d85; --color3: #7a68a8; --height: 60%; --transY: 67%;"/>
      <div class="car__cuboid__right" style="--deg: 100deg; --color1: #3a2f60; --color2: #5a4d85; --color3: #7a68a8; --height: 60%; --transY: 67%;"/>
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

    &__front {
      background: linear-gradient(var(--deg), var(--color1), var(--color2), var(--color3));
      position: absolute;
      width: 100%;
      height: calc(var(--car-depth) * 1vmin * var(--height));
      top: 0;
      transform-origin: top;
      transform: rotateX(-90deg) rotateY(180deg) translateY(calc(var(--car-depth) * 1vmin / -2));
      border-radius: 5px;
      box-shadow: inset -10px 0 15px rgba(0,0,0,0.3);
    }

    &__top {
      position: absolute;
      background: linear-gradient(var(--deg), var(--color1), var(--color2), var(--color3));
      width: 100%;
      height: var(--height);
      transform: translateZ(calc(var(--car-depth) * 1vmin / 2)) translateY(var(--transY));
      box-shadow: inset -10px 0 15px rgba(0, 0, 0, 0.3);
    }

    &__left {
      position: absolute;
      background: linear-gradient(var(--deg), var(--color1), var(--color2), var(--color3));
      width: calc(var(--car-depth) * 1vmin);
      height: var(--height);
      left: 0;
      transform-origin: left;
      transform: rotateY(90deg) translateX(calc(var(--car-depth) * 1vmin / -2)) translateY(var(--transY));
      border-radius: 5px;
      box-shadow: inset -10px 0 15px rgba(0,0,0,0.3);
      border-right: 3px solid rgba(0,0,0,0.5);
    }

    &__right {
      position: absolute;
      background: linear-gradient(var(--deg), var(--color1), var(--color2), var(--color3));
      width: calc(var(--car-depth) * 1vmin);
      height: var(--height);
      right: 0;
      transform-origin: right;
      transform: rotateY(-90deg) translateX(calc(var(--car-depth) * 1vmin / 2)) translateY(var(--transY));
      border-radius: 5px;
      box-shadow: inset -10px 0 15px rgba(0,0,0,0.3);
      border-left: 3px solid rgba(0,0,0,0.5);
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