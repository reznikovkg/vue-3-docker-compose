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

<style scoped>
.shell {
  min-height: 100vh;
  padding: 24px;
}

.shell__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.shell__brand {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-accent);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.shell__brand-name {
  font-size: 1.8rem;
}

.shell__nav {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.shell__nav-link {
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: rgba(6, 19, 28, 0.55);
  color: var(--text-main);
}

.shell__nav-link.router-link-active {
  border-color: rgba(239, 167, 91, 0.45);
  background: rgba(235, 128, 52, 0.14);
  color: var(--accent-soft);
}

.shell__content {
  min-height: calc(100vh - 130px);
}

@media (max-width: 840px) {
  .shell {
    padding: 16px;
  }

  .shell__header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
