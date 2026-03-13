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
    <div class="win-counter">
      Серия побед: {{ winCount }}
    </div>
    <div>
      <button @click="resetGame" class="reset-btn">Сброс</button>
    </div>
    <div v-if="showWinMessage" class="win-message">
      Победа
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
      FLASK_COUNT: 5,
      LAYERS_PER_FLASK: 4,
      COLORS: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
      selectedFlaskIndex: null,
      flasks: [],
      showWinMessage: false,
      winCount : 0
    }
  },
  mounted() {
    this.newGame()
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

      if (topLayer.percent === pourAmount) {
        fromFlask.layers.pop()
      } else {
        topLayer.percent -= pourAmount
      }

      if (toFlask.layers.length === 0) {
        toFlask.layers.push({
          color: topLayer.color,
          percent: pourAmount
        })
      } else {
        const toTopLayer = toFlask.layers[toFlask.layers.length - 1]
        toTopLayer.percent += pourAmount
      }

      if (this.checkWin()) {
        this.showWinMessage = true
        console.log('Победа')
        setTimeout(() => {
          this.showWinMessage = false
          this.newGame()
        }, 2000)
        this.winCount += 1
      }
    },
    generateRandomFlasks() {
      const newFlasks = []
      let percent = 100 / this.LAYERS_PER_FLASK

      const mapColors = []
      for (let i = 0; i < this.FLASK_COUNT - 1; i++) {
        mapColors.push(this.COLORS[Math.floor(Math.random() * this.COLORS.length)])
      }
      console.log(mapColors)
      const mapCounts = []
      for (let i = 0; i < this.FLASK_COUNT - 1; i++) {
        mapCounts.push(4)
      }
      console.log(mapCounts)

      for (let i = 0; i < this.FLASK_COUNT - 2; i++) {
        const layers = []
        let fullness = 0
        console.log('Генерация слоев для колбы ', i)
        do {
          let colorIndex = Math.floor(Math.random() * mapColors.length)
          console.log('Выбираем цвет: ', colorIndex)
          let rndParts = 1
          if (mapCounts[colorIndex] != 1) {
            rndParts = Math.min(Math.floor(Math.random() * (mapCounts[colorIndex] - 1) + 1), this.LAYERS_PER_FLASK - fullness)
          }
          console.log('Берем ', rndParts, ' частей этого цвета')
          console.log('Получаем ', percent * rndParts, ' процент цвета в колбе')
          if (layers.length > 0 && layers[layers.length - 1].color === mapColors[colorIndex]) {
            layers[layers.length - 1].percent += percent * rndParts
          } else {
            layers.push({
              color: mapColors[colorIndex],
              percent: percent * rndParts
            })
          }
          fullness += rndParts
          mapCounts[colorIndex] -= rndParts
          console.log('Остается ', mapCounts[colorIndex], ' этого цвета')
          if (mapCounts[colorIndex] === 0) {
            mapColors.splice(colorIndex, 1)
            mapCounts.splice(colorIndex, 1)
          }
        } while (fullness < this.LAYERS_PER_FLASK)
        newFlasks.push( {layers} )
      }
      console.log('Генерация последней колбы')
      const lastLayers = []
      console.log('Помещаем, что осталось: ', mapColors, mapCounts)
      for (let i = 0; i < mapColors.length; i++) {
        lastLayers.push({
          color: mapColors[i],
          percent: percent * mapCounts[i]
        })
      }
      for (let i = 1; i < lastLayers.length; i++) {
        if (lastLayers[i].color === lastLayers[i - 1].color) {
          console.log('Несколько слоев одного цвета подряд')
          lastLayers[i - 1].percent += lastLayers[i].percent
          lastLayers.splice(i, 1)
        }
      }
      console.log(lastLayers)
      newFlasks.push( {layers: lastLayers} )
      newFlasks.push( {layers: []} )

      return newFlasks
    },
    checkWin() {
      for (let flask of this.flasks) {
        if (flask.layers.length === 0) continue
        if (flask.layers.length > 1) return false
        if (flask.layers[0].percent !== 100) return false
      }
      return true
    },
    newGame() {
      this.selectedFlaskIndex = null
      this.flasks = this.generateRandomFlasks()
      console.log('Новая игра', this.flasks)
    },
    resetGame() {
      this.showWinMessage = false
      this.newGame()
      this.winCount = 0
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
.win-message {
  position: center;
  color: gold;
  padding: 20px 40px;
  font-size: 32px;
  font-weight: bold;
  z-index: 1000;
}
.reset-btn {
  padding: 10px 20px;
  font-size: 16px;
  background: #36c9ff;
  color: #333;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.win-counter {
  color: gold;
  padding: 8px 16px;
  font-size: 18px;
  font-weight: bold;
}
</style>