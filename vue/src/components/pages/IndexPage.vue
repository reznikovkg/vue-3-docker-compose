<template>
  Index

  <div>
    <RouterLink :to="{ name: $routes.EXAMPLE }">
     To Example
    </RouterLink>
  </div>
  <div>
    <RouterLink :to="{ name: $routes.PROM }">
      To PROM
    </RouterLink>
  </div>
  <div>
    <RouterLink :to="{ name: $routes.EDITOR }">
      To Figure Editor
    </RouterLink>
  </div>
</template>

<script lang="ts">
</script>

<style scoped lang="scss">
</style>
