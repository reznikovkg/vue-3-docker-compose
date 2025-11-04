<template>
  <header class="menu">
    <Link
      v-for="item in items.filter((item) => $route.name !== item.to.name)"
      :key="item.label"
      class="menu__link"
      :to="item.to"
    >
      {{ item.label }}
    </Link>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import Link from '@/components/Link.vue';
import { ROUTES } from '@/router';

const items = ref([
  { label: 'Main', to: { name: ROUTES.MAIN } },
  { label: 'Rules', to: { name: ROUTES.RULES } },
  { label: 'Levels', to: { name: ROUTES.LEVELS } },
]);
</script>

<style scoped lang="scss">
.menu {
  display: flex;
  gap: 15px;
  background-color: rgba(0, 0, 20, 0.9);
  padding: 20px;
  color: white;
}

.menu__link {
  color: white;
  font-size: 20px;
}
</style>
