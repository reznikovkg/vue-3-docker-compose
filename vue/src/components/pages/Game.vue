<template>
  <div class="game">
    <header class="game__header">
      <h1 class="game__title">Алхимик</h1>
      <span class="game__progress">Открыто: {{ openedCount }} / {{ totalCount }}</span>
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
  background: linear-gradient(135deg, #f4f1ea, #d9cab8);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 6px;
  }

  &__title {
    margin: 0;
    font-size: 22px;
    color: #5a4632;
  }

  &__progress {
    font-size: 15px;
    font-weight: bold;
    color: #7a6a52;
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
}
</style>
