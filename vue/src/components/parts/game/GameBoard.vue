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
import { GemType } from "@/types"
import { findHorizontalMatches, findVerticalMatches } from "@/services/utils"
import { GEM_COLORS, AVAILABLE_SIZES } from "@/services/constants"

const gridSize = ref(8)
const rows = ref<GemType[][]>([])
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
  const newBoard: GemType[][] = []

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
  const matches: GemType[] = findMatches(rows.value)

  const newRows: GemType[][] = [ ...rows.value ]
  matches.forEach((match: GemType) => {
    newRows[match.row][match.col].flag = true
  })
}
const findMatches = (items: GemType[][]) => {
  const matches: GemType[] = []
  const size = items.length

  const horizontalMatches = findHorizontalMatches(items, size)
  matches.push(...horizontalMatches)

  const verticalMatches = findVerticalMatches(items, size)
  matches.push(...verticalMatches)

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
