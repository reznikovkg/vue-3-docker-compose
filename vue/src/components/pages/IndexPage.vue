<template>
  <div class="menu">
    Vampire Survivors
    <RouterLink :to="{ name: $routes.GAME }" class="menu__play">
      Play Game
    </RouterLink>
  </div>
</template>

<script lang="ts">

</script>

<style scoped lang="scss">
.menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 46px;
  gap: 10px;
  position: absolute;
  width: 600px;
  height: 300px;
  top: 50%;
  left: 50%;
  color: white;
  background-color: rgb(43, 51, 168);
  border-radius: 2%;
  transform: translate(-50%, -50%);
  border: 2px solid gold;

  &__play {
    color: white;
    border: 2px solid gold;
    padding: 10px 10px;
  }
}
</style>
