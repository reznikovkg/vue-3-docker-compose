<template>
  <div class="shop">
    <div class="shop__title">Shop</div>
  </div>
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
  background-color: rgba(111, 255, 255, 0.5);
  z-index: 2;

  &__title {
    font-size: 30px;
    font-weight: bold;
    color: black;
    text-align: center;
    text-shadow:
      -1px -1px 0 rgba(255, 255, 255, 0.5),
      1px -1px 0 rgba(255, 255, 255, 0.5),
      -1px 1px 0 rgba(255, 255, 255, 0.5),
      1px 1px 0 rgba(255, 255, 255, 0.5);
  }
}
</style>
