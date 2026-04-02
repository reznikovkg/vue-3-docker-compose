<template>
  <div class="game-board">
    <div class="game-board--score">Счет: {{score}}</div>
    <div class="game-board--grid">
      <div v-for="(row, y) in grid" :key="y" class="game-board--row">
        <Cell
          v-for="(cell, x) in row"
          :key="x"
          :item="cell"
          :x="x"
          :y="y"

          @drop="onDrop"
          @drag-start="onDragStart"
          />
      </div>
    </div>
    <button class="game-board--btn" @click="spawn">Добавить</button>
    <button class="game-board--btn" @click="restart">Перезапустить</button>
  </div>
</template>
<script>
import Cell from "@/components/ui/Cell.vue"
export default {
  name: "GameBoard",
  components: {Cell},
  data() {
    return {
      dragged: null
    }
  },
  computed: {
    grid() {
      return this.$store.getters["game/getGrid"]
    },
    score() {
      return this.$store.getters["game/getScore"]
    },
    size() {
      return this.$store.getters["game/getSize"]
    }
  },
  mounted() {
    this.$store.dispatch('game/initGame')
    this.spawnStart()
  },
  methods: {
    createItem(level = 1) {
      return {
        id: Date.now() + Math.random(),
        level
      }
    },

    getEmptyCells() {
      const res = []

      this.grid.forEach((row, y) => {
        row.forEach((cell, x) => {
          if(!cell) res.push({x, y})
        })
      })
      return res
    },

    spawn() {
      const empty = this.getEmptyCells()
      if (empty.length === 0) return
      const position = empty[Math.floor(Math.random() * empty.length)]
      if (!position || position.y === undefined || position.x === undefined) return
      this.grid[position.y][position.x] = this.createItem()
      this.commit()
    },
    restart() {
      for(let i = 0; i < this.size; i++) {
        for (let j = 0; j < this.size; j++) {
          this.grid[i][j] = null
        }
      }
      this.spawnStart()
      this.$store.commit("game/SET_SCORE", 0)
    },

    spawnStart() {
      for(let i = 0; i < 4;i++) {
        this.spawn()
      }
    },

    onDragStart(position) {
      this.dragged = position
    },
    onDrop(positionTo) {
      if(!this.dragged) return
      const positionFrom = this.dragged
      const source = this.grid[positionFrom.y][positionFrom.x]
      const dest = this.grid[positionTo.y][positionTo.x]
      if(!source) return
      let moved = false
      if(!dest) {
        this.grid[positionTo.y][positionTo.x] = source
        this.grid[positionFrom.y][positionFrom.x] = null
        moved = true
      }
      else if(dest.level === source.level && dest.level < 4) {
        this.addScore(dest.level)
        dest.level += 1
        this.grid[positionFrom.y][positionFrom.x] = null
        moved = true
      }
      else
      {
        this.grid[positionTo.y][positionTo.x] = source
        moved = true
      }

      this.dragged = null

      if(moved) {
        this.commit()
      }
    },

    addScore(level) {
      this.$store.commit("game/SET_SCORE", this.score + level * 10)
    },

    commit() {
      this.$store.commit('game/SET_GRID', [...this.grid])
      this.$store.dispatch('game/saveGame')
    }
  }
}
</script>
<style scoped lang="scss">
.game-board {
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: white;

  &--score {
    font-size: 20px;
  }

  &--grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: #0f172a;
    padding: 12px;
    border-radius: 12px;
  }

  &--row {
    display: flex;
    gap: 10px;
  }

  &--btn {
    padding: 8px;
    border-radius: 6px;
    background: #22c55e;
    color: white;
    border: none;
    cursor: pointer;
  }
}
</style>