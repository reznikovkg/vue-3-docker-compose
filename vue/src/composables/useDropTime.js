import { ref, watch } from 'vue'

const defaultDropTime = 1000
const minimumDropTime = 100
const speedIncrement = 50

export const useDropTime = ({ gameStats }) => {
  const dropTime = ref(defaultDropTime)
  const previousDropTime = ref(null)

  const resumeDropTime = () => {
    console.log('RESUME: previousDropTime =', previousDropTime.value)
    if (!previousDropTime.value) {
      console.log('No previous drop time to resume')
      return
    }
    dropTime.value = previousDropTime.value
    previousDropTime.value = null
    console.log('Drop time RESUMED to:', dropTime.value)
  }

  const pauseDropTime = () => {
    console.log('PAUSE: current dropTime =', dropTime.value)
    if (dropTime.value) {
      previousDropTime.value = dropTime.value
    }
    dropTime.value = null
    console.log('Drop time PAUSED, previous saved:', previousDropTime.value)
  }

  watch(() => gameStats.level, (newLevel) => {
    console.log('Level changed to:', newLevel)
    const speed = speedIncrement * (newLevel - 1)
    const newDropTime = Math.max(defaultDropTime - speed, minimumDropTime)
    dropTime.value = newDropTime
    console.log('New drop time:', dropTime.value)
  })

  return [dropTime, pauseDropTime, resumeDropTime]
}