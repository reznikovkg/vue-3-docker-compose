<template>
  <div class="inventory">
    <h3>🎒 Инвентарь ({{ inventory.length }})</h3>

    <div class="fish-list">
      <div v-for="fish in inventory" :key="fish.id" class="fish-item">
        <span class="fish-name">🐟 {{ fish.name }}</span>
        <span class="fish-weight">{{ fish.weight }} кг</span>
        <span class="fish-time">{{ fish.date }}</span>
        <button @click="$emit('removeFish', fish.id)" class="remove-fish">❌</button>
      </div>

      <div v-if="inventory.length === 0" class="empty">
        🎣 Нет пойманной рыбы
      </div>
    </div>

    <div class="inventory-buttons">
      <button v-if="inventory.length > 0" @click="$emit('clearInventory')" class="clear-btn">
        🗑️ Очистить все
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps(['inventory'])
defineEmits(['clearInventory', 'removeFish'])
</script>

<style scoped>
.inventory {
  background: #0a0248;
  border-radius: 16px;
  padding: 16px;
}

.fish-list {
  max-height: 300px;
  overflow-y: auto;
  margin: 12px 0;
}

.fish-item {
  background: #d24e07;
  margin: 8px 0;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.85rem;
  align-items: center;
  position: relative;
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

.remove-fish {
  background: rgba(0, 0, 0, 0.5);
  border: none;
  cursor: pointer;
  font-size: 14px;
  opacity: 0.7;
  padding: 4px 8px;
  border-radius: 6px;
  color: white;
  transition: all 0.2s;
}

.remove-fish:hover {
  opacity: 1;
  transform: scale(1.05);
  background: rgba(255, 0, 0, 0.7);
}

.empty {
  text-align: center;
  color: #999;
  padding: 20px;
}

.inventory-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.clear-btn {
  width: 100%;
  background: #aa3c3c;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #cc4c4c;
  transform: scale(1.02);
}

.inventory h3 {
  color: #ffd700;
  text-align: center;
  margin-top: 0;
}
</style>