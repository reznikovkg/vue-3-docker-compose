<template>
  <div class="game-board">
    <div class="game-board__control">
      <div class="select">
        <label for="grid-size" class="select__label">
          Размер сетки:
        </label>
        <select
          v-model="gridSize"
          class="select__field"
          @change="() => setBoard()"
        >
          <option
            v-for="size in AVAILABLE_SIZES"
            :key="size"
            :value="size"
            class="select__option"
          >
            {{ size }} x {{ size }}
          </option>
        </select>
      </div>
    </div>
    <div class="game-board__grid">
      <div
        v-for="(cols, rowIndex) in rows"
        :key="rowIndex"
        class="game-board__row"
      >
        <div
          v-for="col in cols"
          :key="col.id"
          class="game-board__col"
        >
          <div class="game-board__col-item">
            {{ col.type }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"

interface Gem {
  id: number
  type: number
  row: number
  col: number
}

const AVAILABLE_SIZES = [4, 5, 6, 7, 8]
const MAX = 8

const gridSize = ref(8)
const rows = ref<Gem[][]>([])
const nextGemId = ref(1)

const generateGemId = () => nextGemId.value++
const getRandomGemType = () => Math.floor(Math.random() * MAX) + 1
const createGem = (row: number, col: number) => ({
  id: generateGemId(),
  type: getRandomGemType(),
  row,
  col
})
const setBoard = () => {
  const size = gridSize.value
  const newBoard: Gem[][] = []

  nextGemId.value = 1

  for (let row = 0; row < size; row++) {
    newBoard[row] = []
    for (let col = 0; col < size; col++) {
      newBoard[row][col] = createGem(row, col)
    }
  }

  rows.value = newBoard
}

onMounted(() => {
  setBoard()
})
</script>

<style lang="scss" scoped>
.game-board {
  &__row {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }

  &__col {
    font-size: 16px;
    padding: 8px;
    border: 1px solid;
  }
}
</style>
