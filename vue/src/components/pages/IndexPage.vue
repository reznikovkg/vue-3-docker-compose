<template>
  <section class="index-page">
    <h1>Gpuslave's Fishing Game</h1>
    <RouterLink :to="{ name: $routes.FISHING }">Go Fishing</RouterLink>
  </section>
</template>

<script>
export default {
  name: 'IndexPage',
};
</script>

<style scoped lang="scss">
.index-page {
  min-height: 100dvh;
  width: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
</style>
