<template>
  <div
    class="enemy"
    :class="{ 'enemy--shooter': type === 'shooter' }"
    :style="{ left: x + 'px', top: y + 'px' }"
  ></div>
</template>

<script>
export default {
  name: "EnemyEntity",
  props: {
    x: Number,
    y: Number,
    type: String
  }
}
</script>

<style lang="scss" scoped>
.enemy {
  position: absolute;
  width: 30px;
  height: 30px;
  background: red;
  transform: translate(-50%, -50%);

  &--shooter {
    background: purple;
  }
}
</style>