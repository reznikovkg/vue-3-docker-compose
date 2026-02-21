<template>
  Index

  <div>
    <RouterLink :to="{ name: $routes.EXAMPLE }">
     To Example
    </RouterLink>
  </div>
  <div>
    <RouterLink :to="{ name: $routes.COUNTER }">
     To Counter
    </RouterLink>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>

</style>
