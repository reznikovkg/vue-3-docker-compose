<template>
  <section class="landing">
    <header class="landing__content">
      <h1 class="landing__title">Добро пожаловать</h1>
      <p class="landing__text">
        Перейдите к разделу диктофона, чтобы записывать голосовые заметки и управлять ими.
      </p>
      <RouterLink :to="{ name: $routes.RECORDER }" class="landing__action">
        Открыть диктофон
      </RouterLink>
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
}

.landing__content {
  max-width: 520px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.landing__title {
  margin: 0;
  font-size: 34px;
  font-weight: 700;
  color: #0f172a;
}

.landing__text {
  margin: 0;
  font-size: 16px;
  color: rgba(15, 23, 42, 0.7);
}

.landing__action {
  align-self: center;
  margin-top: 12px;
  padding: 12px 24px;
  border-radius: 999px;
  background: linear-gradient(135deg, #22d3ee, #6366f1);
  color: #0b1120;
  text-decoration: none;
  font-weight: 600;
  box-shadow: 0 12px 24px rgba(79, 70, 229, 0.28);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 28px rgba(79, 70, 229, 0.32);
  }
}

@media (prefers-color-scheme: dark) {
  .landing__title {
    color: #f8fafc;
  }

  .landing__text {
    color: rgba(226, 232, 240, 0.7);
  }
}
</style>
