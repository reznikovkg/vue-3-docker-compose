<template>
  <div class="inventory">
    <div class="inventory__header">
      <h3>Инвентарь</h3>
      <button 
        v-if="inventory.length > 0" 
        @click="clearInventory" 
        class="inventory__clear-button"
        title="Очистить инвентарь"
      >
        🗑️ Очистить
      </button>
    </div>
    <div class="inventory__grid">
      <div v-for="(item, index) in inventory" :key="index" class="inventory__item">
        {{ item }}
      </div>
      <div v-if="inventory.length === 0" class="inventory__empty">
        Инвентарь пуст<br>
        🎣 Начните ловить рыбу!
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const inventory = computed(() => store.getters['game/getInventory'])

const clearInventory = () => {
  if (confirm('Вы уверены, что хотите очистить весь инвентарь?')) {
    store.dispatch('game/runClearInventory')
  }
}
</script>

<style scoped>
.inventory {
  width: 100%;
  height: 100%;
  border: 2px solid #333;
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.inventory__header {
  background-color: #333;
  color: white;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #555;
}

.inventory__header h3 {
  margin: 0;
  font-size: 18px;
}

.inventory__clear-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.inventory__clear-button:hover {
  background-color: #d32f2f;
  transform: scale(1.05);
}

.inventory__clear-button:active {
  transform: scale(0.95);
}

.inventory__grid {
  flex: 1;
  padding: 15px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 10px;
  overflow-y: auto;
  align-content: start;
}

.inventory__item {
  aspect-ratio: 1;
  border: 2px solid #4CAF50;
  background: linear-gradient(135deg, #ffffff 0%, #e8f5e9 100%);
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 11px;
  font-weight: bold;
  text-align: center;
  padding: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  word-wrap: break-word;
  color: #2E7D32;
}

.inventory__item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-color: #2E7D32;
}

.inventory__empty {
  grid-column: 1 / -1;
  text-align: center;
  color: #999;
  font-size: 16px;
  padding: 40px 20px;
  font-style: italic;
}
</style>
