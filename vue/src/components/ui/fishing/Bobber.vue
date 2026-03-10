<template>
  <img :style="positionStyle" class="bobber" src="/bobber.webp" />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps(['position'])

const positionStyle = computed(() => ({
  left: `${props.position.x}px`,
  top: `${props.position.y}px`,
}))
</script>

<style scoped lang="scss">
.bobber {
  position: absolute;
  transform: translate(-50%, -50%);
}
</style>
