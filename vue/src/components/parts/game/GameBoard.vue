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
          v-for="col in rows[rowIndex]"
          :key="rows[col.row][col.col].id"
          class="game-board__col"
        >
          <div
            class="game-board__col-item"
            :class="{ mark: rows[col.row][col.col].flag, selected: rows[col.row][col.col].selected }"
            :style="{ background: rows[col.row][col.col].color }"
            @click="() => handleClick(rows[col.row][col.col])"
          >
            {{ rows[col.row][col.col].type }}
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
const selectedGem = ref<GemType | null>(null)

const handleClick = (item: GemType) => {
  const newRows: GemType[][] = JSON.parse(JSON.stringify(rows.value))

  if (selectedGem.value) {
    if (selectedGem.value.id === item.id) {
      newRows[item.row][item.col].selected = false
      rows.value = newRows
      selectedGem.value = null
      return
    }

    const nextOrPrevCol = Math.abs(selectedGem.value.col - item.col)
    const nextOrPrevRow = Math.abs(selectedGem.value.row - item.row)
    if ((nextOrPrevCol === 0 && nextOrPrevRow === 1) || (nextOrPrevCol === 1 && nextOrPrevRow === 0)) {
      const temp = newRows[selectedGem.value.row][selectedGem.value.col]
      newRows[selectedGem.value.row][selectedGem.value.col] = {
        ...item,
        row: selectedGem.value.row,
        col: selectedGem.value.col,
      }
      newRows[item.row][item.col] = {
        ...temp,
        row: item.row,
        col: item.col,
        selected: false
      }
      rows.value = newRows
      selectedGem.value = null
    }
  } else {
    selectedGem.value = item
    newRows[item.row][item.col].selected = true
    rows.value = newRows
  }

  markMatches()
}
const generateGemId = () => nextGemId.value++
const getRandomGemType = () => Math.floor(Math.random() * GEM_COLORS.length) + 1
const createGem = (row: number, col: number, defaultType?: string) => {
  const type = getRandomGemType()
  return {
    id: generateGemId(),
    type: defaultType || type,
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
  const uniqueMatches = [...new Set(matches)]

  const newRows: GemType[][] = JSON.parse(JSON.stringify(rows.value))
  uniqueMatches.forEach((match: GemType) => {
    newRows[match.row][match.col].flag = true
  })

  rows.value = changePosition(newRows)
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
const changePosition = (items: GemType[][]) => {
  const size = items.length
  const newItems: GemType[][] = Array.from({ length: size }, () => ([]))

  for (let cIndex = 0; cIndex < size; cIndex++) {
    const collectColumns = []

    for (let rIndex = 0; rIndex < size; rIndex++) {
      collectColumns.push(items[rIndex][cIndex])
    }

    const filterCollectedColumns = collectColumns.filter((col) => !col.flag)
    const emptyCount = size - filterCollectedColumns.length
    const newColumns = [
      ...Array.from({ length: emptyCount }, (_, index) => createGem(index, cIndex)),
      ...filterCollectedColumns.map((item, index) => ({ ...item, row: index, col: cIndex }))
    ]

    for (let rIndex = 0; rIndex < size; rIndex++) {
      newItems[rIndex][cIndex] = {
        ...newColumns[rIndex],
        row: rIndex,
        col: cIndex,
      }
    }
  }

  return newItems
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

  .selected {
    font-weight: 800;
    border: 2px solid green;
  }
}
</style>
