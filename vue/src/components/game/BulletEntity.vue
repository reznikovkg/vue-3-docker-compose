<template>
  <div
    class="bullet"
    :style="{ left: x + 'px', top: y + 'px' }"
  ></div>
</template>

<script>
export default {
  name: "BulletEntity",
  props: {
    x: Number,
    y: Number
  }
}
</script>

<style lang="scss" scoped>
.bullet {
  position: absolute;
  width: 10px;
  height: 10px;
  background: yellow;
  transform: translate(-50%, -50%);
}
</style>