<template>
  <div class="game">
    <div class="game__content">
      <h2>Переливатор</h2>

      <div v-if="isFinished" class="game__win">Игра окончена!</div>

      <div class="game__field">
        <Flask v-for="(flask, index) in flasks" :key="index" :layers="flask" :maxLayers="MAX_LAYERS" :isSelected="selectedIndex === index" @select="() => selectFlask(index)" />
      </div>

      <button class="game__restart" @click="() => generateGame()">Новая игра</button>
    </div>
  </div>
</template>

<script>
import Flask from './Flask.vue'

export default {
  name: 'IndexPage',
  components: {
    Flask
  },
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
      this.flasks = []

      const allLayers = []

      for (let i = 0; i < this.COLORS.length; i++) {
        for (let j = 0; j < this.MAX_LAYERS; j++) {
          allLayers.push(this.COLORS[i])
        }
      }

      for (let i = allLayers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = allLayers[i]
        allLayers[i] = allLayers[j]
        allLayers[j] = temp
      }

      const TOTAL_FLASKS = this.COLORS.length + 2

      for (let i = 0; i < TOTAL_FLASKS; i++) {
        this.flasks.push([])
      }

      while (allLayers.length > 0) {
        const randomIndex = Math.floor(Math.random() * TOTAL_FLASKS)

        if (this.flasks[randomIndex].length < this.MAX_LAYERS) {
          const layer = allLayers.pop()
          this.flasks[randomIndex].push(layer)
        }
      }
    },

    selectFlask (index) {
      if (this.isFinished) return

      if (this.selectedIndex === null) {
        if (this.flasks[index].length === 0) return
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

      if (from.length === 0) return
      if (to.length >= this.MAX_LAYERS) return

      const topColor = from[from.length - 1]

      if (to.length > 0) {
        const targetTop = to[to.length - 1]
        if (targetTop !== topColor) return
      }

      let count = 0

      for (let i = from.length - 1; i >= 0; i--) {
        if (from[i] === topColor) count++
        else break
      }

      const freeSpace = this.MAX_LAYERS - to.length
      const moveCount = count > freeSpace ? freeSpace : count

      for (let i = 0; i < moveCount; i++) {
        to.push(from.pop())
      }

      if (this.checkWin()) this.isFinished = true
    },

    checkWin () {
      for (let i = 0; i < this.flasks.length; i++) {
        const flask = this.flasks[i]

        if (flask.length === 0) continue
        if (flask.length !== this.MAX_LAYERS) return false

        const color = flask[0]

        for (let j = 0; j < flask.length; j++) {
          if (flask[j] !== color) return false
        }
      }

      return true
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