<template>
  <div
    class="shooter-enemy"
    :class="{ 'shooter-enemy--shooting': isShooting }"
    :style="{
      left: x + 'px',
      top: y + 'px'
    }"
  >
    <div class="shooter-enemy__circle" :style="{ background: color }"></div>
    <div
      class="shooter-enemy__health-bar"
      :style="{
        width: (health / maxHealth) * 100 + '%'
      }"
    ></div>
    <div
      class="shooter-enemy__range"
      :style="{
        width: shootRange * 2 + 'px',
        height: shootRange * 2 + 'px',
        left: -shootRange + 12.5 + 'px',
        top: -shootRange + 12.5 + 'px'
      }"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'ShooterEnemy',
  props: {
    x: Number,
    y: Number,
    health: Number,
    maxHealth: Number,
    color: String,
    shootRange: {
      type: Number,
      default: 90
    },
    isShooting: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped lang="scss">
.shooter-enemy {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 3;

  &--shooting &__circle {
    transform: scale(1.2);
  }

  &__circle {
    width: 25px;
    height: 25px;
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
    border: 2px solid gold;
    transition: all 0.1s;
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  }

  &__health-bar {
    position: absolute;
    bottom: -5px;
    left: 0;
    height: 4px;
    background: #ff4444;
    border-radius: 2px;
    max-width: 25px;
  }

  &__range {
    position: absolute;
    border: 1px dashed rgba(255, 215, 0, 0.6);
    border-radius: 50%;
    background: rgba(255, 215, 0, 0.1);
    pointer-events: none;
    z-index: 2;
  }
}
</style>