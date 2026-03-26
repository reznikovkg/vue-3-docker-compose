<template>
  <RouterView />
</template>

<script setup>
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #1a1a2e;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.btn {
  border: none;
  color: #fff;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  flex: 1;
  touch-action: manipulation;
  transition: opacity 0.2s;

  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }

  &--green {
    background: #0f9b58;
  }

  &--danger {
    background: #c0392b;
  }
}
</style>
