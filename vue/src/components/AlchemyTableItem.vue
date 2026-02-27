<template>
  <div class="workspace-item">
    <span class="workspace-item__icon">{{ item.icon }}</span>
    <span class="workspace-item__name">{{ item.name }}</span>
    <div class="workspace-item__controls">
      <button 
        class="workspace-item__button workspace-item__button--decrease"
        @click="() => decreaseQuantity()" 
        :disabled="item.quantity <= 1"
      >-</button>
      <span class="workspace-item__quantity">{{ item.quantity }}</span>
      <button 
        class="workspace-item__button workspace-item__button--increase"
        @click="() => increaseQuantity()"
      >+</button>
    </div>
  </div>
</template>

<script setup>
import { useStore } from 'vuex'

const props = defineProps(['item'])

const store = useStore()

const increaseQuantity = () => store.dispatch('alchemy/increaseQuantity', { id: props.item.id })
const decreaseQuantity = () => store.dispatch('alchemy/decreaseQuantity', { id: props.item.id })
</script>

<style scoped>
.workspace-item {
  background: white;
  border-radius: 6px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #1e293b;
  width: 100%;
  flex-shrink: 0;
}

.workspace-item__icon {
  font-size: 22px;
  min-width: 30px;
  text-align: center;
}

.workspace-item__name {
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.workspace-item__controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.workspace-item__button {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  flex-shrink: 0;
}

.workspace-item__button--decrease {
  background: #ef4444;
  color: white;
}

.workspace-item__button--increase {
  background: #10b981;
  color: white;
}

.workspace-item__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.workspace-item__quantity {
  font-weight: bold;
  min-width: 25px;
  text-align: center;
  font-size: 16px;
  color: #1e293b;
}
</style>