<template>
  <div class="level-grid">
    <LevelTile
      v-for="level in LEVELS"
      :key="level.id"
      :level-id="level.id"
      :is-available="level.isAvailable"
    />
  </div>
</template>

<script setup lang="ts">
import LevelTile from '@/components/LevelTile.vue';
import { LEVELS } from '@/shared/constants';
</script>

<style scoped lang="scss">
.level-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
  padding: 20px;
  margin: auto;
  width: 100%;
  max-width: 700px;
}
</style>
