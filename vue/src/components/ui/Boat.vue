<template>
  <div class="boat">
    <img class="boat__image" src="../../assets/images/Boat.png" width="150px">
  </div>
</template>

<script>
export default {
  name: "Boat"
}
</script>

<style scoped lang="scss">
.boat {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
