<template>
  <div class="open-grid">
    <ElementCard
      v-for="element in elements"
      :key="element.id"
      :element="element"
      @click="$emit('pick', element.id)"
    />
  </div>
</template>

<script setup>
import ElementCard from './ElementCard.vue'

defineProps({
  elements: { type: Array, required: true },
})
defineEmits(['pick'])
</script>

<style scoped lang="scss">
.open-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  padding: 8px;
  overflow-y: auto;
  height: 100%;
  align-content: start;
}
</style>