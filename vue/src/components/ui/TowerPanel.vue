<template>
  <div class="tower-panel">
    <div v-if="!selectedSlotId" class="tower-panel__hint">
      <span>Клик на слот (квадрат) на карте</span>
    </div>

    <div v-else-if="!selectedTower" class="tower-panel__build">
      <h3>Пустой слот</h3>
      <p class="tower-panel__slot-id">Слот: {{ selectedSlotId }}</p>

      <div class="tower-panel__stats-preview">
        <p>Характеристики начальной башни:</p>
        <ul>
          <li>Урон: {{ baseTower.damage }}</li>
          <li>HP: {{ baseTower.hp }}</li>
          <li>Скорость стрельбы: {{ (1000 / baseTower.fireRate).toFixed(1) }}/сек</li>
          <li>Радиус: {{ baseTower.range }}px</li>
        </ul>
      </div>

      <CustomButton
        :disabled="gold < baseTower.cost"
        @click="() => buildTower(selectedSlotId)"
      >
        Построить ({{ baseTower.cost }} GOLD)
      </CustomButton>
    </div>

    <div v-else class="tower-panel__info">
      <h3>{{ towerIcon(selectedTower.level) }} Башня  -  Уровень {{ selectedTower.level }}</h3>
      <p class="tower-panel__slot-id">Слот: {{ selectedSlotId }}</p>

      <div class="tower-panel__stats">
        <div class="tower-panel__stat">
          <span class="tower-panel__stat-label">Урон</span>
          <span class="tower-panel__stat-value">{{ selectedTower.damage }}</span>
          <span v-if="nextTower" class="tower-panel__stat-next">-> {{ nextTower.damage }}</span>
        </div>
        <div class="tower-panel__stat">
          <span class="tower-panel__stat-label">HP</span>
          <span class="tower-panel__stat-value">{{ selectedTower.hp }}</span>
          <span v-if="nextTower" class="tower-panel__stat-next">-> {{ nextTower.hp }}</span>
        </div>
        <div class="tower-panel__stat">
          <span class="tower-panel__stat-label">Скорость</span>
          <span class="tower-panel__stat-value">{{ (1000 / selectedTower.fireRate).toFixed(1) }}/с</span>
          <span v-if="nextTower" class="tower-panel__stat-next">-> {{ (1000 / nextTower.fireRate).toFixed(1) }}/с</span>
        </div>
        <div class="tower-panel__stat">
          <span class="tower-panel__stat-label">Радиус</span>
          <span class="tower-panel__stat-value">{{ selectedTower.range }}px</span>
          <span v-if="nextTower" class="tower-panel__stat-next">-> {{ nextTower.range }}px</span>
        </div>
      </div>

      <div class="tower-panel__actions">
        <CustomButton
          v-if="nextTower"
          :disabled="gold < nextTower.upgradeCost"
          @click="() => upgradeTower(selectedSlotId)"
          variant="upgrade"
        >
          Прокачать ({{ nextTower.upgradeCost }} GOLD)
        </CustomButton>
        <span v-else class="tower-panel__maxlevel">Максимальный уровень</span>

        <CustomButton
          @click="() => removeTower(selectedSlotId)"
          variant="danger"
        >
          Снести (+{{ Math.floor(baseCost / 2) }} GOLD)
        </CustomButton>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import CustomButton from '@/components/ui/CustomButton.vue'

export default {
  name: 'TowerPanel',
  components: { CustomButton },

  setup () {
    const store = useStore()

    const gold = computed(() => store.state.gold)
    const selectedSlotId = computed(() => store.getters.selectedSlotId)
    const selectedTower = computed(() => store.getters.selectedTower)
    const allLevels = computed(() => store.getters.towerLevelsConfig)
    const baseTower = computed(() => allLevels.value[0])
    const baseCost = computed(() => allLevels.value[0].cost)

    const nextTower = computed(() => {
      if (!selectedTower.value) return null
      return allLevels.value[selectedTower.value.level] ?? null
    })

    const towerIcon = (lvl) => {
      const icons = ['1', '2', '3', '4', '5']
      return icons[(lvl - 1)] ?? '^'
    }

    const buildTower = (slotId) => store.dispatch('buildTower', slotId)
    const upgradeTower = (slotId) => store.dispatch('upgradeTower', slotId)
    const removeTower = (slotId) => store.dispatch('removeTower', slotId)

    return {
      gold,
      selectedSlotId,
      selectedTower,
      baseTower,
      baseCost,
      nextTower,
      towerIcon,
      buildTower,
      upgradeTower,
      removeTower,
    }
  },
}
</script>

<style lang="scss" scoped>
.tower-panel {
  width: 260px;
  min-height: 300px;
  background: #16213e;
  border: 2px solid #0f3460;
  border-radius: 10px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  h3 {
    font-size: 1.1rem;
    color: #f0c040;
    margin-bottom: 4px;
  }

  &__hint {
    color: #888;
    font-size: 0.95rem;
    margin-top: 20px;
    text-align: center;
    line-height: 1.6;
  }

  &__slot-id {
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 4px;
  }

  &__stats-preview {
    font-size: 0.9rem;
    color: #ccc;
    background: #0f1e35;
    border-radius: 8px;
    padding: 10px 12px;

    p { margin-bottom: 6px; color: #aaa; }

    ul {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
  }

  &__stats {
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: #0f1e35;
    border-radius: 8px;
    padding: 10px 12px;
  }

  &__stat {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.88rem;
  }

  &__stat-label {
    color: #aaa;
    width: 90px;
  }

  &__stat-value {
    color: #eee;
    font-weight: 600;
    min-width: 50px;
  }

  &__stat-next {
    color: #66ee88;
    font-size: 0.82rem;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__maxlevel {
    color: #66ee88;
    font-size: 0.9rem;
    text-align: center;
  }
}
</style>
