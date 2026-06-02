<template>
  <section class="menu-page">
    <div class="menu-page__box">
      <h1 class="menu-page__title">Мыльные пузыри</h1>
      <div class="menu-page__buttons">
        <RouterLink class="menu-page__button" :to="{ name: 'GAME' }">
          Начать игру
        </RouterLink>
        <RouterLink class="menu-page__button menu-page__button--secondary" :to="{ name: 'OPTIONS' }">
          Параметры
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'MainMenuPage'
}
</script>

<style scoped lang="scss">
.menu-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef3f8;

  &__box {
    width: 360px;
    padding: 30px;
    border-radius: 14px;
    background: #ffffff;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  &__title {
    margin-bottom: 25px;
    font-size: 32px;
  }

  &__buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__button {
    display: block;
    padding: 12px 16px;
    border-radius: 8px;
    background: #4d96ff;
    color: #ffffff;
    text-decoration: none;
    font-size: 18px;
  }

  &__button--secondary {
    background: #6c757d;
  }
}
</style>