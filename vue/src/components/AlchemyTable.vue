<template>
  <div class="workspace">
    <div class="workspace__items">
      <AlchemyTableItem
        v-for="item in tableItems"
        :key="item.id"
        :item="item"
        class="workspace__item"
      />
      <div v-if="!tableItems.length" class="workspace__empty">
        Выберите элемент
      </div>
    </div>

    <div class="workspace__actions">
      <button 
        class="workspace__button workspace__button--mix" 
        @click="() => mixElements()"
      >
        Смешать
      </button>
      <button 
        class="workspace__button workspace__button--reset" 
        @click="() => resetTable()"
      >
        Сброс
      </button>
    </div>
  </div>
</template>

<script setup>
import AlchemyTableItem from './AlchemyTableItem.vue'
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const tableItems = computed(() => store.getters['alchemy/tableItems'])

const resetTable = () => store.dispatch('alchemy/resetTable')
const mixElements = () => store.dispatch('alchemy/mixElements')
</script>

<style scoped>
.workspace {
  flex: 1;
  display: flex;
  gap: 8px;
  min-height: 0;
  background: #1e293b;
  width: 100;
}

.workspace__items {
  flex: 1;
  background: #2d3748;
  border-radius: 8px;
  padding: 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid #4a5568;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: #4a5568 #2d3748;
}

.workspace__empty {
  text-align: center;
  color: #94a3b8;
  padding: 20px;
  font-size: 14px;
  background: #1e293b;
  border-radius: 4px;
  border: 1px dashed #4a5568;
  width: 100%;
  flex-shrink: 0;
}

.workspace__actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 180px;
  flex-shrink: 0;
}

.workspace__button {
  flex: 1;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  padding: 10px 4px;
  border: 1px solid #4a5568;
  width: 100;
}

.workspace__button--mix {
  background: #fbbf24;
  color: #1e293b;
}

.workspace__button--reset {
  background: #ef4444;
  color: white;
}
</style>