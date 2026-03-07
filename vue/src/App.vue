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
            { color: 'green', percent: 25 }
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
        return
      }
      this.pour(this.selectedFlaskIndex, index)
      this.selectedFlaskIndex = null
    },
    getAvailableSpace(flask) {
      if (flask.layers.length === 0) return 100;
      const usedSpace = flask.layers.reduce((sum, layer) => sum + layer.percent, 0)
      return 100 - usedSpace
    },
    pour(fromIndex, toIndex) {
      console.log('Переливаем из', fromIndex, 'в', toIndex)
      
      const fromFlask = this.flasks[fromIndex]
      const toFlask = this.flasks[toIndex]

      if (fromFlask.layers.length === 0) return

      const topLayer = fromFlask.layers[fromFlask.layers.length - 1]

      const availableSpace = this.getAvailableSpace(toFlask)
      if (availableSpace === 0) {
        console.log('Целевая колба переполнена, нельзя перелить')
        return
      }
      
      if (availableSpace < 100) {
        const toTopLayer = toFlask.layers[toFlask.layers.length - 1]
        if (toTopLayer.color !== topLayer.color) {
          console.log('Цвета не совпадают, нельзя перелить')
          return
        }
      }

      const pourAmount = Math.min(topLayer.percent, availableSpace)
      console.log('Переливаем ', pourAmount, ' цвета ', topLayer.color)
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