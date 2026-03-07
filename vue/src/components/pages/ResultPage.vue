<template>
  <div class="result">
    <div class="result__container">

      <header class="result__header">
        <h1 class="result__title">ИГРА ОКОНЧЕНА</h1>
        <div v-if="isNewRecord" class="result__badge">
          <span>🎉 НОВЫЙ РЕКОРД! 🎉</span>
        </div>
      </header>

      <section class="result__stats stats">
        <div class="stats__card stats__card--main">
          <p class="stats__label">Ты проехал</p>
          <div class="stats__value">
            <span class="stats__emoji">🏆</span>
            <span class="stats__number">{{ distance }}м</span>
          </div>
        </div>

        <div v-if="bestScore > 0 && !isNewRecord" class="stats__card stats__card--small">
          <p class="stats__label stats__label--small">Лучший результат</p>
          <div class="stats__value stats__value--small">
            <span class="stats__emoji stats__emoji--small">🏆</span>
            <span class="stats__emoji stats__number--small">{{ bestScore }}м</span>
          </div>
        </div>
      </section>

      <footer class="result__actions">
        <BaseLink :to="{ name: $routes.GAME }" title="🔄 Играть снова" variant="primary" />

        <BaseLink :to="{ name: $routes.HOME }" title="🏠 Главное меню" variant="secondary" />
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseLink from '@/components/ui/BaseLink.vue';

interface Props {
  distance: number;
  bestScore: number;
}

// todo прокидывать настоящие значения
const props = withDefaults(defineProps<Props>(), {
  distance: 1250,
  bestScore: 1500
});

const isNewRecord = computed(() => props.distance > props.bestScore);
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
}

.stats {
  text-align: center;
  display: flex;
  flex-direction: column;
  row-gap: 16px;

  &__card {
    border-radius: var(--vt-radius-default);
    backdrop-filter: var(--vt-blur-default);

    &--main {
      padding: 24px;
      background-color: var(--color-background-soft);
      border: 2px solid var(--color-border);
    }

    &--small {
      padding: 16px;
      background-color: var(--color-background-mute);
      border: 1px solid var(--color-border);
    }
  }

  &__label {
    font-size: 18px;
    color: var(--vt-c-blue-soft);
  }

  &__value {
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: 8px;
  }

  &__number {
    font-size: 48px;
    font-weight: 700;
    color: var(--vt-c-blue-soft);

    &--small {
      font-size: 24px;
      font-weight: 700;
      color: var(--vt-c-yellow);
    }
  }

  &__emoji {
    font-size: 32px;

    &--small {
      font-size: 20px;
    }
  }
}
</style>