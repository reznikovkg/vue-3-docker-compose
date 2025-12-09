<template>
  <input
    class="game-controller"
    type="text"
    @keydown="onKeyDown"
    @keyup="onKeyUp"
    ref="inputRef"
    readonly
    inputmode="none"
    autocomplete="off"
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

const handleInput = ({ action }) => {
  playerController({
    action,
    board: board.value,
    player: player.value,
    setPlayer: (newPlayer) => {
      store.dispatch('player/setPlayer', newPlayer)
    },
    setGameOver: (gameOver) => {
      store.dispatch('game/setGameOver', gameOver)
    }
  })
}

const gameTick = () => {
  handleInput({ action: Action.SlowDrop })
}

const onKeyUp = (event) => {
  const action = actionForKey(event.code)
  if (actionIsDrop(action)) {
    store.dispatch('game/resumeDropTime')
  }
}

const onKeyDown = (event) => {
  const action = actionForKey(event.code)

  if (!action) {
    return
  }

  if (action === Action.Pause) {
    store.dispatch('game/togglePause')
  } else if (action === Action.Quit) {
    store.dispatch('game/setGameOver', true)
  } else if (action === Action.FastDrop) {
    if (dropTime.value !== null) {
      store.dispatch('game/pauseDropTime')
    }
    handleInput({ action })
  } else {
    if (dropTime.value !== null) {
      if (actionIsDrop(action)) {
        store.dispatch('game/pauseDropTime')
      }
      handleInput({ action })
    }
  }
}

// Предотвращаем открытие клавиатуры на мобильных
const preventMobileKeyboard = (e) => {
  if (inputRef.value) {
    inputRef.value.blur() // Убираем фокус
    e.preventDefault()
  }
}

onMounted(() => {
  if (inputRef.value) {
    // Не фокусируем автоматически на мобильных
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    if (!isMobile) {
      inputRef.value.focus()
    }
    
    // Блокируем клавиатуру на тач-устройствах
    inputRef.value.addEventListener('touchstart', preventMobileKeyboard)
    inputRef.value.addEventListener('focus', (e) => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      if (isMobile) {
        e.target.blur()
      }
    })
  }
  
  store.dispatch('game/registerGameTick', gameTick)
  store.dispatch('game/startGameLoop')
})

onUnmounted(() => {
  if (inputRef.value) {
    inputRef.value.removeEventListener('touchstart', preventMobileKeyboard)
  }
  store.dispatch('game/stopGameLoop')
})
</script>

<style scoped>
.game-controller {
  position: absolute;
  top: -100em;
  left: -100em;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
  
  /* Блокируем клавиатуру на мобильных */
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}
</style>