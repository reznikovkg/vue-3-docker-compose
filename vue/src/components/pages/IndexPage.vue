<template>
  <div class="index-page">
    <h1>Добро пожаловать в игру!</h1>
    <router-link to="/game">
      <button>Начать игру</button>
    </router-link>
  </div>
</template>

<script setup>
</script>

<style scoped>
.index-page {
  text-align: center;
  padding: 50px;
}

button {
  padding: 15px 30px;
  font-size: 18px;
  background: #9d45cd;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>