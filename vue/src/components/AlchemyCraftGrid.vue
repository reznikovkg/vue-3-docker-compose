<template>
  <div class="craft-panel">
    <div class="craft-panel__title">
      <span>Крафт 3x3</span>
    </div>
    
    <div class="craft-grid">
      <AlchemyCraftSlot
        v-for="(element, index) in craftSlots"
        :key="index"
        :slot-index="index"
        :element="element"
      />
    </div>
    
    <div class="craft-panel__actions">
      <button 
        class="craft-panel__button craft-panel__button--craft"
        :disabled="!canCraft"
        @click="() => craftElement()"
      >
        Создать
      </button>
      <button 
        class="craft-panel__button craft-panel__button--clear"
        @click="() => clearCraftSlots()"
      >
        Очистить
      </button>
    </div>
    
    <div v-if="craftResult" class="craft-panel__result">
      <span>Результат:</span>
      <span>{{ craftResult.icon }}</span>
      <span>{{ craftResult.name }}</span>
    </div>
  </div>
</template>

<script setup>
import AlchemyCraftSlot from './AlchemyCraftSlot.vue'
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const craftSlots = computed(() => store.getters['alchemy/craftSlots'])
const craftResult = computed(() => store.getters['alchemy/craftResult'])
const canCraft = computed(() => store.getters['alchemy/canCraft'])

const craftElement = () => {
  store.dispatch('alchemy/startCraft3x3')
}

const clearCraftSlots = () => {
  store.dispatch('alchemy/clearCraftSlots')
}
</script>

<style scoped lang="scss">
.craft-panel {
  background: #1e293b;
  border: 1px solid #4a5568;
  padding: 16px;
  margin-bottom: 10px;
  
  &__title {
    color: #fbbf24;
    margin-bottom: 10px;
  }
  
  &__actions {
    display: flex;
    gap: 8px;
    margin: 10px 0;
  }
  
  &__button {
    flex: 1;
    padding: 8px;
    border: 1px solid #4a5568;
    font-weight: bold;
    cursor: pointer;
    
    &--craft {
      background: #10b981;
      color: white;
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
    
    &--clear {
      background: #ef4444;
      color: white;
    }
  }
  
  &__result {
    background: #2d3748;
    border: 1px solid #4a5568;
    padding: 8px;
    display: flex;
    gap: 8px;
  }
}

.craft-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  background: #2d3748;
  padding: 8px;
  border: 1px solid #4a5568;
}
</style>