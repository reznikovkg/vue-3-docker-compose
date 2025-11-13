<template>
  <div class="game-page">
    <header class="game-page__header">
      <h1 class="game-page__title">✨ Match-3 Game</h1>
      <p class="game-page__subtitle">
        Игра “3 в ряд”
      </p>
    </header>

    <div class="game-page__content">
      <div class="game-page__main">
        <GameControls @game-initialized="forceRerender" />
        <GameBoard :key="componentKey" />
      </div>
      
      <aside class="game-page__sidebar">
        <GameInfo />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import GameControls from '@/components/game/GameControls.vue'
import GameBoard from '@/components/game/GameBoard.vue'
import GameInfo from '@/components/game/GameInfo.vue'

const store = useStore()
const componentKey = ref(0)

const forceRerender = () => {
  componentKey.value += 1
}

onMounted(() => {
  store.dispatch('game/initializeGame').then(() => {
    forceRerender()
  })
})
</script>

<style scoped lang="scss">
.game-page {
  --game-text-strong: #0f172a;
  --game-text-muted: rgba(15, 23, 42, 0.65);

  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 100vh;
  background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);

  &__header {
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }

  &__title {
    margin: 0;
    font-size: 32px;
    font-weight: 700;
    color: var(--game-text-strong);
  }

  &__subtitle {
    margin: 0;
    font-size: 16px;
    color: var(--game-text-muted);
  }

  &__content {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 24px;
    align-items: start;
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__sidebar {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  @media (max-width: 768px) {
    &__content {
      grid-template-columns: 1fr;
    }
    
    &__sidebar {
      order: -1;
    }
  }

  @media (prefers-color-scheme: dark) {
    & {
      --game-text-strong: #f8fafc;
      --game-text-muted: rgba(226, 232, 240, 0.7);
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    }
  }
}
</style>