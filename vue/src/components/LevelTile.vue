<template>
  <RouterLink
    v-if="isAvailable"
    :to="{ name: $routes.GAME, params: { id: levelId } }"
    class="level-tile"
  >
    {{ levelId }}
  </RouterLink>

  <div v-else class="level-tile level-tile_locked">
    {{ levelId }}
  </div>
</template>

<script setup lang="ts">
export interface LevelTileProps {
  levelId: number;
  isAvailable: boolean;
}

defineProps<LevelTileProps>();
</script>

<style scoped lang="scss">
.level-tile {
  display: flex;
  align-items: center;
  justify-content: center;
  block-size: 100px;
  border-radius: 8px;
  font-weight: $fw-bold;
  font-size: 18px;
  color: white;
  box-shadow: none;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  border: 2px solid rgba(8, 214, 138, 0.3);
  text-decoration: none;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 6px 2px rgba(8, 214, 138, 0.8);
  }

  &:active {
    transform: scale(0.98);
  }
}

.level-tile_locked {
  background: rgba(17, 17, 17, 0.3);
  border: 2px solid #757575;
  opacity: 0.6;
  pointer-events: none;
}
</style>
