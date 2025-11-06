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
            :class="{
              selected: rows[col.row][col.col].selected,
              removing: rows[col.row][col.col].removing,
              'is-new': rows[col.row][col.col].isNew
            }"
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

      setTimeout(() => {
        markMatches()
      }, 300)
    }
  } else {
    selectedGem.value = item
    newRows[item.row][item.col].selected = true
    rows.value = newRows
  }
}
const generateGemId = () => nextGemId.value++
const getRandomGemType = () => Math.floor(Math.random() * GEM_COLORS.length) + 1
const createGem = (row: number, col: number, isNew: boolean = false) => {
  const type = getRandomGemType()
  return {
    id: generateGemId(),
    type: type,
    row,
    color: GEM_COLORS[type - 1],
    col,
    selected: false,
    removing: false,
    isNew,
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

const findAllMatches = () => {
  const matches: GemType[] = findMatches(rows.value)
  const uniqueMatches = [...new Set(matches)]

  return uniqueMatches
}
const markMatches = () => {
  const uniqueMatches = findAllMatches()

  if (uniqueMatches.length) {
    new Promise((resolve) => {
      const rowsWithRemoving: GemType[][] = JSON.parse(JSON.stringify(rows.value))
      uniqueMatches.forEach((match: GemType) => {
        rowsWithRemoving[match.row][match.col].removing = true
      })
      rows.value = rowsWithRemoving

      resolve(rowsWithRemoving)
    })
      .then((rowsWithRemoving: any) => changePosition(rowsWithRemoving))
      .then((rowsAfterRemoving) => {
        const rowsWithNew = markNewGems(rowsAfterRemoving, uniqueMatches.length)
        rows.value = rowsWithNew

        return rowsWithNew
      })
      .then(() => {
        setTimeout(() => {
          const finalRows = JSON.parse(JSON.stringify(rows.value))
          finalRows.forEach((row: GemType[]) => {
            row.forEach((gem: GemType) => {
              gem.isNew = false
            })
          })
          rows.value = finalRows

          console.log('row: ', rows.value)
          // проверяем новые совпадения
          markMatches()
        }, 500)
      })
  }
}
const markNewGems = (items: GemType[][], removedCount: number): GemType[][] => {
  const newItems = JSON.parse(JSON.stringify(items))
  const maxOldId = (nextGemId.value - (removedCount - 1))

  newItems.forEach((row: GemType[]) => {
    row.forEach((gem: GemType) => {
      if (gem.id > maxOldId) {
        gem.isNew = true
      }
    })
  })

  return newItems
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

    const filterCollectedColumns = collectColumns.filter((col) => !col.removing)
    const emptyCount = size - filterCollectedColumns.length
    const newColumns = [
      ...Array.from({ length: emptyCount }, (_, index) => createGem(index, cIndex, true)),
      ...filterCollectedColumns.map((item, index) => ({
        ...item,
        row: index,
        col: cIndex,
        removing: false,
      }))
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
@keyframes removeAnimation {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
}

@keyframes newAnimation {
  0% {
    transform: translateY(-50px);
    opacity: 0;
  }
  70% {
    transform: translateY(5px);
    opacity: 1;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fallAnimation {
  0% {
    transform: translateY(-20px);
    opacity: 0.8;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

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
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &.removing {
      animation: removeAnimation 1s ease-out forwards;
      transform: scale(1.1);
    }

    &.is-new {
      animation: newAnimation 1s ease-out;
    }

    &.selected {
      font-weight: 800;
      border: 2px solid green;
      transform: scale(1.05);
    }
  }
}
</style>
