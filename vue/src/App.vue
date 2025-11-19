<template>
  <div class="app">
    <Game :rows="20" :columns="10" />
  </div>
</template>

<script setup>
import Game from './components/Game.vue'
</script>

<style scoped>
.app {
  font-family: sans-serif;
  text-align: center;
  color: #fff;
  background: linear-gradient(145deg, #ffff6b, #ee5a24);
  min-height: 100vh;
  padding: 20px;
}
</style>