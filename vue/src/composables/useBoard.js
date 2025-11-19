import { ref, watch } from 'vue'
import { buildBoard, nextBoard } from '../business/Board.js'

export const useBoard = ({
  rows,
  columns,
  player,
  resetPlayer,
  addLinesCleared
}) => {
  const board = ref(buildBoard({ rows, columns }))

  watch(() => player.value, (newPlayer) => {
    const safeAddLinesCleared = (lines) => {
      if (lines > 0) {
        addLinesCleared(lines)
      }
    }

    board.value = nextBoard({
      board: board.value,
      player: newPlayer,
      resetPlayer,
      addLinesCleared: safeAddLinesCleared
    })
  }, { deep: true, immediate: true })

  return { board }
}