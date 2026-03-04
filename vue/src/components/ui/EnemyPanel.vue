<template>
  <div class="enemy-panel">
    <div class="enemy-panel__header">
      <h3>Противники ({{ enemies.length }})</h3>
      <CustomButton @click="() => addEnemy()" variant="small">
        + Добавить
      </CustomButton>
    </div>

    <p class="enemy-panel__tip">
      Клик на врага - выбор. Стрелки - движение.<br>
      Или перетаскивание мышью прямо на карте.
    </p>

    <div class="enemy-panel__list">
      <div
        v-for="enemy in enemies"
        :key="enemy.id"
        class="enemy-panel__item"
      >
        <span class="enemy-panel__item-label">
          #{{ enemy.id }}
          <span class="enemy-panel__item-pos">{{ Math.round(enemy.x) }}, {{ Math.round(enemy.y) }}</span>
        </span>
        <div class="enemy-panel__hp-bar">
          <div
            class="enemy-panel__hp-fill"
            :style="{ width: (enemy.hp / enemy.maxHp * 100) + '%' }"
          />
        </div>
        <CustomButton @click="() => removeEnemy(enemy.id)" variant="danger-small">
          X
        </CustomButton>
      </div>

      <p v-if="enemies.length === 0" class="enemy-panel__empty">
        Нет противников
      </p>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import CustomButton from '@/components/ui/CustomButton.vue'

export default {
  name: 'EnemyPanel',
  components: { CustomButton },

  setup () {
    const store = useStore()

    const enemies = computed(() => store.state.enemies)

    const addEnemy = () => store.dispatch('addEnemy')
    const removeEnemy = (id) => store.dispatch('removeEnemy', id)

    return { enemies, addEnemy, removeEnemy }
  },
}
</script>

<style lang="scss" scoped>
.enemy-panel {
  width: 260px;
  background: #16213e;
  border: 2px solid #0f3460;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    h3 {
      font-size: 1rem;
      color: #f0c040;
    }
  }

  &__tip {
    font-size: 0.78rem;
    color: #666;
    line-height: 1.5;
    border-left: 2px solid #0f3460;
    padding-left: 8px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 280px;
    overflow-y: auto;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #0f1e35;
    border-radius: 6px;
    padding: 6px 8px;
  }

  &__item-label {
    font-size: 0.82rem;
    color: #ccc;
    min-width: 80px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__item-pos {
    font-size: 0.72rem;
    color: #555;
  }

  &__hp-bar {
    flex: 1;
    height: 6px;
    background: #333;
    border-radius: 3px;
    overflow: hidden;
  }

  &__hp-fill {
    height: 100%;
    background: #44cc44;
    border-radius: 3px;
    transition: width 0.2s;
  }

  &__empty {
    color: #555;
    font-size: 0.85rem;
    text-align: center;
    padding: 10px 0;
  }
}
</style>
