<template>
  <div
    class="enemy"
    :style="{
      left: x + 'px',
      top: y + 'px'
    }"
  >
    <div class="enemy__circle" :style="{ background: color }"></div>
    <div
      class="enemy__health-bar"
      :style="{
        width: (health / maxHealth) * 100 + '%'
      }"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'Enemy',
  props: {
    x: Number,
    y: Number,
    health: Number,
    maxHealth: Number,
    color: String
  }
}
</script>

<style scoped lang="scss">
.enemy {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 3;

  &__circle {
    width: 25px;
    height: 25px;
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
    border: 2px solid #333;
    transition: all 0.1s;
  }

  &__health-bar {
    position: absolute;
    bottom: -5px;
    left: 0;
    height: 4px;
    background: #4CAF50;
    border-radius: 2px;
    max-width: 25px;
  }
}
</style>