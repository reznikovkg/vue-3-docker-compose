<template>
  <div class="floating-info-container">
    <div class="current-location">
      <div class="current-location__hint">Текущая локация:&nbsp;</div>
      <div class="current-location__label">{{ label }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";

import { getLocation } from "../utils";

const store = useStore();
const label = computed(() => {
  const currentLocationValue = store.getters["game/getCurrentLocationValue"];
  const { label: currentLocationLabel } = getLocation(currentLocationValue);

  return currentLocationLabel;
});
</script>

<style scoped lang="scss">
.floating-info-container {
  margin: 0.5rem;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 10;

  display: flex;
  flex-direction: column;

  padding: 0.5rem;
  border-radius: 0.25rem;
  background: rgb(45, 45, 45);
  border: 1px solid rgb(100, 100, 100);
}

.current-location {
  * {
    display: inline;
  }

  &__label {
    font-weight: bold;
  }
}
</style>
