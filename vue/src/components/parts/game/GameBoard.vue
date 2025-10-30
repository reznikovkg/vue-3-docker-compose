<template>
  <div class="game-board">
    <div class="game-board__control">
      <div class="select">
        <button @click="() => setBoard()">
          update
        </button>
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
          <div
            class="game-board__col-item"
            :class="{ mark: col.flag }"
            :style="{ background: col.color }"
          >
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
  color: string
  col: number
  flag?: boolean
}

const AVAILABLE_SIZES = [4, 5, 6, 7, 8]
const MAX = 8
const GEM_COLORS = [
  '#FF6B6B', // Красный
  '#4ECDC4', // Бирюзовый
  '#45B7D1', // Голубой
  '#96CEB4', // Зеленый
  '#FFEAA7', // Желтый
  '#DDA0DD', // Сливовый
  '#98D8C8', // Мятный
  '#F7DC6F'  // Светло-желтый
]

const gridSize = ref(8)
const rows = ref<Gem[][]>([])
const nextGemId = ref(1)

const generateGemId = () => nextGemId.value++
const getRandomGemType = () => Math.floor(Math.random() * GEM_COLORS.length) + 1
const createGem = (row: number, col: number) => {
  const type = getRandomGemType()
  return {
    id: generateGemId(),
    type,
    row,
    color: GEM_COLORS[type - 1],
    col,
  }
}
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

  markMatches()
}
const markMatches = () => {
  const matches: Gem[] = findMatches(rows.value)

  const newRows: Gem[][] = [ ...rows.value ]
  matches.forEach((match: Gem) => {
    newRows[match.row][match.col].flag = true
  })
}
const findMatches = (items: Gem[][]) => {
  const matches: Gem[] = []
  const size = items.length

  const horizontalMatches = findHorizontalMatches(items, size)
  matches.push(...horizontalMatches)

  const verticalMatches = findVerticalMatches(items, size)
  matches.push(...verticalMatches)

  return matches
}
const findHorizontalMatches = (items: Gem[][], size: number) => {
  const matches = []

  for (let rowIndex = 0; rowIndex < size; rowIndex++) {
    let count = 1

    for (let colIndex = 1; colIndex < size; colIndex++) {
      if (items[rowIndex][colIndex].type === items[rowIndex][colIndex - 1].type) {
        count++
      } else {
        if (count >= 3) {
          for(let countedIndex = colIndex - count; countedIndex < colIndex; countedIndex++) {
            matches.push(items[rowIndex][countedIndex])
          }
        }
        count = 1
      }
    }

    if (count >= 3) {
      for (let countedIndex = size - count; countedIndex < size; countedIndex++) {
        matches.push(items[rowIndex][countedIndex])
      }
    }
  }

  return matches
}
const findVerticalMatches = (items: Gem[][], size: number) => {
  const matches = []

  for (let cIndex = 0; cIndex < size; cIndex++) {
    let count = 1

    for (let rIndex = 1; rIndex < size; rIndex++) {
      if (items[rIndex][cIndex].type === items[rIndex - 1][cIndex].type) {
        count++
      } else {
        if (count >= 3) {
          for(let countedIndex = rIndex - count; countedIndex < rIndex; countedIndex++) {
            matches.push(items[countedIndex][cIndex])
          }
        }
        count = 1
      }
    }

    if (count >= 3) {
      for (let countedIndex = size - count; countedIndex < size; countedIndex++) {
        matches.push(items[countedIndex][cIndex])
      }
    }
  }

  return matches
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

  &__col-item {
    font-size: 16px;
    padding: 8px;
    border: 1px solid;
  }

  .mark {
    color: white;
    font-weight: 800;
  }
}
</style>
