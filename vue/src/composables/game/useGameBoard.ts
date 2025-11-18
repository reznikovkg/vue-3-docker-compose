import { ref } from "vue"
import { GameBoard, Gem, DragDirections } from "@/types"
import { useGemGenerator, useTimer } from "@/composables"
import { copyBoard, findMatches } from "@/services/utils"

const ANIMATION_DELAY = {
  REMOVING: 300,
  NEW: 500,
  SWAP: 300,
}

const OPPOSITE_DIRECTIONS = {
  left: 'right',
  right: 'left',
  up: 'down',
  down: 'up',
}

export const useGameBoard = () => {
  const gridSize = ref(8)
  const selectedGem = ref<Gem | null>(null)
  const draggedGem = ref<Gem | null>(null)
  const gameBoard = ref<GameBoard>([])

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
        gameBoard.value = boardWithRemovingGems

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
    if (!selectedGem.value) {
      return
    }

    if (selectedGem.value.id === secondGem?.id) {
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
    const boardAfterSwap = swapGems(gameBoard.value, firstGem, secondGem)
    gameBoard.value = boardAfterSwap

    const matches = findMatches(boardAfterSwap)

    setSafeTimeout(() => {
      if (matches.length > 0) {
        checkMatchesGems()
      } else {
        // Откатываем swap если нет совпадений
        const boardAfterRevert = swapGems(boardAfterSwap, secondGem, firstGem)
        gameBoard.value = boardAfterRevert
      }
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
    const temp = newBoard[firstGem.row][firstGem.col]

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

  const getDragDirection = (firstDragGem: Gem, secondDragGem: Gem): DragDirections => {
    const rowDiff = firstDragGem.row - secondDragGem.row
    const colDiff = firstDragGem.col - secondDragGem.col

    if (rowDiff === 0 && colDiff === 1) {
      return 'left'
    }
    if (rowDiff === 0 && colDiff === -1) {
      return 'right'
    }
    if (rowDiff === 1 && colDiff === 0) {
      return 'up'
    }
    if (rowDiff === -1 && colDiff === 0) {
      return 'down'
    }

    return 'none'
  }

  const resetDragDirections = (board: GameBoard, exceptGem: Gem): GameBoard => {
    if (draggedGem.value) {
      const neighboringGems = [
        board[draggedGem.value.row - 1][draggedGem.value.col],
        board[draggedGem.value.row + 1][draggedGem.value.col],
        board[draggedGem.value.row][draggedGem.value.col - 1],
        board[draggedGem.value.row][draggedGem.value.col + 1],
      ]
      neighboringGems.forEach((item) => {
        if (item.id !== exceptGem.id) {
          board[item.row][item.col].dragDirection = 'none'
        }
      })
    }

    return board
  }

  const handleGemDrag = (dropGem: Gem) => {
    if (!draggedGem.value) {
      return
    }

    const newBoard = copyBoard(gameBoard.value)

    if (areNeighboringGems(draggedGem.value, dropGem)) {
      newBoard[dropGem.row][dropGem.col] = {
        ...newBoard[dropGem.row][dropGem.col],
        dragDirection: getDragDirection(draggedGem.value, dropGem)
      }
    }
    gameBoard.value = resetDragDirections(newBoard, dropGem)
  }

  const handleGemDrop = (targetGem: Gem) => {
    if (!draggedGem.value) {
      return
    }

    handleDragAndDrop(draggedGem.value, targetGem)
    draggedGem.value = null
  }

  const handleDragAndDrop = (draggedGem: Gem, targetGem: Gem) => {
    if (areNeighboringGems(draggedGem, targetGem)) {
      attemptGemSwap(draggedGem, targetGem)
    }
  }

  const handleGemDragleave = (dragLeft: Gem) => {
    // if (draggedGem.value && areNeighboringGems(draggedGem.value, dragLeft)) {
    //   const newBoard = copyBoard(gameBoard.value)
    //   newBoard[dragLeft.row][dragLeft.col] = {
    //     ...newBoard[dragLeft.row][dragLeft.col],
    //     dragDirection: 'none'
    //   }
    //   gameBoard.value = newBoard
    // }
  }

  const handleMousedownGem = (gem: Gem) => {
    draggedGem.value = gem
    console.log('handleMousedownGem: ', gem)
  }
  const handleMousemoveGem = (gem: Gem) => {

    if (draggedGem.value === null) {
      return
    }

    if (gem.id === draggedGem.value.id || !areNeighboringGems(draggedGem.value, gem)) {
      return
    }

    const newBoard = copyBoard(gameBoard.value)
    console.log('handleMousemoveGem: ', gem)

    if (areNeighboringGems(draggedGem.value, gem)) {
      newBoard[gem.row][gem.col] = {
        ...newBoard[gem.row][gem.col],
        dragDirection: getDragDirection(draggedGem.value, gem)
      }
      newBoard[draggedGem.value.row][draggedGem.value.col] = {
        ...newBoard[draggedGem.value.row][draggedGem.value.col],
        dragDirection: OPPOSITE_DIRECTIONS[getDragDirection(draggedGem.value, gem)]
      }
    }
    gameBoard.value = resetDragDirections(newBoard, gem)
    // gameBoard.value = resetDragDirections(newBoard, gem)
  }
  const handleMouseupGem = (gem: Gem) => {
    console.log('handleMouseupGem: ', gem)
    draggedGem.value = null
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
