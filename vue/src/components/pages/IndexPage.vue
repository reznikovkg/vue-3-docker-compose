<template>
  <section class="index-page">
    <h1>Fishing Game</h1>
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
  padding: 16px;
}
</style>
