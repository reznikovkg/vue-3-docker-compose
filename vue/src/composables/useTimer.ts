import { ref, onUnmounted } from "vue"
import { SetTimeoutType } from "@/types"

export const useTimer = () => {
  const timers = ref<Set<SetTimeoutType>>(new Set())

  const setSafeTimeout = (callback: () => void, delay: number): any => {
    const timerId = setTimeout(() => {
      callback()
      timers.value.delete(timerId)
    }, delay)

    timers.value.add(timerId)

    return timerId
  }
  const clearAllTimers = (): void => {
    timers.value.forEach((timerId: SetTimeoutType): void => {
      clearTimeout(timerId)
    })

    timers.value.clear()
  }
  const clearTimer = (timerId: SetTimeoutType): void => {
    clearTimeout(timerId)
    timers.value.delete(timerId)
  }

  onUnmounted(() => {
    clearAllTimers()
  })

  return {
    setSafeTimeout,
    clearTimer,
    clearAllTimers
  }
}
