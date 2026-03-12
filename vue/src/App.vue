<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>

<style lang="scss">
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  width: 100%;
  min-height: 100vh;
  background: #1a1a2e;
  color: #eee;
  font-family: 'Segoe UI', sans-serif;
}

#app {
  width: 100%;
  min-height: 100vh;
}
</style>