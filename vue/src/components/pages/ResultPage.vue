<template>
  <div class="result">
    <div class="result__container">

      <header class="result__header">
        <h1 class="result__title">ИГРА ОКОНЧЕНА</h1>
        <div v-if="isNewRecord" class="result__badge">
          <span>🎉 НОВЫЙ РЕКОРД! 🎉</span>
        </div>
      </header>

      <section class="result__stats">
        <StatsCard
          :score="distance"
          label="Ты проехал"
          variant="main"
        />
        <StatsCard
          v-if="bestScore > 0 && !isNewRecord"
          :score="bestScore"
          label="Лучший результат"
          variant="small"
        />
      </section>

      <footer class="result__actions">
        <BaseLink :to="{ name: $routes.GAME }" title="🔄 Играть снова" variant="primary" />

        <BaseLink :to="{ name: $routes.HOME }" title="🏠 Главное меню" variant="secondary" />
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import BaseLink from '@/components/ui/BaseLink.vue'
import StatsCard from '@/components/ui/StatsCard.vue'

const store = useStore()

const distance = computed(
  () => store.getters.getCurrentScore,
)

const bestScore = computed(
  () => store.getters.getBestScore,
)

const isNewRecord = computed(
  () => distance.value > bestScore.value,
)
</script>

<style lang="scss" scoped>
.result {
  display: flex;
  align-items: center;
  justify-content: center;

  &__container {
    width: fit-content;

    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__title {
    font-size: 60px;
    font-weight: 800;
    color: var(--vt-c-white);
    filter: drop-shadow(var(--vt-shadow-default));
  }

  &__badge {
    text-align: center;
    font-size: 24px;
    font-weight: 700;
    color: var(--vt-c-yellow);
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__stats {
    display: flex;
    flex-direction: column;
    row-gap: 16px;
  }
}
</style>