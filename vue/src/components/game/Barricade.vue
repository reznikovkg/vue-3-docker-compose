<template>
  <div
    class="barricade"
    :style="{
      left: x + 'px',
      top: y + 'px'
    }"
  >
    <div class="barricade__health-bar-container">
      <div
        class="barricade__health-bar"
        :style="{
          width: (health / maxHealth) * 100 + '%'
        }"
      ></div>
    </div>
    <div class="barricade__body"></div>
  </div>
</template>

<script>
export default {
  name: 'Barricade',
  props: {
    x: Number,
    y: Number,
    health: Number,
    maxHealth: Number
  }
}
</script>

<style scoped lang="scss">
.barricade {
  position: absolute;
  width: 40px;
  height: 40px;
  transform: translate(-50%, -50%);
  z-index: 4;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
  }

  &__health-bar-container {
    position: absolute;
    top: -8px;
    left: 0;
    width: 100%;
    height: 4px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 2px;
    overflow: hidden;
  }

  &__health-bar {
    height: 100%;
    background: #ffaa00;
    transition: width 0.2s;
  }

  &__body {
    width: 100%;
    height: 100%;
    background: #8b5a2b;
    border: 3px solid #5d3a1a;
    border-radius: 8px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
}
</style>