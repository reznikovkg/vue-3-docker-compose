<template>
  <div class="game">
    <header class="game__header">
      <div class="game__brand">
        <h1 class="game__title">Алхимик</h1>
        <span class="game__subtitle">лаборатория превращений</span>
      </div>
      <div class="game__progress">
        <span class="game__progress-text">Открыто {{ openedCount }} из {{ totalCount }}</span>
        <div class="game__bar">
          <div class="game__bar-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>
    </header>

    <FieldScreen />

    <div class="game__bottom">
      <TableScreen />
      <CraftGrid />
    </div>

    <Notification />
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useStore } from "vuex"
import FieldScreen from "../screens/FieldScreen.vue"
import TableScreen from "../screens/TableScreen.vue"
import CraftGrid from "../screens/CraftGrid.vue"
import Notification from "../Notification.vue"

const store = useStore()
const openedCount = computed(() => store.getters.openedCount)
const totalCount = computed(() => store.getters.totalCount)
const progressPercent = computed(() =>
  totalCount.value ? Math.round((openedCount.value / totalCount.value) * 100) : 0
)
</script>

<style scoped lang="less">
.game {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  background: linear-gradient(135deg, #eef2e6, #c8d3b6); // травяная палитра

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 6px;
    gap: 12px;
  }

  &__brand {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }

  &__title {
    margin: 0;
    font-size: 22px;
    color: #38422c;                 // тёмно-зелёный
    letter-spacing: 0.5px;
  }

  &__subtitle {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #7b8768;
  }

  &__progress {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    min-width: 140px;
  }

  &__progress-text {
    font-size: 14px;
    font-weight: bold;
    color: #4f5c3d;
  }

  &__bar {
    width: 140px;
    height: 8px;
    border-radius: 4px;
    background: rgba(79, 92, 61, 0.15);
    overflow: hidden;
  }

  &__bar-fill {
    height: 100%;
    border-radius: 4px;
    background: linear-gradient(90deg, #7fa05a, #4f5c3d);
    transition: width 0.35s ease;
  }

  &__bottom {
    flex: 5;
    min-height: 0;
    display: flex;
    gap: 10px;
  }
}

@media (max-width: 600px) {
  .game__bottom {
    flex-direction: column;
  }

  .game__progress,
  .game__bar {
    min-width: 100px;
    width: 100px;
  }
}
</style>