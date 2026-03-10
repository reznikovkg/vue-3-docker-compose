<template>
  <div class="game-page" :style="backgroundStyle">
    <Dropdown />
    <InfoContainer />
    <FishingComponent />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import { getLocation } from '../utils'
import Dropdown from '../ui/Dropdown.vue'
import InfoContainer from '../ui/info/InfoContainer.vue'
import FishingComponent from '../ui/fishing/FishingComponent.vue'

const store = useStore()
const currentLocationValue = computed(
  () => store.getters['game/getCurrentLocationValue'],
)

const backgroundStyle = computed(() => {
  const { icon } = getLocation(currentLocationValue.value)

  return {
    background: `url(${icon}) center / cover no-repeat`,
  }
})
</script>

<style scoped lang="scss">
.game-page {
  min-height: 100dvh;
}
</style>
