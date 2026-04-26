<template>
  <div class="shop"/>
</template>

<script>
export default {
  name: 'Shop'
}
</script>

<style scoped lang="scss">
.shop {
  position: absolute;
  overflow: hidden;
  width: 900px;
  height: 725px;
  top: 50%;
  left: 50%;
  border: 4px solid black;
  border-radius: 20px;
  box-shadow:
    4px 4px rgba(0, 0, 0, 0.4),
    6px 6px rgba(0, 0, 0, 0.2);
  transform: translate(-50%, -50%);
  background-color: rgba(245, 222, 179, 0.75);
  z-index: 2;
}
</style>
