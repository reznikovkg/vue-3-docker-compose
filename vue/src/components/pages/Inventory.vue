<template>
  <div class="inventory">
    <h3>🎒 Инвентарь ({{ inventory.length }})</h3>
    
    <div class="fish-list">
      <div v-for="fish in inventory" :key="fish.id" class="fish-item">
        <span class="fish-name">🐟 {{ fish.name }}</span>
        <span class="fish-weight">{{ fish.weight }} кг</span>
        <span class="fish-time">{{ fish.date }}</span>
      </div>
      
      <div v-if="inventory.length === 0" class="empty">
        🎣 Нет пойманной рыбы
      </div>
    </div>
    
    <button 
      v-if="inventory.length > 0" 
      @click="$emit('clearInventory')"
      class="clear-btn"
    >
      🗑️ Очистить инвентарь
    </button>
  </div>
</template>

<script setup>
defineProps(['inventory'])
defineEmits(['clearInventory'])
</script>

<style scoped>
.inventory {
  background: #1e2a1c;
  border-radius: 16px;
  padding: 16px;
}

.fish-list {
  max-height: 300px;
  overflow-y: auto;
  margin: 12px 0;
}

.fish-item {
  background: #2b3b26;
  margin: 8px 0;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.85rem;
}

.fish-name {
  font-weight: bold;
}

.fish-weight {
  color: #ffd966;
}

.fish-time {
  color: #999;
  font-size: 0.7rem;
  margin-left: auto;
}

.empty {
  text-align: center;
  color: #999;
  padding: 20px;
}

.clear-btn {
  width: 100%;
  background: #aa3c3c;
  color: white;
}
</style>