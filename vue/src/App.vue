<!-- src/App.vue -->
<template>
  <div id="app">
    <h1>Water Sort Puzzle</h1>
    <div class="flasks-container">
      <Flask :layers="exampleLayers" />
      <Flask :layers="[]" />
    </div>
  </div>
</template>

<script>
import Flask from './components/Flask.vue'

export default {
  name: 'App',
  components: {
    Flask
  },
  data() {
    return {
      exampleLayers: [
        { color: 'red', percent: 25 },
        { color: 'blue', percent: 30 },
        { color: 'green', percent: 45 },
      ]
    }
  }
}
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  text-align: center;
  padding: 20px;
}
.flasks-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}
</style>