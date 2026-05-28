<template>
  <div class="menu">
    <h1 class="menu__title">Собери пару</h1>
    <RouterLink :to="{ name: $routes.GAME }">
      <button class="btn btn--green menu__btn">Играть</button>
    </RouterLink>
  </div>
</template>

<script setup>
</script>

<style scoped lang="scss">
.menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 120px;
  gap: 24px;

  &__title {
    color: #e0e0e0;
    font-size: 36px;
    letter-spacing: 2px;
  }

  &__btn {
    font-size: 18px;
    padding: 12px 36px;
  }
}
</style>
