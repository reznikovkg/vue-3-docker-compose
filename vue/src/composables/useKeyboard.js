import { ref } from 'vue'
import { useEventListener } from '@vueuse/core'

export function useGameKeyboard() {
  const isPressed = ref({ up: false, down: false, left: false, right: false, space: false })

  const handleKeyDown = (e) => {
    if (e.code === 'ArrowUp' || e.code === 'KeyW') isPressed.value.up = true
    if (e.code === 'ArrowDown' || e.code === 'KeyS') isPressed.value.down = true
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') isPressed.value.left = true
    if (e.code === 'ArrowRight' || e.code === 'KeyD') isPressed.value.right = true
    if (e.code === 'Space') {
      isPressed.value.space = true
      e.preventDefault()
    }
  }

  const handleKeyUp = (e) => {
    if (e.code === 'ArrowUp' || e.code === 'KeyW') isPressed.value.up = false
    if (e.code === 'ArrowDown' || e.code === 'KeyS') isPressed.value.down = false
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') isPressed.value.left = false
    if (e.code === 'ArrowRight' || e.code === 'KeyD') isPressed.value.right = false
    if (e.code === 'Space') isPressed.value.space = false
  }

  useEventListener(window, 'keydown', handleKeyDown)
  useEventListener(window, 'keyup', handleKeyUp)

  return isPressed
}

