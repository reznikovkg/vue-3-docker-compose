import { onMounted, onUnmounted, watch, ref } from 'vue'

export const useInterval = (callback, delay) => {
  let intervalId = null

  const setupInterval = () => {
    if (intervalId) {
      clearInterval(intervalId)
    }
    
    if (delay.value !== null && delay.value !== undefined) {
      intervalId = setInterval(callback, delay.value)
      console.log('Interval set with delay:', delay.value)
    } else {
      console.log('Interval cleared - delay is null')
    }
  }

  // Следим за изменениями delay
  watch(delay, (newDelay, oldDelay) => {
    console.log('Delay changed from', oldDelay, 'to', newDelay)
    setupInterval()
  }, { immediate: true })

  onMounted(() => {
    setupInterval()
  })

  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId)
      console.log('Interval cleared on unmount')
    }
  })
}