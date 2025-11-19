import { ref } from 'vue'

const buildGameStats = () => ({
  level: 1,
  linesCompleted: 0,
  linesPerLevel: 10,
  points: 0,
})

const getScoreForLines = (lines) => {
  switch (lines) {
    case 1: return 100
    case 2: return 300
    case 3: return 500
    case 4: return 800
    default: return 0
  }
}

export const useGameStats = () => {
  const gameStats = ref(buildGameStats())

  const addLinesCleared = (lines) => {
    console.log(`Cleared ${lines} lines, score: ${getScoreForLines(lines)}`)
    
    const linesScore = getScoreForLines(lines)
    const points = gameStats.value.points + linesScore
    
    const { linesPerLevel } = gameStats.value
    const newLinesCompleted = gameStats.value.linesCompleted + lines
    const level = newLinesCompleted >= linesPerLevel 
      ? gameStats.value.level + 1 
      : gameStats.value.level
    const linesCompleted = newLinesCompleted % linesPerLevel

    gameStats.value = {
      level,
      linesCompleted,
      linesPerLevel,
      points,
    }
  }

  return { gameStats, addLinesCleared }
}