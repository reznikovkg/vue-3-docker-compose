<template>
  <div class="game-page">
    <h1>Разливайка</h1>

    <div class="game-panel">
      <button class="game-button" @click="() => startNewGame()">Новая игра</button>
      <div>Сделано ходов: {{ moves }}</div>
    </div>

    <div v-if="isWin" class="game-page__win">Победа!</div>

    <div class="bottles-grid">
      <Bottle
        v-for="(bottle, index) in bottles"
        :key="index"
        :bottle="bottle"
        :index="index"
        :is-selected="isBottleSelected(index)"
        @select="() => handleBottleClick(index)"
      />
    </div>
  </div>
</template>

<script>
import Bottle from '../Bottle.vue'
import { MAX_LAYERS, COLOR_COUNT, EMPTY_BOTTLES, BOTTLE_COUNT, COLORS } from '../game-settings.js'

export default {
  name: 'IndexPage',
  components: {
    Bottle,
  },
  data() {
    return {
      bottles: [],
      selectedBottleIndex: null,
      moves: 0,
      isWin: false,
    }
  },
  created() {
    this.startNewGame()
  },
  methods: {
    startNewGame() {
      const bottles = this.generateBottles()

      this.bottles = bottles
      this.selectedBottleIndex = null
      this.moves = 0
      this.isWin = this.checkWin(this.bottles)
    },
    shuffleArray(array) {
      const shuffled = [...array]

      shuffled.forEach((_, index) => {
        const randomIndex = Math.floor(Math.random() * array.length)
        const temp = shuffled[index]
        shuffled[index] = shuffled[randomIndex]
        shuffled[randomIndex] = temp
      })

      return shuffled
    },
    createAllLayers(unitAmount) {
      const layers = []
      const gameColors = COLORS.slice(0, COLOR_COUNT)

      gameColors.forEach((color) => {
        const colorLayers = Array.from({ length: MAX_LAYERS }, () => ({
          color: color,
          amount: unitAmount
        }))
        layers.push(...colorLayers)
      })

      return layers
    },
    generateBottles() {
      const unitAmount = 100 / MAX_LAYERS
      const allLayers = this.createAllLayers(unitAmount)
      const shuffledLayers = this.shuffleArray(allLayers)
      const bottles = Array.from({ length : BOTTLE_COUNT})
        .map((_, bottleIndex) => {
          if (bottleIndex >= COLOR_COUNT) {
            return { layers: [] }
          }

        const startIndex = bottleIndex * MAX_LAYERS
        const bottleLayers = shuffledLayers.slice(startIndex, startIndex + MAX_LAYERS)

        return {
          layers: this.normaliseLayers(bottleLayers)
        }
      })
      return this.checkWin(bottles) ? this.generateBottles() : bottles
    },
    isBottleSelected(index) {
      return this.selectedBottleIndex === index
    },
    handleBottleClick(index) {
      if (this.isWin) {
        return
      }

      if (this.selectedBottleIndex === null) {
        if (!this.bottles[index].layers.length) {
          return
        }

        this.selectedBottleIndex = index
        return
      }

      if (this.selectedBottleIndex === index) {
        this.selectedBottleIndex = null
        return
      }

      const result = this.pourLayer(this.selectedBottleIndex, index)

      if (!result.success) {
        this.selectedBottleIndex = null
        return
      }

      this.moves += 1
      this.selectedBottleIndex = null
      this.isWin = this.checkWin(this.bottles)
    },
    pourLayer(sourceIndex, targetIndex) {
      const sourceBottle = this.bottles[sourceIndex]
      const targetBottle = this.bottles[targetIndex]
      const sourceTopLayer = this.getTopLayer(sourceBottle)

      if (!sourceTopLayer) {
        return { success: false }
      }

      const freeSpace = 100 - this.getBottleFill(targetBottle)
      if (freeSpace <= 0) {
        return { success: false }
      }

      const targetTopLayer = this.getTopLayer(targetBottle)
      const createsNewLayer = !targetTopLayer || targetTopLayer.color !== sourceTopLayer.color

      if (createsNewLayer && targetBottle.layers.length >= MAX_LAYERS) {
        return { success: false }
      }

      const transferAmount = Math.min(sourceTopLayer.amount, freeSpace)
      if (transferAmount <= 0) {
        return { success: false }
      }

      if (targetTopLayer && targetTopLayer.color === sourceTopLayer.color) {
        targetTopLayer.amount += transferAmount
      } else {
        targetBottle.layers.push({
          color: sourceTopLayer.color,
          amount: transferAmount,
        })
      }

      sourceTopLayer.amount -= transferAmount
      sourceBottle.layers = sourceBottle.layers.filter((layer) => layer.amount > 0)
      sourceBottle.layers = this.normaliseLayers(sourceBottle.layers)
      targetBottle.layers = this.normaliseLayers(targetBottle.layers)

      return { success: true }
    },
    getTopLayer(bottle) {
      return bottle.layers.length ? bottle.layers[bottle.layers.length - 1] : null
    },
    getBottleFill(bottle) {
      return bottle.layers.reduce((sum, layer) => sum + layer.amount, 0)
    },
    normaliseLayers(layers) {
      return layers
        .reduce((normalisedLayers, layer) => {
          const previousLayer = normalisedLayers[normalisedLayers.length - 1]

          if (previousLayer && previousLayer.color === layer.color) {
            previousLayer.amount += layer.amount
            return normalisedLayers
          }

          normalisedLayers.push({
            color: layer.color,
            amount: layer.amount,
          })

          return normalisedLayers
        }, [])
    },
    checkWin(bottles = this.bottles) {
      const nonEmptyBottles = bottles.filter((bottle) => bottle.layers.length)

      const allBottlesHaveOneColor = nonEmptyBottles.every((bottle) => {
        const firstColor = this.getTopLayer(bottle).color
        return bottle.layers.every((layer) => layer.color === firstColor)
      })

      if (!allBottlesHaveOneColor) {
        return false
      }

      const bottleColors = nonEmptyBottles.map((bottle) => this.getTopLayer(bottle).color)

      return new Set(bottleColors).size === bottleColors.length
    },
  },
}
</script>

<style scoped lang="scss">
.game-page {
  min-width: 900px;

  &__win {
    margin-bottom: 20px;
    color: rgb(0, 170, 42);
    font-weight: 700;
  }
}

.game-panel {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.game-button {
  border: 1px solid black;
  background: black;
  color: white;
  border-radius: 8px;
  padding: 10px 16px;
  cursor: pointer;
}

.bottles-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}
</style>
