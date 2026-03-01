import { updateTowers } from './useTowerCombat'

export const createGameLoop = (ctx) => {
  let intervalId = null

  const startLoop = () => {
    if (intervalId) 
      return
    intervalId = setInterval(() => {
      updateTowers(ctx)
    }, 100)
  }

  const stopLoop = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  return { startLoop, stopLoop }
}