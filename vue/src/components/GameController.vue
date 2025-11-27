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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { Action, actionForKey, actionIsDrop } from '../business/Input.js'
import { playerController } from '../business/PlayerController.js'

const store = useStore()
const inputRef = ref(null)

const board = computed(() => store.getters['board/board'])
const player = computed(() => store.getters['player/player'])
const dropTime = computed(() => store.getters['game/dropTime'])
const isPaused = computed(() => store.getters['game/isPaused'])

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

// Функция игрового тика
const gameTick = () => {
  handleInput({ action: Action.SlowDrop })
}

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
    if (dropTime.value !== null) {
      store.dispatch('game/pauseDropTime')
    }
    handleInput({ action })
  } else {
    if (dropTime.value !== null) {
      console.log('Processing action:', action)
      if (actionIsDrop(action)) {
        store.dispatch('game/pauseDropTime')
      }
      handleInput({ action })
    } else {
      console.log('Game is PAUSED - ignoring action:', action)
    }
  }
}

onMounted(() => {
  if (inputRef.value) {
    inputRef.value.focus()
  }
  
  // Регистрируем callback и запускаем игровой цикл
  store.dispatch('game/registerGameTick', gameTick)
  store.dispatch('game/startGameLoop')
})

onUnmounted(() => {
  // Останавливаем игровой цикл при размонтировании
  store.dispatch('game/stopGameLoop')
})
</script>

<style scoped>
.game-controller {
  position: absolute;
  top: -100em;
}
</style>