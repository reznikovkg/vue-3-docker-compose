<template>
  <div class="index-page">
    <h1 class="index-page__title">Переливатор</h1>
    <p>Логическая игра — разделите цвета по колбам</p>
    <RouterLink :to="{ name: $routes.POUR_GAME }" class="index-page__link"> Играть </RouterLink>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.index-page {
  padding: 48px;
  text-align: center;
  font-family: sans-serif;

  &__title {
    font-size: 32px;
    margin-bottom: 16px;
  }

  &__link {
    display: inline-block;
    margin-top: 24px;
    padding: 12px 32px;
    background: #3498db;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-size: 18px;
  }
}
</style>
