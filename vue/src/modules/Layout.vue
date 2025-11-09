<template>
  <div class="layout">
    <Header v-if="$route.name !== ROUTES.MAIN" />
    <main class="layout__main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/Header.vue';
import { ROUTES } from '@/router';
</script>

<style scoped lang="scss">
.layout {
  display: flex;
  flex-direction: column;
  block-size: 100vh;
}

.layout__main {
  flex-grow: 1;
  background: radial-gradient(
    ellipse at center,
    rgba(0, 30, 50, 0.6) 0%,
    rgba(0, 0, 20, 0.9) 60%,
    #000 100%
  );
}
</style>
