<template>
  <div class="game-page" v-if="level">
    <header class="game-page__header">
      <div class="game-page__header-left">
        <button class="game-page__back-btn" @click="() => goHome()">← Назад</button>
        <h1 class="game-page__title">{{ level.name }}</h1>
      </div>

      <div class="game-page__stats">
        <span class="game-page__gold">GOLD {{ gold }}</span>
        <span class="game-page__enemies-count">ENEMY {{ enemies.length }}</span>
      </div>

      <div class="game-page__level-switcher">
        <span>Уровень:</span>
        <button
          v-for="lvl in allLevels"
          :key="lvl.id"
          class="game-page__lvl-btn"
          :class="{ 'game-page__lvl-btn--active': currentLevelId === lvl.id }"
          @click="() => switchLevel(lvl.id)"
        >
          {{ lvl.id }}
        </button>
        <button class="game-page__cheat-btn" @click="() => cheatGold()">+200 GOLD</button>
      </div>
    </header>

    <div class="game-page__body">
      <div class="game-page__map-wrap">
        <GameMap />
      </div>

      <aside class="game-page__sidebar">
        <TowerPanel />
        <EnemyPanel />
      </aside>
    </div>

    <footer class="game-page__footer">
      <span>Выбор врага кликом, управление стрелками | Перетаскивание врага мышью | Клик на слоты башен для управления</span>
    </footer>
  </div>

  <div v-else class="game-page__loading">
    Загрузка уровня...
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import GameMap from '@/components/ui/GameMap.vue'
import TowerPanel from '@/components/ui/TowerPanel.vue'
import EnemyPanel from '@/components/ui/EnemyPanel.vue'

export default {
  name: 'ExamplePage',
  components: { GameMap, TowerPanel, EnemyPanel },

  setup () {
    const store = useStore()
    const router = useRouter()

    const level = computed(() => store.getters.currentLevel)
    const gold = computed(() => store.state.gold)
    const enemies = computed(() => store.state.enemies)
    const allLevels = computed(() => store.getters.allLevels)
    const currentLevelId = computed(() => store.state.currentLevelId)

    const goHome = () => router.push('/')
    const switchLevel = (id) => store.dispatch('loadLevel', id)
    const cheatGold = () => store.dispatch('cheatGold')

    return {
      level,
      gold,
      enemies,
      allLevels,
      currentLevelId,
      goHome,
      switchLevel,
      cheatGold,
    }
  },
}
</script>

<style lang="scss" scoped>
.game-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #1a1a2e;
  color: #eee;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px;
    background: #16213e;
    border-bottom: 2px solid #0f3460;
    gap: 20px;
    flex-wrap: wrap;
  }

  &__header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__back-btn {
    background: none;
    border: 1px solid #0f3460;
    color: #aaa;
    border-radius: 6px;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.15s;

    &:hover {
      border-color: #e94560;
      color: #e94560;
    }
  }

  &__title {
    font-size: 1.3rem;
    color: #f0c040;
  }

  &__stats {
    display: flex;
    gap: 20px;
    font-size: 1.1rem;
    font-weight: 700;
  }

  &__gold {
    color: #f0c040;
  }

  &__enemies-count {
    color: #ff8888;
  }

  &__level-switcher {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    color: #888;
  }

  &__lvl-btn {
    background: #0f1e35;
    border: 1px solid #0f3460;
    color: #aaa;
    border-radius: 4px;
    padding: 4px 10px;
    cursor: pointer;
    transition: all 0.15s;

    &:hover { border-color: #f0c040; color: #f0c040; }

    &--active {
      background: #0f3460;
      color: #f0c040;
      border-color: #f0c040;
    }
  }

  &__cheat-btn {
    background: none;
    border: 1px dashed #446644;
    color: #66aa66;
    border-radius: 4px;
    padding: 4px 10px;
    cursor: pointer;
    font-size: 0.78rem;
    transition: all 0.15s;

    &:hover { border-color: #88cc88; color: #88cc88; }
  }

  &__body {
    display: flex;
    flex: 1;
    gap: 20px;
    padding: 20px 24px;
    align-items: flex-start;
  }

  &__map-wrap {
    flex: 1;
    overflow: auto;
  }

  &__sidebar {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 260px;
  }

  &__footer {
    padding: 10px 24px;
    background: #16213e;
    border-top: 1px solid #0f3460;
    font-size: 0.78rem;
    color: #555;
    text-align: center;
  }

  &__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    color: #888;
    font-size: 1.2rem;
  }
}
</style>
