<template>
  <div class="shell">
    <header v-if="$route.name !== $routes.HOME" class="shell__header">
      <RouterLink class="shell__brand" :to="{ name: $routes.HOME }">
        <span class="shell__brand-name">Tower defense</span>
      </RouterLink>

      <nav class="shell__nav">
        <RouterLink class="shell__nav-link" :to="{ name: $routes.HOME }">Старт</RouterLink>
        <RouterLink class="shell__nav-link" :to="{ name: $routes.MISSIONS }">Уровни</RouterLink>
        <RouterLink class="shell__nav-link" :to="{ name: $routes.HANDBOOK }">Игровые правила</RouterLink>
      </nav>
    </header>

    <main class="shell__content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped lang="scss">
$shell-border: 1px solid rgba(255, 255, 255, 0.12);
$shell-link-bg: rgba(6, 19, 28, 0.55);
$shell-link-active-border: rgba(239, 167, 91, 0.45);
$shell-link-active-bg: rgba(235, 128, 52, 0.14);

.shell {
  min-height: 100vh;
  padding: 24px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 24px;
  }

  &__brand {
    display: inline-flex;
    align-items: center;
    font-family: var(--font-accent);
    letter-spacing: 0.08em;
    text-transform: uppercase;

    &-name {
      font-size: 1.8rem;
    }
  }

  &__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  &__nav-link {
    padding: 10px 14px;
    border: $shell-border;
    border-radius: 999px;
    background: $shell-link-bg;
    color: var(--text-main);

    &.router-link-active {
      border-color: $shell-link-active-border;
      background: $shell-link-active-bg;
      color: var(--accent-soft);
    }
  }

  &__content {
    min-height: calc(100vh - 130px);
  }
}

@media (max-width: 840px) {
  .shell {
    padding: 16px;

    &__header {
      flex-direction: column;
      align-items: flex-start;
    }
  }
}
</style>
