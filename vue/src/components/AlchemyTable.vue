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

<style scoped lang="scss">
.workspace {
  flex: 1;
  display: flex;
  gap: 8px;
  background: #1e293b;

  &__items {
    flex: 1;
    background: #2d3748;
    padding: 10px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
    border: 1px solid #4a5568;
  }

  &__empty {
    text-align: center;
    color: #94a3b8;
    padding: 20px;
    font-size: 14px;
    background: #1e293b;
    border: 1px dashed #4a5568;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 180px;
  }

  &__button {
    border: none;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    padding: 10px 4px;
    border: 1px solid #4a5568;

    &--mix {
      background: #fbbf24;
      color: #1e293b;
    }

    &--reset {
      background: #ef4444;
      color: white;
    }
  }
}
</style>