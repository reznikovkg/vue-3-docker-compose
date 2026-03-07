<template>
  <div class="home">
    <div class="home__container">

      <header class="home__header">
        <h1 class="home__title">🏎️ ГОНКИ 🏎️</h1>
        <span class="home__subtitle">Уворачивайся от машин!</span>
      </header>

      <div v-if="bestScore > 0" class="home__score-card">
        <div class="home__score-value">
          <span class="home__icon-trophy">🏆</span>
          <span class="home__score-number">{{ bestScore }}м</span>
        </div>
        <p class="home__score-label">Лучший результат</p>
      </div>

      <BaseLink :to="{ name: $routes.GAME }" title="▶ Начать игру" variant="primary" />

      <section class="home__rules rules">
        <h2 class="rules__title">Как играть:</h2>

        <ul class="rules__list">
          <li class="rules__item">
            <span class="rules__icon">🎮</span>
            <div class="rules__content">
              <p class="rules__label">Управление</p>
              <p class="rules__description">Стрелки ← → или A/D на клавиатуре. Тапы на экране для мобильных</p>
            </div>
          </li>

          <li class="rules__item">
            <span class="rules__icon">🚗</span>
            <div class="rules__content">
              <p class="rules__label">Цель</p>
              <p class="rules__description">Проезжай как можно больше метров, уворачиваясь от встречных машин</p>
            </div>
          </li>

          <li class="rules__item">
            <span class="rules__icon">❤️</span>
            <div class="rules__content">
              <p class="rules__label">Жизни</p>
              <p class="rules__description">У тебя 3 жизни, каждое столкновение отнимает одну жизнь</p>
            </div>
          </li>

          <li class="rules__item">
            <span class="rules__icon">⚡</span>
            <div class="rules__content">
              <p class="rules__label">Скорость</p>
              <p class="rules__description">Скорость постепенно увеличивается!</p>
            </div>
          </li>
        </ul>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import BaseLink from '@/components/ui/BaseLink.vue';

interface Props {
  bestScore: number;
}

// todo прокидывать настоящие значения
const props = withDefaults(defineProps<Props>(), {
  bestScore: 1500
});


</script>

<style scoped lang="scss">
.home {
  display: flex;
  align-items: center;
  justify-content: center;

  &__container {
    width: fit-content;
    text-align: center;

    display: flex;
    flex-direction: column;
    row-gap: 32px;
  }

  &__header {
    display: flex;
    flex-direction: column;
    row-gap: 8px;
  }

  &__title {
    font-size: 60px;
    font-weight: 800;
    color: var(--vt-c-white);
    filter: drop-shadow(var(--vt-shadow-default));
  }

  &__subtitle {
    font-size: 20px;
    color: var(--vt-c-blue-soft);
  }

  &__score-card {
    background-color: var(--color-background-soft);
    backdrop-filter: var(--vt-blur-default);
    border-radius: var(--vt-radius-default);
    padding: 16px;
    border: 2px solid var(--color-border);
  }

  &__score-value {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--vt-c-yellow);
    font-size: 24px;
    font-weight: 700;
  }

  &__score-label {
    font-size: 14px;
    color: var(--vt-c-blue-soft);
  }
}

.rules {
  background-color: var(--color-background-mute);
  backdrop-filter: var(--vt-blur-default);
  border-radius: var(--vt-radius-default);
  padding: 24px;
  border: 1px solid var(--color-background-soft);
  text-align: left;

  &__title {
    font-size: 18px;
    font-weight: 700;
    color: var(--vt-c-white);
    text-align: center;
    margin-bottom: 16px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    row-gap: 12px;
  }

  &__item {
    display: flex;
    column-gap: 12px;
  }

  &__icon {
    font-size: 24px;
  }

  &__label {
    font-weight: 600;
    color: var(--vt-c-white-soft);
  }

  &__description {
    font-size: 14px;
    color: var(--vt-c-blue-soft);
  }
}
</style>
