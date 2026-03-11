<template>
  <div class="home">
    <h1 class="home__title">Tower Defense</h1>
    <p class="home__subtitle">Защити базу от волн противников</p>

    <div class="home__levels">
      <h2>Выберите уровень</h2>
      <div
        v-for="lvl in allLevels"
        :key="lvl.id"
        class="home__level-card"
        @click="() => startLevel(lvl.id)"
      >
        <span class="home__level-name">{{ lvl.name }}</span>
        <span class="home__level-id">Уровень {{ lvl.id }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()
const allLevels = computed(() => store.getters.allLevels)
const startLevel = (levelId: number) => {
  store.dispatch('loadLevel', levelId)
  router.push('/game')
}
</script>

<style lang="scss" scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 24px;
  padding: 40px;

  &__title {
    color: #f0c040;
    font-size: 3rem;
  }

  &__subtitle {
    color: #aaa;
    font-size: 1.1rem;
  }

  &__levels {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;

    h2 {
      color: #ccc;
      margin-bottom: 8px;
    }
  }

  &__level-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 340px;
    padding: 20px 28px;
    background: #16213e;
    border: 2px solid #0f3460;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: #e94560;
      transform: translateY(-2px);
    }
  }

  &__level-name {
    font-size: 1.2rem;
    font-weight: 600;
  }

  &__level-id {
    color: #888;
    font-size: 0.9rem;
  }
}
</style>
