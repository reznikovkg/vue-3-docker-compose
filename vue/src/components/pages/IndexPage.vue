<template>
  <div class="index-page">
    <h1>Game Park</h1>
    <router-link :to="{ name: 'GAME' }" class="start-button">
      Start Game
    </router-link>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.index-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f0f8ff;
}

h1 {
  color: #2e8b57;
  margin-bottom: 30px;
}

.start-button {
  padding: 15px 30px;
  background: #32cd32;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  transition: background 0.3s;
}

.start-button:hover {
  background: #228b22;
}
</style>