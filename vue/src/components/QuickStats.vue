<template>
  <div class="quick-stats">
    <h2>📊 Статистика</h2>
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-label">Всего поймано</div>
        <div class="stat-value">{{ totalFishCaught }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Уникальных видов</div>
        <div class="stat-value">{{ uniqueFishTypes }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Бонус силы</div>
        <div class="stat-value">+{{ totalStrengthBonus }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Наживка</div>
        <div class="stat-value" :class="{ warning: !hasBait }">
          {{ hasBait ? 'Есть' : 'Нет' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const totalFishCaught = computed(() => store.getters['fishing/totalFishCaught'])
const totalStrengthBonus = computed(() => store.getters['fishing/totalStrengthBonus'])
const hasBait = computed(() => store.getters['fishing/hasBait'])
const caughtFish = computed(() => store.getters['fishing/caughtFish'])

const uniqueFishTypes = computed(() => {
  const types = new Set(caughtFish.value.map((fish: any) => fish.name))
  return types.size
})
</script>

<style scoped lang="less">
.quick-stats {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #ddd;
  height: fit-content;

  h2 {
    color: #333;
    margin-bottom: 15px;
    text-align: center;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.stat-item {
  text-align: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;

  .stat-label {
    font-size: 0.8em;
    color: #666;
    margin-bottom: 5px;
  }

  .stat-value {
    font-size: 1.2em;
    font-weight: bold;
    color: #2E7D32;

    &.warning {
      color: #f44336;
    }
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>