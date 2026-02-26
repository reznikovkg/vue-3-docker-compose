<template>
  <div>
    <Flask v-for="(flask, index) in flasks" :key="index" />
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
      MAX_LAYERS: 4,
      COLORS: ['red', 'blue', 'green', 'yellow']
    }
  },
  mounted () {
    this.generateGame()
  },
  methods: {
    generateGame () {
      this.flasks = []

      const TOTAL = this.COLORS.length + 2

      for (let i = 0; i < TOTAL; i++) {
        this.flasks.push([])
      }

      const all = []

      for (let i = 0; i < this.COLORS.length; i++) {
        for (let j = 0; j < this.MAX_LAYERS; j++) {
          all.push(this.COLORS[i])
        }
      }

      for (let i = all.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const tmp = all[i]
        all[i] = all[j]
        all[j] = tmp
      }

      while (all.length > 0) {
        const index = Math.floor(Math.random() * TOTAL)

        if (this.flasks[index].length < this.MAX_LAYERS) {
          this.flasks[index].push(all.pop())
        }
      }
    }
  }
}
</script>

<style scoped>
</style>