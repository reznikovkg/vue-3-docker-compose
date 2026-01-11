<template>
  <div class="index-page">
    <h1 class="index-page__title">Главная страница</h1>
    <nav class="index-page__nav">
      <RouterLink :to="{ name: $routes.BUBBLE_GAME }" class="index-page__link">
        Игра "Мыльные пузыри" 🫧
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped lang="less">
.index-page {
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;

  &__title {
    margin-bottom: 30px;
    color: #333;
    text-align: center;
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  &__link {
    padding: 20px 30px;
    background: linear-gradient(135deg, #4ECDC4, #44A08D);
    color: white;
    text-decoration: none;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 500;
    transition: all 0.3s;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(78, 205, 196, 0.4);
    }
  }
}
</style>
