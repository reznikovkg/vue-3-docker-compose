<template>
  <input
    class="GameController"
    type="text"
    @keydown="onKeyDown"
    @keyup="onKeyUp"
    autofocus
    ref="inputRef"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Action, actionForKey, actionIsDrop } from '../business/Input.js'
import { playerController } from '../business/PlayerController.js'
import { useInterval } from '../composables/useInterval.js'
import { useDropTime } from '../composables/useDropTime.js'

const props = defineProps({
  board: { type: Object, required: true },
  gameStats: { type: Object, required: true },
  player: { type: Object, required: true }
})

const emit = defineEmits(['game-over', 'player-update'])

const inputRef = ref(null)
const [dropTime, pauseDropTime, resumeDropTime] = useDropTime({
  gameStats: props.gameStats
})

// Добавим состояние паузы для отображения
const isPaused = ref(false)

useInterval(() => {
  console.log('Interval tick, dropTime:', dropTime.value, 'isPaused:', isPaused.value)
  if (!isPaused.value) {
    handleInput({ action: Action.SlowDrop })
  }
}, dropTime)

const onKeyUp = (event) => {
  const action = actionForKey(event.code)
  if (actionIsDrop(action)) {
    console.log('Resuming drop time after key up')
    resumeDropTime()
  }
}

const onKeyDown = (event) => {
  const action = actionForKey(event.code)
  console.log('Key pressed:', event.code, 'Action:', action, 'Current dropTime:', dropTime.value)

  if (!action) return

  if (action === Action.Pause) {
    console.log('Pause key pressed, current dropTime:', dropTime.value)
    if (dropTime.value !== null) {
      // Игра идет - ставим на паузу
      pauseDropTime()
      isPaused.value = true
      console.log('Game PAUSED')
    } else {
      // Игра на паузе - продолжаем
      resumeDropTime()
      isPaused.value = false
      console.log('Game RESUMED')
    }
  } else if (action === Action.Quit) {
    console.log('Quit game')
    emit('game-over', true)
  } else if (action === Action.FastDrop) {
    console.log('Fast drop - always works')
    // Для FastDrop временно паузим автоматическое падение
    if (dropTime.value !== null) {
      pauseDropTime()
    }
    handleInput({ action })
  } else {
    // Для остальных действий проверяем, не на паузе ли игра
    if (dropTime.value !== null) {
      console.log('Processing action:', action)
      if (actionIsDrop(action)) {
        // Для SlowDrop паузим автоматическое падение
        pauseDropTime()
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
    board: props.board,
    player: props.player,
    setPlayer: (newPlayer) => {
      console.log('Updating player')
      emit('player-update', newPlayer)
    },
    setGameOver: (gameOver) => {
      console.log('Setting game over:', gameOver)
      emit('game-over', gameOver)
    }
  })
}

onMounted(() => {
  if (inputRef.value) {
    inputRef.value.focus()
  }
})
</script>

<style scoped>
.GameController {
  position: absolute;
  top: -100em;
}
</style>