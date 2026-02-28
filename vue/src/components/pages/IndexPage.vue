<template>
  <div class="game-page" :style="backgroundStyle">
    <Dropdown /><FloatingInfoContainer /><FishingContainer />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";

import { getLocation } from "../utils";
import Dropdown from "../ui/Dropdown.vue";
import FloatingInfoContainer from "../ui/FloatingInfoContainer.vue";
import FishingContainer from "../ui/FishingContainer.vue";

const store = useStore();
const backgroundStyle = computed(() => {
  const currentLocationValue = store.getters["game/getCurrentLocationValue"];
  const { icon: backgroundImageUrl } = getLocation(currentLocationValue);

  return {
    background: `url(${backgroundImageUrl}) center / cover no-repeat`,
  };
});
</script>

<style scoped lang="scss">
.game-page {
  margin: 0;
  min-height: 100dvh;
}
</style>
