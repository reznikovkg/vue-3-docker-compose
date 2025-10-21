<template>
  <div class="mode-switcher">
    <button
      class="mode-switcher__button"
      :class="{ 'mode-switcher__button--active': gameMode === 'add' }"
      @click="() => switchMode('add')"
    >
      Добавить
    </button>
    <button
      class="mode-switcher__button"
      :class="{ 'mode-switcher__button--active': gameMode === 'remove' }"
      @click="() => switchMode('remove')"
    >
      Удалить
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const gameMode = computed(() => store.getters.getGameMode)

const switchMode = (mode: 'add' | 'remove'): void => {
  store.dispatch('setGameMode', mode)
}
</script>

<style scoped lang="less">
.mode-switcher {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;

  &__button {
    flex: 1;
    padding: 12px 16px;
    border: 2px solid #b0c4de;
    border-radius: 8px;
    cursor: pointer;
    background: white;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover {
      background: #f5f5f5;
      border-color: #87ceeb;
    }

    &--active {
      background: #20b2aa;
      color: white;
      border-color: #20b2aa;
      font-weight: bold;
    }
  }
}
</style>