import { ref } from 'vue'

export const useGameOver = () => {
  const gameOver = ref(true)

  const setGameOver = (value) => {
    gameOver.value = value
  }

  const resetGameOver = () => {
    gameOver.value = false
  }

  return [gameOver, setGameOver, resetGameOver]
}