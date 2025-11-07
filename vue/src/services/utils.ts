import { Gem, GameBoard } from "@/types"

export const findHorizontalMatches = (board: GameBoard) => {
  const matches: Gem[] = []
  const size = board.length

  for (let row = 0; row < size; row++) {
    let count = 1

    for (let col = 1; col < size; col++) {
      if (board[row][col].type === board[row][col - 1].type) {
        count++
      } else {
        if (count >= 3) {
          for(let countedIndex = col - count; countedIndex < col; countedIndex++) {
            matches.push(board[row][countedIndex])
          }
        }
        count = 1
      }
    }

    if (count >= 3) {
      for (let countedIndex = size - count; countedIndex < size; countedIndex++) {
        matches.push(board[row][countedIndex])
      }
    }
  }

  return matches
}

export const findVerticalMatches = (board: GameBoard) => {
  const matches: Gem[] = []
  const size = board.length

  for (let col = 0; col < size; col++) {
    let count = 1

    for (let row = 1; row < size; row++) {
      if (board[row][col].type === board[row - 1][col].type) {
        count++
      } else {
        if (count >= 3) {
          for(let countedIndex = row - count; countedIndex < row; countedIndex++) {
            matches.push(board[countedIndex][col])
          }
        }
        count = 1
      }
    }

    if (count >= 3) {
      for (let countedIndex = size - count; countedIndex < size; countedIndex++) {
        matches.push(board[countedIndex][col])
      }
    }
  }

  return matches
}

export const findMatches = (board: GameBoard) => {
  const horizontalMatches = findHorizontalMatches(board)
  const verticalMatches = findVerticalMatches(board)
  const allMatches = [...horizontalMatches, ...verticalMatches]

  return [...new Set(allMatches)]
}

export const copyBoard = (board: GameBoard): GameBoard => JSON.parse(JSON.stringify(board))
