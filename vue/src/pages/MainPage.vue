<template>
  <PageWrapper>
    <nav class="menu">
      <ul class="menu__list">
        <li>
          <Link class="menu__link" :to="{ name: $routes.LEVELS }">Game</Link>
        </li>
        <li>
          <Link class="menu__link" :to="{ name: $routes.RULES }">Rules</Link>
        </li>
      </ul>
    </nav>
  </PageWrapper>
</template>

<script setup lang="ts">
import Link from '@/components/Link.vue';
import PageWrapper from '@/components/PageWrapper.vue';
</script>

<style scoped lang="scss">
.menu {
  margin: auto;
}

.menu__list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  list-style: none;
}

.menu__link {
  color: $text-color;
  font-weight: $fw-medium;
  font-size: 45px;
}
</style>
