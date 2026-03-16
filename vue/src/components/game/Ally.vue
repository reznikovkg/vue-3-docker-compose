<template>
  <div
    class="ally"
    :class="{ 'ally--attacking': isAttacking }"
    :style="{
      left: x + 'px',
      top: y + 'px'
    }"
  >
    <div class="ally__circle" :style="{ background: color }"></div>
    <div
      class="ally__health-bar"
      :style="{
        width: (health / maxHealth) * 100 + '%'
      }"
    ></div>
    <div
      class="ally__range"
      :style="{
        width: attackRange * 2 + 'px',
        height: attackRange * 2 + 'px',
        left: -attackRange + 12.5 + 'px',
        top: -attackRange + 12.5 + 'px'
      }"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'Ally',
  props: {
    x: Number,
    y: Number,
    health: Number,
    maxHealth: Number,
    color: {
      type: String,
      default: '#4a90e2'
    },
    attackRange: {
      type: Number,
      default: 80
    },
    isAttacking: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped lang="scss">
.ally {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 3;

  &--attacking &__circle {
    border-color: #ffaa00;
    transform: scale(1.2);
  }

  &__circle {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    border: 2px solid #fff;
    transition: all 0.1s;
    box-shadow: 0 0 10px rgba(74, 144, 226, 0.8);
  }

  &__health-bar {
    position: absolute;
    bottom: -5px;
    left: 0;
    height: 4px;
    background: #4a90e2;
    border-radius: 2px;
    max-width: 25px;
  }

  &__range {
    position: absolute;
    border: 1px dashed rgba(74, 144, 226, 0.4);
    border-radius: 50%;
    background: rgba(74, 144, 226, 0.05);
    pointer-events: none;
    z-index: 2;
  }
}
</style>