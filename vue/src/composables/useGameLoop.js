import { onUnmounted } from 'vue'
import { useTowerCombat } from './useTowerCombat'

export const useGameLoop = (towers, enemies, shots, selectedEnemyIndex, totalKills) => {
  const { updateTowers } = useTowerCombat(towers, enemies, shots, selectedEnemyIndex, totalKills)

  let intervalId = null

  const startLoop = () => {
    if (intervalId) return
    intervalId = setInterval(() => {
      updateTowers()
    }, 100)
  }

  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  })

  return { startLoop }
}