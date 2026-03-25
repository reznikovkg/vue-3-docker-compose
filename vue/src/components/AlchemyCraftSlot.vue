<template>
  <div 
    class="craft-slot"
    :class="{ 'craft-slot--filled': element }"
    @click="() => handleSlotClick()"
  >
    <span v-if="element" class="craft-slot__icon">{{ element.icon }}</span>
    <span v-else class="craft-slot__placeholder">+</span>
  </div>
</template>

<script setup>
import { useStore } from 'vuex'

const props = defineProps(['slotIndex', 'element'])
const store = useStore()

const handleSlotClick = () => {
  store.dispatch('alchemy/handleCraftSlotClick', props.slotIndex)
}
</script>

<style scoped lang="scss">
.craft-slot {
  aspect-ratio: 1;
  background: #2d3748;
  border: 2px solid #4a5568;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 32px;
  
  &:hover {
    border-color: #fbbf24;
    background: #374151;
  }
  
  &--filled {
    background: #1e293b;
    border-color: #10b981;
  }
  
  &__icon {
    font-size: 32px;
  }
  
  &__placeholder {
    font-size: 32px;
    color: #94a3b8;
    font-weight: bold;
  }
}
</style>