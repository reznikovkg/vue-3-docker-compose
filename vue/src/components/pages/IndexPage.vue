<template>
  <div>
    Index

    <div>
      <RouterLink :to="{ name: $routes.EXAMPLE }">
        To Example
      </RouterLink>
      <RouterLink :to="{ name: $routes.TETRIS }">
        To Tetris
      </RouterLink>
      <RouterLink :to="{ name: $routes.EDITOR }">
        To Editor
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>

</style>
