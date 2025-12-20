<template>
  <section class="landing">
    <header class="landing__content">
      <h1 class="landing__title">Добро пожаловать</h1>
      <p class="landing__text">
        Перейдите к разделу диктофона, чтобы записывать голосовые заметки и управлять ими.
      </p>
      <div class="landing__actions">
        <RouterLink :to="{ name: $routes.RECORDER }" class="landing__action">
          Открыть диктофон
        </RouterLink>
        <RouterLink :to="{ name: $routes.GAME }" class="landing__action landing__action--ghost">
          Запустить игру
        </RouterLink>
      </div>
    </header>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.landing {
  display: grid;
  place-items: center;
  min-height: 60vh;
  text-align: center;
  padding: 48px 16px;

  &__content {
    max-width: 520px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__title {
    margin: 0;
    font-size: 34px;
    font-weight: 700;
    color: #0f172a;
  }

  &__text {
    margin: 0;
    font-size: 16px;
    color: rgba(15, 23, 42, 0.7);
  }

  &__actions {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 12px;
  }

  &__action {
    padding: 12px 24px;
    border-radius: 999px;
    background: linear-gradient(135deg, #22d3ee, #6366f1);
    color: #0b1120;
    text-decoration: none;
    font-weight: 600;
    box-shadow: 0 12px 24px rgba(79, 70, 229, 0.28);
    transition: transform 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 14px 28px rgba(79, 70, 229, 0.32);
    }

    &--ghost {
      background: linear-gradient(135deg, #0ea5e9, #34d399);
      color: #052e16;
      box-shadow: 0 12px 24px rgba(16, 185, 129, 0.26);
    }
  }

  @media (prefers-color-scheme: dark) {
    &__title {
      color: #f8fafc;
    }

    &__text {
      color: rgba(226, 232, 240, 0.7);
    }
  }
}
</style>
