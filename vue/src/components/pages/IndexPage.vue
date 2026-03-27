<template>
  <section class="index-page">
    <h1>Gone Fishing</h1>
    <RouterLink :to="{ name: $routes.FISHING }">To Fishing</RouterLink>
  </section>
</template>

<script>
const PAGE_TITLE = 'Gone Fishing'

export default {
  name: 'IndexPage',
  created() {
    document.title = PAGE_TITLE
  }
}
</script>

<style scoped lang="scss">
.index-page {
  align-content: center;
  display: grid;
  gap: 10px;
  justify-items: center;
  min-height: 100dvh;
  text-align: center;
}
</style>
