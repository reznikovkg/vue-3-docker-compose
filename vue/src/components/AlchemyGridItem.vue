<template>
  <div 
    class="grid-item"
    :class="{ 
      'grid-item--selected': isSelected,
      'grid-item--craft-mode': craftMode 
    }"
    @click="() => selectElement()"
  >
    <span class="grid-item__icon">{{ element.icon }}</span>
    <span class="grid-item__name">{{ element.name }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const props = defineProps(['element'])

const store = useStore()
const isSelected = computed(() => store.getters['alchemy/isSelected'](props.element))

const selectElement = () => store.dispatch('alchemy/selectElement', props.element)
</script>

<style scoped lang="scss">
.grid-item {
  background: white;
  padding: 10px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid transparent;
  color: #1e293b;
  aspect-ratio: 1;

  &--selected {
    border-color: #fbbf24;
    background: #fef9c3;
  }

  &--craft-mode {
    cursor: crosshair;
    position: relative;
  }
  
  &__icon {
    font-size: 28px;
    margin-bottom: 4px;
  }

  &__name {
    font-size: 11px;
    font-weight: bold;
    text-align: center;
  }
}
</style>