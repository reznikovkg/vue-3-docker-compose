<template>
  <div class="index-page">
    <h1 class="index-page__title">
      Добро пожаловать в игру!
    </h1>
    <router-link 
    to="/game"
    class="index-page__link"
    >
      <button class="button button--primary">
        Начать игру
      </button>
    </router-link>
  </div>
</template>

<script setup>
</script>

<style scoped lang="scss">
.index-page {
  text-align: center;
  padding: 50px;

  &__title {
    margin-bottom: 30px;
    color: #333;
  }

  &__link {
    text-decoration: none;
  }
}

.button {
  padding: 15px 30px;
  font-size: 18px;
  background: #9d45cd;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background: darken(#9d45cd, 10%)
  }
}
</style>