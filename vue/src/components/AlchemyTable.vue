<template>
  <div class="workspace">

    <div class="workspace__craft-header">
      <button 
        class="workspace__craft-button"
        :class="{ 'workspace__craft-button--active': craftMode }"
        @click="() => toggleCraftMode()"
      >
        <span class="workspace__craft-icon">{{ craftMode ? '🟡' : '⚫' }}</span>
        {{ craftMode ? 'Выйти из крафта' : 'Режим крафта' }}
      </button>
      
      <div v-if="elementForCraft" class="workspace__craft-selected">
        Выбран: {{ elementForCraft.icon }} {{ elementForCraft.name }}
      </div>
    </div>

    <AlchemyCraftGrid />

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
import AlchemyCraftGrid from './AlchemyCraftGrid.vue'
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const tableItems = computed(() => store.getters['alchemy/tableItems'])

const resetTable = () => store.dispatch('alchemy/resetTable')
const mixElements = () => store.dispatch('alchemy/mixElements')
const toggleCraftMode = () => store.dispatch('alchemy/toggleCraftMode')
</script>

<style scoped lang="scss">
.workspace {
  flex: 1;
  display: flex;
  gap: 8px;
  background: #1e293b;

  &__craft-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #2d3748;
    padding: 8px 12px;
    border: 1px solid #4a5568;
  }

  &__craft-button {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #2d3748;
    color: white;
    border: 1px solid #4a5568;
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #374151;
      border-color: #94a3b8;
    }

    &--active {
      background: #fbbf24;
      color: #1e293b;
      border-color: #fbbf24;

      &:hover {
        background: #f59e0b;
      }
    }
  }

  &__craft-icon {
    font-size: 14px;
  }

  &__craft-selected {
    font-size: 13px;
    color: #fbbf24;
    background: #1e293b;
    padding: 4px 8px;
    border: 1px solid #4a5568;
  }

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