<template>
  <div class="quick-stats">
    <h2 class="quick-stats__title">📊 Статистика</h2>
    <div class="quick-stats__grid">
      <div class="stat-item">
        <div class="stat-item__label">Всего поймано</div>
        <div class="stat-item__value">{{ totalFishCaught }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-item__label">Уникальных видов</div>
        <div class="stat-item__value">{{ uniqueFishTypes }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-item__label">Бонус силы</div>
        <div class="stat-item__value">+{{ totalStrengthBonus }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-item__label">Наживка</div>
        <div class="stat-item__value" :class="{ 'stat-item__value--warning': !hasBait }">
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

  &__title {
    color: #333;
    margin-bottom: 15px;
    text-align: center;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }
}

.stat-item {
  text-align: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;

  &__label {
    font-size: 0.8em;
    color: #666;
    margin-bottom: 5px;
  }

  &__value {
    font-size: 1.2em;
    font-weight: bold;
    color: #2E7D32;

    &--warning {
      color: #f44336;
    }
  }
}

@media (max-width: 768px) {
  .quick-stats__grid {
    grid-template-columns: 1fr;
  }
}
</style>