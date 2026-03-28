<template>
  <div
    :class="['car', `car--${variant}`]"
    :style="styleObject"
  >
    <div class="car__body">
      <div class="car__roof" />
      <div class="car__side car__side--left" />
      <div class="car__side car__side--right" />
      <div class="car__wheel car__wheel--fl" />
      <div class="car__wheel car__wheel--fr" />
      <div class="car__wheel car__wheel--rl" />
      <div class="car__wheel car__wheel--rr" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  styleObject: Record<string, string>
  variant: 'player' | 'enemy'
}>()
</script>

<style scoped lang="scss">
.car {
  position: absolute;
  top: 0;
  left: 0;
  transform-style: preserve-3d;
  transform-origin: center center;
  pointer-events: none;
  transition: transform 0.12s ease-out;
  z-index: 2;

  &__body {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 8px;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.7),
      rgba(255, 255, 255, 0.2)
    ),
    var(--car-color, #9ca3af);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.55);
    overflow: hidden;
  }

  &__roof {
    position: absolute;
    inset: 18%;
    border-radius: 6px;
    background: linear-gradient(180deg, #1f2937, #111827);
    opacity: 0.9;
  }

  &__side {
    position: absolute;
    top: 20%;
    bottom: 20%;
    width: 5px;
    background: linear-gradient(180deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.4));

    &--left {
      left: 0;
    }

    &--right {
      right: 0;
    }
  }

  &__wheel {
    position: absolute;
    width: 18%;
    height: 14%;
    border-radius: 999px;
    background: #020617;
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.6);

    &--fl {
      left: 4%;
      top: 6%;
    }

    &--fr {
      right: 4%;
      top: 6%;
    }

    &--rl {
      left: 4%;
      bottom: 6%;
    }

    &--rr {
      right: 4%;
      bottom: 6%;
    }
  }

  &--player {
    z-index: 3;
  }
}
</style>
