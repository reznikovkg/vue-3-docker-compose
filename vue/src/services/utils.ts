import { GemType } from "@/types"

export const findHorizontalMatches = (items: GemType[][], size: number) => {
  const matches = []

  for (let rowIndex = 0; rowIndex < size; rowIndex++) {
    let count = 1

    for (let colIndex = 1; colIndex < size; colIndex++) {
      if (items[rowIndex][colIndex].type === items[rowIndex][colIndex - 1].type) {
        count++
      } else {
        if (count >= 3) {
          for(let countedIndex = colIndex - count; countedIndex < colIndex; countedIndex++) {
            const item = {
              ...items[rowIndex][countedIndex],
              row: rowIndex,
            }
            matches.push(item)
          }
        }
        count = 1
      }
    }

    if (count >= 3) {
      for (let countedIndex = size - count; countedIndex < size; countedIndex++) {
        const item = {
          ...items[rowIndex][countedIndex],
          row: rowIndex,
          col: countedIndex,
        }
        matches.push(item)
      }
    }
  }

  return matches
}

export const findVerticalMatches = (items: GemType[][], size: number) => {
  const matches = []

  for (let cIndex = 0; cIndex < size; cIndex++) {
    let count = 1

    for (let rIndex = 1; rIndex < size; rIndex++) {
      if (items[rIndex][cIndex].type === items[rIndex - 1][cIndex].type) {
        count++
      } else {
        if (count >= 3) {
          for(let countedIndex = rIndex - count; countedIndex < rIndex; countedIndex++) {
            const item = {
              ...items[countedIndex][cIndex],
              row: rIndex,
              col: cIndex,
            }
            matches.push(item)
          }
        }
        count = 1
      }
    }

    if (count >= 3) {
      for (let countedIndex = size - count; countedIndex < size; countedIndex++) {
        const item = {
          ...items[countedIndex][cIndex],
          row: countedIndex,
          col: cIndex,
        }
        matches.push(item)
      }
    }
  }

  return matches
}
