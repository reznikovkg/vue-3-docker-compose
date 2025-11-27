<template>
  <input
    class="game-controller"
    type="text"
    @keydown="onKeyDown"
    @keyup="onKeyUp"
    autofocus
    ref="inputRef"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useStore } from 'vuex'
import { Action, actionForKey, actionIsDrop } from '../business/Input.js'
import { playerController } from '../business/PlayerController.js'

const store = useStore()
const inputRef = ref(null)

const board = computed(() => store.getters['board/board'])
const player = computed(() => store.getters['player/player'])
const dropTime = computed(() => store.getters['game/dropTime'])
const isPaused = computed(() => store.getters['game/isPaused'])

let intervalId = null

// Устанавливаем интервал для автоматического падения
const setupInterval = () => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
  
  if (dropTime.value !== null && dropTime.value !== undefined) {
    intervalId = setInterval(() => {
      if (!isPaused.value) {
        handleInput({ action: Action.SlowDrop })
      }
    }, dropTime.value)
    console.log('Interval set with delay:', dropTime.value)
  } else {
    console.log('Interval cleared - dropTime is null')
  }
}

// Следим за изменениями dropTime
watch(dropTime, (newDelay, oldDelay) => {
  console.log('DropTime changed from', oldDelay, 'to', newDelay)
  setupInterval()
}, { immediate: true })

const onKeyUp = (event) => {
  const action = actionForKey(event.code)
  if (actionIsDrop(action)) {
    console.log('Resuming drop time after key up')
    store.dispatch('game/resumeDropTime')
  }
}

const onKeyDown = (event) => {
  const action = actionForKey(event.code)
  console.log('Key pressed:', event.code, 'Action:', action)

  if (!action) return

  if (action === Action.Pause) {
    console.log('Pause key pressed')
    store.dispatch('game/togglePause')
  } else if (action === Action.Quit) {
    console.log('Quit game')
    store.dispatch('game/setGameOver', true)
  } else if (action === Action.FastDrop) {
    console.log('Fast drop - always works')
    // Для FastDrop временно паузим автоматическое падение
    if (dropTime.value !== null) {
      store.dispatch('game/pauseDropTime')
    }
    handleInput({ action })
  } else {
    // Для остальных действий проверяем, не на паузе ли игра
    if (dropTime.value !== null) {
      console.log('Processing action:', action)
      if (actionIsDrop(action)) {
        // Для SlowDrop паузим автоматическое падение
        store.dispatch('game/pauseDropTime')
      }
      handleInput({ action })
    } else {
      console.log('Game is PAUSED - ignoring action:', action)
    }
  }
}

const handleInput = ({ action }) => {
  console.log('Handling input:', action)
  playerController({
    action,
    board: board.value,
    player: player.value,
    setPlayer: (newPlayer) => {
      console.log('Updating player via store')
      store.dispatch('player/setPlayer', newPlayer)
    },
    setGameOver: (gameOver) => {
      console.log('Setting game over:', gameOver)
      store.dispatch('game/setGameOver', gameOver)
    }
  })
}

onMounted(() => {
  if (inputRef.value) {
    inputRef.value.focus()
  }
  setupInterval()
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
    console.log('Interval cleared on unmount')
  }
})
</script>

<style scoped>
.game-controller {
  position: absolute;
  top: -100em;
}
</style>