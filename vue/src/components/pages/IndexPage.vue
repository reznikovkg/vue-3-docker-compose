<template>
  <section class="index-page">
    <h1>Gone Fishing</h1>
    <RouterLink :to="{ name: $routes.FISHING }">To Fishing</RouterLink>
  </section>
</template>

<script>
const PAGE_TITLE = 'Gone Fishing';

export default {
  name: 'IndexPage',
  created() {
    document.title = PAGE_TITLE;
  },
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
