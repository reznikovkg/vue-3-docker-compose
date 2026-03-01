<template>
  <div class="info-container">
    <InfoItem label="Локация:" :text="currentLocationText" />
    <InfoItem label="Удочка:" text="Базовая" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import { getLocation } from '../../utils'
import InfoItem from './InfoItem.vue'

const store = useStore()
const currentLocationText = computed(() => {
  const currentLocationValue = store.getters['game/getCurrentLocationValue']
  const { label } = getLocation(currentLocationValue)

  return label
})
</script>

<style scoped lang="scss">
.info-container {
  margin: 0.5rem;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 10;

  display: flex;
  flex-direction: column;

  border-radius: 0.25rem;
  background: rgb(45, 45, 45);
  border: 1px solid rgb(100, 100, 100);
}
</style>
