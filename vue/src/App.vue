<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
</script>

<style lang="less">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  background: #f0f2f5;
  min-height: 100vh;
  padding: 20px;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
}

button {
  padding: 10px 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;

  &:hover {
    background: #f5f5f5;
  }

  &:disabled {
    background: #e0e0e0;
    cursor: not-allowed;

    &:hover {
      background: #e0e0e0;
    }
  }
}
</style>