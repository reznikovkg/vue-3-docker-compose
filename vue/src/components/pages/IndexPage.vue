<template>
  <h1 class="main-h1">
    Index

    <div>
        <RouterLink :to="{ name: $routes.EXAMPLE }">
        To Example
        </RouterLink>
    </div>
  </h1>
</template>

<script setup lang="ts">

</script>

<style scoped>
.main-h1 {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  min-width: 100vw; /* Исправьте на 100vw (viewport width) */
}

</style>
