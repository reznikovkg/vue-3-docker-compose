<template>
  <div class="mode-switcher">
    <button
      @click="switchMode('add')"
      :class="{ active: gameMode === 'add' }"
    >
      Добавить
    </button>
    <button
      @click="switchMode('remove')"
      :class="{ active: gameMode === 'remove' }"
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

<style scoped>
.mode-switcher {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

button {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #B0C4DE;
  border-radius: 8px;
  cursor: pointer;
  background: white;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

button:hover {
  background: #F5F5F5;
  border-color: #87CEEB;
}

button.active {
  background: #20B2AA;
  color: white;
  border-color: #20B2AA;
  font-weight: bold;
}
</style>