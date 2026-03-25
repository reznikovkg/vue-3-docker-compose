<template>
  <div class="workspace-item">
    <span class="workspace-item__icon">{{ item.icon }}</span>
    <span class="workspace-item__name">{{ item.name }}</span>
    <div class="workspace-item__controls">
      <button 
        class="workspace-item__button workspace-item__button--decrease"
        @click="() => decreaseQuantity()" 
        :disabled="item.quantity <= 0"
      >-</button>
      <span class="workspace-item__quantity">{{ item.quantity }}</span>
      <button 
        class="workspace-item__button workspace-item__button--increase"
        @click="() => increaseQuantity()"
        :disabled="item.quantity >= discoveredElement.quantity"
      >+</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const props = defineProps(['item'])

const store = useStore()

const increaseQuantity = () => store.dispatch('alchemy/increaseQuantity', { id: props.item.id })
const decreaseQuantity = () => store.dispatch('alchemy/decreaseQuantity', { id: props.item.id })
const discoveredElement = computed(() => store.getters['alchemy/getDiscoveredElement'](props.item.id))
</script>

<style scoped lang="scss">
.workspace-item {
  background: white;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #1e293b;
  width: 100%;

  &__icon {
    font-size: 22px;
    min-width: 30px;
    text-align: center;
  }

  &__name {
    font-size: 14px;
    font-weight: 500;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__button {
    width: 30px;
    height: 30px;
    border: none;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;

    &--decrease {
      background: #ef4444;
      color: white;
    }

    &--increase {
      background: #10b981;
      color: white;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__quantity {
    font-weight: bold;
    min-width: 25px;
    text-align: center;
    font-size: 16px;
    color: #1e293b;
  }
}
</style>