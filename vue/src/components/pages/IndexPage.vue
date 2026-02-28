<template>
  <div class="game">
    <div class="game__content">
      <h2>Переливатор</h2>

      <div v-if="isFinished" class="game__win">
        Игра окончена!
      </div>

      <div class="game__field">
        <Flask
          v-for="(flask, index) in flasks"
          :key="index"
          :layers="flask"
          :maxLayers="MAX_LAYERS"
          :isSelected="selectedIndex === index"
          @select="() => selectFlask(index)"
        />
      </div>

      <button class="game__restart" @click="() => generateGame()">
        Новая игра
      </button>
    </div>
  </div>
</template>

<script>
import Flask from './Flask.vue'

export default {
  name: 'IndexPage',
  components: { Flask },

  data () {
    return {
      flasks: [],
      selectedIndex: null,
      MAX_LAYERS: 4,
      COLORS: ['red', 'blue', 'green', 'yellow'],
      isFinished: false
    }
  },

  mounted () {
    this.generateGame()
  },

  methods: {
    generateGame () {
      this.selectedIndex = null
      this.isFinished = false

      const layers = this.createLayers()
      this.shuffle(layers)

      this.flasks = this.createEmptyFlasks()
      this.distributeLayers(layers)
    },

    createLayers () {
      const result = []

      this.COLORS.forEach(color => {
        for (let i = 0; i < this.MAX_LAYERS; i++) {
          result.push(color)
        }
      })

      return result
    },

    shuffle (array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp
      }
    },

    createEmptyFlasks () {
      const total = this.COLORS.length + 2
      const result = []

      for (let i = 0; i < total; i++) {
        result.push([])
      }

      return result
    },

    distributeLayers (layers) {
      layers.forEach(layer => {
        let placed = false

        while (!placed) {
          const randomIndex = Math.floor(Math.random() * this.flasks.length)

          if (this.flasks[randomIndex].length < this.MAX_LAYERS) {
            this.flasks[randomIndex].push(layer)
            placed = true
          }
        }
      })
    },

    selectFlask (index) {
      if (this.isFinished) return

      if (this.selectedIndex === null) {
        if (!this.flasks[index].length) return
        this.selectedIndex = index
        return
      }

      if (this.selectedIndex === index) {
        this.selectedIndex = null
        return
      }

      this.pour(this.selectedIndex, index)
      this.selectedIndex = null
    },

    pour (fromIndex, toIndex) {
      const from = this.flasks[fromIndex]
      const to = this.flasks[toIndex]

      if (!from.length) return
      if (to.length >= this.MAX_LAYERS) return

      const topColor = from[from.length - 1]

      if (to.length && to[to.length - 1] !== topColor) return

      let count = 0

      for (let i = from.length - 1; i >= 0; i--) {
        if (from[i] !== topColor) break
        count++
      }

      const freeSpace = this.MAX_LAYERS - to.length
      const moveCount = count > freeSpace ? freeSpace : count

      for (let i = 0; i < moveCount; i++) {
        to.push(from.pop())
      }

      if (this.checkWin()) {
        this.isFinished = true
      }
    },

    checkWin () {
      return this.flasks.every(flask => {
        if (!flask.length) return true
        if (flask.length !== this.MAX_LAYERS) return false
        return flask.every(color => color === flask[0])
      })
    }
  }
}
</script>

<style scoped lang="scss">
.game {
  text-align: center;

  &__field {
    display: flex;
    justify-content: center;
    margin: 20px 0;
  }

  &__restart {
    padding: 6px 12px;
    cursor: pointer;
  }

  &__win {
    color: green;
    margin-bottom: 10px;
  }
}
</style>