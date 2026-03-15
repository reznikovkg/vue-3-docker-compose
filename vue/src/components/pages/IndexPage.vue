<template>
  Index

  <div>
    <RouterLink :to="{ name: $routes.EXAMPLE }">
      To Example
    </RouterLink>
  </div>
  <div>
    <ExampleButton label="Example Button"></ExampleButton>
  </div>
</template>

<script setup lang="ts">

import ExampleButton from "@/components/ui/ExampleButton.vue";
</script>

<style scoped>

</style>
