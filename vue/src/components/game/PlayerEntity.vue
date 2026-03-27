<template>
  <div
    class="player"
    :style="{ left: x + 'px', top: y + 'px' }"
  ></div>
</template>

<script>
export default {
  name: "PlayerEntity",
  props: {
    x: Number,
    y: Number
  }
}
</script>

<style lang="scss" scoped>
.player {
  position: absolute;
  width: 40px;
  height: 40px;
  background: rgb(235, 209, 213);
  transform: translate(-50%, -50%);
}
</style>