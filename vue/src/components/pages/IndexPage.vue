<template>
  Index

  <div>
    <RouterLink :to="{ name: $routes.EXAMPLE }">
     To Example
    </RouterLink>
  </div>
  <div>
    <RouterLink :to="{ name: ROUTES.GAME }">
      To GAME
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { ROUTES } from "@/router"
</script>

<style scoped>

</style>
