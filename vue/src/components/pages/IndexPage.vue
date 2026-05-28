<template>
  <div class="menu">
    <h1>МИНУС Сити</h1>
    <RouterLink :to="{name: $routes.GAME}">
      <button class="menu--btn">Играть</button>
    </RouterLink>
  </div>
</template>
<script>
export default {
  name: "IndexPage"
}
</script>
<style scoped lang="scss">
.menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 120px;
  gap: 20px;

  &--btn {
    padding: 10px 20px;
    font-size: 16px;
    border: none;
    border-radius: 8px;
    background: #3b82f6;
    color: #fff;
    cursor: pointer;

    &:hover {
      background: #2563eb;
    }
  }
}
</style>