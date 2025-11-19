import { ref } from 'vue'
import { randomTetromino } from '../business/Tetrominoes.js'

const buildPlayer = (previous) => {
  let tetrominoes

  if (previous) {
    tetrominoes = [...previous.tetrominoes]
    tetrominoes.unshift(randomTetromino())
  } else {
    tetrominoes = Array(5)
      .fill(0)
      .map((_) => randomTetromino())
  }

  return {
    collided: false,
    isFastDropping: false,
    position: { row: 0, column: 4 },
    tetrominoes,
    tetromino: tetrominoes.pop(),
  }
}

export const usePlayer = () => {
  const player = ref(buildPlayer())

  const setPlayer = (newPlayer) => {
    player.value = newPlayer
  }

  const resetPlayer = () => {
    player.value = buildPlayer(player.value)
  }

  return { player, setPlayer, resetPlayer }
}