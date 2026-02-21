<template>
  Index

  <div>
    <RouterLink :to="{ name: $routes.COUNTERANDBUTTON }">
     To CounterAndButton
    </RouterLink>
  </div>

  <div>
    <RouterLink :to="{ name: $routes.EXAMPLE }">
     To Example
    </RouterLink>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>

</style>
