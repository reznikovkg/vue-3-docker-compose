<template>
  <div id="app">
    <h1>Water Sort Puzzle</h1>
    <div class="flasks-container">
      <Flask
        v-for="(flask, index) in flasks"
        :key="index"
        :layers="flask.layers"
        :is-selected="selectedFlaskIndex === index"
        @click="handleFlaskClick(index)"
      />
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
      COLORS: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
      selectedFlaskIndex: null,
      flasks: [
        {
          layers: [
            { color: 'yellow', percent: 25 },
            { color: 'blue', percent: 25 },
            { color: 'yellow', percent: 25 },
            { color: 'blue', percent: 25 }
          ]
        },
        {
          layers: [ 
            { color: 'blue', percent: 25 },
            { color: 'yellow', percent: 25 },
            { color: 'blue', percent: 25 },
            { color: 'yellow', percent: 25 }
          ]
        },
        {
          layers: []
        }
      ]
    }
  },
  methods: {
    handleFlaskClick(index) {
      console.log('Клик по колбе с индексом:', index)
      if (this.selectedFlaskIndex === null) {
        this.selectedFlaskIndex = index
        return
      }
      if (this.selectedFlaskIndex === index) {
        this.selectedFlaskIndex = null
        return;
      }
      
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