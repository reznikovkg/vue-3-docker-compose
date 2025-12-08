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

onMounted(() => {
  if (inputRef.value) {
    inputRef.value.focus()
  }
  
  store.dispatch('game/registerGameTick', gameTick)
  store.dispatch('game/startGameLoop')
})

onUnmounted(() => {
  store.dispatch('game/stopGameLoop')
})
</script>

<style scoped>
.game-controller {
  position: absolute;
  top: -100em;
}
</style>