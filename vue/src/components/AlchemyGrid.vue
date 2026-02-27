<template>
  <div class="grid">
    <AlchemyGridItem
      v-for="el in discoveredElements"
      :key="el.id"
      :element="el"
      class="grid__item"
    />
  </div>
</template>

<script setup>
import AlchemyGridItem from './AlchemyGridItem.vue'
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const discoveredElements = computed(() => store.getters['alchemy/discoveredElements'])
</script>

<style scoped>
.grid {
  flex: 3;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  overflow-y: auto;
  background: #2d3748;
  border-radius: 8px;
  padding: 10px;
  border: 1px solid #4a5568;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: #4a5568 #2d3748;
}
</style>