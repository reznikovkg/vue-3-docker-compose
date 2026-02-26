<template>
  <div id="app">
    <GamePage />
  </div>
</template>

<script>
import GamePage from './components/pages/GamePage.vue'

export default {
  name: 'App',

  components: {
    GamePage
  }
}
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: #ddeeff;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}


.c-button {
  border: 1px solid #08d3b0;
  background: #00915e;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  touch-action: manipulation;

  &--red {
    border: 1px solid #d30058;
    background: #910038;
  }

}
</style>