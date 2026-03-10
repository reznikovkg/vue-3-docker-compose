<template>
  <section class="home">
    <div class="home__title-block">
      <h1>Tower defense</h1>
      <p class="home__lead">
        Обороняйте маршрут, стройте турели, усиливайте линию заграждения и не дайте
        волне прорваться к выходу.
      </p>
    </div>

    <div class="home__center">
      <div class="home__actions">
        <RouterLink :to="{ name: $routes.MISSIONS }">Выбор уровня</RouterLink>
        <RouterLink class="ghost" :to="{ name: $routes.HANDBOOK }">Игровые правила</RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
$home-border: 1px solid rgba(255, 255, 255, 0.08);
$home-hero-bg: (
  linear-gradient(160deg, rgba(243, 186, 127, 0.18), rgba(9, 20, 29, 0.9)),
  rgba(9, 20, 29, 0.9)
);
$home-ghost-bg: rgba(255, 255, 255, 0.06);

.home {
  display: flex;
  flex-direction: column;
  gap: 28px;
  min-height: calc(100vh - 150px);
  padding-top: 20px;

  &__title-block {
    width: 100%;
    max-width: 980px;
    margin: 0 auto;
    padding: 34px;
    border-radius: 32px;
    border: $home-border;
    background: $home-hero-bg;
    text-align: center;
  }

  h1 {
    max-width: 100%;
    font-size: clamp(2.6rem, 5vw, 4.9rem);
    line-height: 0.95;
  }

  &__lead {
    max-width: 46ch;
    margin-top: 20px;
    margin-inline: auto;
    color: var(--text-muted);
    font-size: 1.04rem;
  }

  &__center {
    display: grid;
    flex: 1;
    place-items: center;
    width: 100%;
  }

  &__actions {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 14px;

    a {
      min-width: 210px;
      padding: 14px 20px;
      border-radius: 999px;
      background: var(--accent-strong);
      color: #101820;
      font-weight: 700;
      text-align: center;
    }

    .ghost {
      background: $home-ghost-bg;
      color: var(--text-main);
    }
  }
}

@media (max-width: 720px) {
  .home {
    min-height: auto;
    gap: 22px;

    &__title-block {
      padding: 24px;
    }

    &__center {
      display: block;
    }

    &__actions {
      flex-direction: column;
      align-items: stretch;

      a {
        min-width: 0;
      }
    }
  }
}
</style>
