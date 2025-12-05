<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
</script>

<style lang="less">
@background-color: #f0f2f5;
@border-color: #ccc;
@disabled-bg: #e0e0e0;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  background: @background-color;
  min-height: 100vh;
  padding: 20px;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
}

button {
  padding: 10px 20px;
  border: 1px solid @border-color;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;

  &:hover {
    background: darken(white, 5%);
  }

  &:disabled {
    background: @disabled-bg;
    cursor: not-allowed;

    &:hover {
      background: @disabled-bg;
    }
  }
}
</style>