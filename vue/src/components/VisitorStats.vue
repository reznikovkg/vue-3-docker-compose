<template>
  <div class="visitor-stats" v-if="selectedVisitor">
    <h3>Статистика посетителя</h3>
    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-label">Статус:</span>
        <span class="stat-value">{{ getVisitorStatusText(selectedVisitor.status) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Настроение:</span>
        <div class="stat-value">
          <div class="mood-indicator" :style="{ backgroundColor: moodColor }"></div>
          <span>{{ Math.round(selectedVisitor.mood * 10)/10 }}</span>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-label">Усталость:</span>
        <div class="stat-bar">
          <div class="stat-bar-fill" :style="{ width: `${selectedVisitor.stats.fatigue * 10}%` }"></div>
          <span>{{ selectedVisitor.stats.fatigue }}/10</span>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-label">Голод:</span>
        <div class="stat-bar">
          <div class="stat-bar-fill" :style="{ width: `${selectedVisitor.stats.hunger * 10}%` }"></div>
          <span>{{ selectedVisitor.stats.hunger }}/10</span>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-label">Скука:</span>
        <div class="stat-bar">
          <div class="stat-bar-fill" :style="{ width: `${selectedVisitor.stats.boredom * 10}%` }"></div>
          <span>{{ selectedVisitor.stats.boredom }}/10</span>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-label">Нужда:</span>
        <div class="stat-bar">
          <div class="stat-bar-fill" :style="{ width: `${selectedVisitor.stats.need * 10}%` }"></div>
          <span>{{ selectedVisitor.stats.need }}/10</span>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-label">Баланс:</span>
        <span class="stat-value">{{ selectedVisitor.balance }} ₽</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Цель:</span>
        <span class="stat-value">{{ targetBuilding?.name || 'Нет цели' }}</span>
      </div>
      <div class="stat-item" v-if="selectedVisitor.status === 'inQueue'">
        <span class="stat-label">Очередь:</span>
        <span class="stat-value">
          Позиция {{ selectedVisitor.queuePosition || 1 }} 
          (ждет {{ selectedVisitor.queueWaitTime || 0 }} сек.)
        </span>
      </div>
      <div class="stat-item" v-if="selectedVisitor.status === 'inBuilding'">
        <span class="stat-label">В здании:</span>
        <span class="stat-value">{{ selectedVisitor.visitorTimer || 0 }} сек. осталось</span>
      </div>
      <div class="stat-item" v-if="selectedVisitor.visitedBuildings.length > 0">
        <span class="stat-label">Посетил:</span>
        <span class="stat-value">{{ selectedVisitor.visitedBuildings.length }} зданий</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const props = defineProps({
  visitorId: String
});

const store = useStore();

const selectedVisitor = computed(() => {
  return store.getters.getVisitorById(props.visitorId);
});

const moodColor = computed(() => {
  if (!selectedVisitor.value) 
  {
    return '#0000FF';
  }
  const mood = selectedVisitor.value.mood || 5;
  if (mood >= 8) 
  {
    return '#00FF00';
  }
  if (mood >= 6) 
  {
    return '#9ACD32';
  }
  if (mood >= 4) 
  {
    return '#FFFF00';
  }
  if (mood >= 2) 
  {
    return '#FFA500';
  }
  return '#FF0000';
});

const targetBuilding = computed(() => {
  if (!selectedVisitor.value)
  {
    return null;
  }
  return store.getters.getBuildings.find(b => b.id === selectedVisitor.value.targetBuildingId);
});

const getVisitorStatusText = (status) => {
  const statusMap = {
    'spawning': 'Появление',
    'walking': 'Идет',
    'inBuilding': 'В здании',
    'inQueue': 'В очереди',
    'exit': 'Уходит',
    'left': 'Ушел'
  };
  return statusMap[status] || status;
};
</script>

<style scoped lang="less">
.visitor-stats {
  background: #f5f5f5;
  border-radius: 10px;
  padding: 15px;
  margin-top: 20px;
  max-width: 300px;
  
  h3 {
    margin-bottom: 15px;
    color: #333;
  }
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-weight: bold;
  color: #555;
}

.stat-value {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mood-indicator {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 1px solid #333;
}

.stat-bar {
  width: 150px;
  height: 20px;
  background: #ddd;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  background: #4CAF50;
  transition: width 0.3s;
}

.stat-bar span {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  color: #333;
  font-weight: bold;
}
</style>