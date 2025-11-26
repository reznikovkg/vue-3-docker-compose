import { ref } from "vue"
import { GameBoard, Gem, SwapDirections } from "@/types"
import { useGemGenerator, useTimer } from "@/composables"
import { copyBoard, findMatches } from "@/services/utils"

const ANIMATION_DELAY = {
  REMOVING: 300,
  NEW: 500,
  SWAP: 300,
}

const OPPOSITE_SWAP_DIRECTIONS = {
  left: 'right',
  right: 'left',
  up: 'down',
  down: 'up',
}

export const useGameBoard = () => {
  const gridSize = ref(8)
  const selectedGem = ref<Gem | null>(null)
  const swappedGem = ref<Gem | null>(null)
  const gameBoard = ref<GameBoard>([])
  const swappedGems = ref<Gem[]>([])

  const { setSafeTimeout } = useTimer()
  const { nextGemId, createGem, resetGemIds } = useGemGenerator()

  const createGemsBoard = () => {
    resetGemIds()
    const size = gridSize.value
    const board: GameBoard = []

    for (let row = 0; row < size; row++) {
      board[row] = []
      for (let col = 0; col < size; col++) {
        board[row][col] = createGem(row, col)
      }
    }

    return board
  }
  const initializeBoard = () => {
    gameBoard.value = createGemsBoard()
    removeMatchesAndAnimate()
  }
  const removeMatchesAndAnimate = () => {
    const uniqueMatches = findMatches(gameBoard.value)

    if (uniqueMatches.length) {
      new Promise((resolve) => {
        const boardWithRemovingGems: GameBoard = copyBoard(gameBoard.value)
        uniqueMatches.forEach((match: Gem) => {
          boardWithRemovingGems[match.row][match.col].removing = true
        })
        gameBoard.value = clearSwappedDirectionsGems(boardWithRemovingGems)

        setSafeTimeout(() => {
          resolve(boardWithRemovingGems)
        }, ANIMATION_DELAY.REMOVING)
      })
        .then((boardWithRemovingGems: any) => refillEmptyBoardPositions(boardWithRemovingGems))
        .then((boardAfterRemovedGems) => {
          const boardWithNewGems = markNewGems(boardAfterRemovedGems, uniqueMatches.length)
          gameBoard.value = boardWithNewGems

          return boardWithNewGems
        })
        .then(() => {
          checkMatchesGems()
        })
    }
  }
  const checkMatchesGems = () => {
    const finalRows = copyBoard(gameBoard.value)
    setSafeTimeout(() => {
      finalRows.forEach((row: Gem[]) => {
        row.forEach((gem: Gem) => {
          gem.isNew = false
        })
      })
      gameBoard.value = finalRows

      // проверяем новые совпадения
      removeMatchesAndAnimate()
    }, ANIMATION_DELAY.NEW)
  }
  const markNewGems = (items: GameBoard, removedCount: number): GameBoard => {
    const newItems = copyBoard(items)
    const maxOldId = (nextGemId.value - (removedCount - 1))

    newItems.forEach((row: Gem[]) => {
      row.forEach((gem: Gem) => {
        if (gem.id > maxOldId) {
          gem.isNew = true
        }
      })
    })

    return newItems
  }
  const refillEmptyBoardPositions = (items: GameBoard) => {
    const size = items.length
    const newItems: GameBoard = Array.from({ length: size }, () => ([]))

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
  const handleGemSelect = (gem: Gem) => {
    if (selectedGem.value) {
      handleSecondSelection(gem)
    } else {
      selectSingleGem(gem)
    }
  }
  const handleSecondSelection = (secondGem: Gem) => {
    if (!selectedGem.value || (selectedGem.value.id === secondGem?.id)) {
      deselectGem(secondGem)
      return
    }

    if (areNeighboringGems(selectedGem.value, secondGem)) {
      attemptGemSwap(selectedGem.value, secondGem)
    } else {
      deselectGem(selectedGem.value)
      selectSingleGem(secondGem)
    }
  }
  const areNeighboringGems = (firstGem: Gem, secondGem: Gem) => {
    const rowDiff = Math.abs(firstGem.row - secondGem.row)
    const colDiff = Math.abs(firstGem.col - secondGem.col)

    return ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1))
  }
  const selectSingleGem = (gem: Gem) => {
    const updatedBoard = markNewGems(gameBoard.value, 0)
    updatedBoard[gem.row][gem.col].selected = true
    gameBoard.value = updatedBoard
    selectedGem.value = gem
  }
  const attemptGemSwap = (firstGem: Gem, secondGem: Gem) => {
    const visualChangedBoard = visualSwapGems(firstGem, secondGem)
    gameBoard.value = visualChangedBoard

    setSafeTimeout(() => {
      const boardAfterSwap = swapGems(visualChangedBoard, firstGem, secondGem)
      // gameBoard.value = boardAfterSwap
      const matches = findMatches(boardAfterSwap)

      if (matches.length > 0) {
        gameBoard.value = clearSwappedDirectionsGems(boardAfterSwap)
        checkMatchesGems()
      } else {
        const finalRows = swapGems(boardAfterSwap, secondGem, firstGem)
        gameBoard.value = clearSwappedDirectionsGems(finalRows)
      }

      swappedGem.value = null
      selectedGem.value = null
    }, ANIMATION_DELAY.SWAP)
  }
  const deselectGem = (gem: Gem): void => {
    const updatedBoard = markNewGems(gameBoard.value, 0)
    updatedBoard[gem.row][gem.col].selected = false
    gameBoard.value = updatedBoard
    selectedGem.value = null
  }
  const swapGems = (board: GameBoard, firstGem: Gem, secondGem: Gem): GameBoard => {
    const newBoard = copyBoard(board)
    const temp = { ...newBoard[firstGem.row][firstGem.col] }

    newBoard[firstGem.row][firstGem.col] = {
      ...newBoard[secondGem.row][secondGem.col],
      row: firstGem.row,
      col: firstGem.col,
    }

    newBoard[secondGem.row][secondGem.col] = {
      ...temp,
      row: secondGem.row,
      col: secondGem.col,
      selected: false,
    }

    return newBoard
  }
  const handleSizeChange = (newSize: number) => {
    gridSize.value = newSize

    initializeBoard()
  }

  const getSwapDirection = (firstGem: Gem, secondGem: Gem): SwapDirections => {
    const rowDiff = firstGem.row - secondGem.row
    const colDiff = firstGem.col - secondGem.col

    if (rowDiff === 0 && colDiff === 1) {
      return 'right'
    }
    if (rowDiff === 0 && colDiff === -1) {
      return 'left'
    }
    if (rowDiff === 1 && colDiff === 0) {
      return 'down'
    }
    if (rowDiff === -1 && colDiff === 0) {
      return 'up'
    }

    return 'none'
  }
  const handleMousedownGem = (gem: Gem) => {
    swappedGem.value = gem
  }
  const handleMousemoveGem = (gem: Gem) => {
    const currentSwappedGem = swappedGem.value
    if (!currentSwappedGem || (gem.id === currentSwappedGem.id || !areNeighboringGems(currentSwappedGem, gem))) {
      return
    }

    attemptGemSwap(currentSwappedGem, gem)
  }
  const visualSwapGems = (firstGem: Gem, secondGem: Gem) => {
    const swapDirection = getSwapDirection(firstGem, secondGem)
    const oppositeDirection = OPPOSITE_SWAP_DIRECTIONS[swapDirection]
    const swappedBoard = copyBoard(gameBoard.value)

    swappedBoard[firstGem.row][firstGem.col].swapDirection = oppositeDirection
    swappedBoard[secondGem.row][secondGem.col].swapDirection = swapDirection

    swappedGems.value.push(swappedBoard[firstGem.row][firstGem.col])
    swappedGems.value.push(swappedBoard[secondGem.row][secondGem.col])

    return swappedBoard
  }
  const clearSwappedDirectionsGems = (board?: GameBoard) => {
    const newBoard = board || copyBoard(gameBoard.value)

    swappedGems.value.forEach((i) => {
      newBoard[i.row][i.col].swapDirection = 'none'
    })

    swappedGems.value = []

    return newBoard
  }
  const handleMouseupGem = () => {
    swappedGem.value = null
  }

  return {
    gridSize,
    gameBoard,

    handleGemSelect,
    initializeBoard,
    handleSizeChange,
    handleMousedownGem,
    handleMousemoveGem,
    handleMouseupGem,
  }
}
