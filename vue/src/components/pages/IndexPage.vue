<template>
  <div class="indexPage">Index</div>
  <div class="indexPage__links">
    <RouterLink :to="{ name: $routes.TOWER_DEFENSE }">
      To Tower Defense
    </RouterLink>

    <RouterLink :to="{ name: $routes.EXAMPLE }">
      To Example
    </RouterLink>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.indexPage {
  margin-bottom: 12px;
}

.indexPage__links {
  display: flex;
  gap: 12px;
}

</style>
