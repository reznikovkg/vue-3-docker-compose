<template>
  Index

  <div>
    <RouterLink :to="{ name: $routes.EXAMPLE }">
     To Example
    </RouterLink>
    <div>
      <RouterLink :to="{ name: $routes.COUNTER }">
        To Counter
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>

</style>