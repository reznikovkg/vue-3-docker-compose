<template>
  <div
    class="character"
    :class="{ 'character--run': playerTransform.isRun, 'character--left': playerTransform.toLeft }"
  >
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue"
import { useStore } from "vuex"
const store = useStore()
const playerTransform = computed(() => store.getters.getPlayerTransform)
const MOVE_SPEED = 5
const MOVE_INTERVAL = 16 // ~60fps

const isRunning = ref(false)
const isFacingLeft = ref(false)
const moveInterval = ref<number | null>(null)

const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  ArrowDown: false,
}

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key in keys) {
    keys[e.key as keyof typeof keys] = true
    startMovement()
  }
}

const onKeyUp = (e: KeyboardEvent) => {
  if (e.key in keys) {
    keys[e.key as keyof typeof keys] = false
    if (
      !keys.ArrowLeft
      && !keys.ArrowRight
      && !keys.ArrowUp
      && !keys.ArrowDown
    ) {
      stopMovement()
    } else {
      updateDirection()
    }
  }
}

const startMovement = () => {
  if (!moveInterval.value) {
    updateDirection()
    moveInterval.value = window.setInterval(moveCharacter, MOVE_INTERVAL)
  } else {
    updateDirection()
  }
}

const stopMovement = () => {
  if (moveInterval.value) {
    clearInterval(moveInterval.value)
    moveInterval.value = null
  }
  isRunning.value = false
  updateStore()
}

const updateDirection = () => {
  isRunning.value = keys.ArrowLeft || keys.ArrowRight
  isFacingLeft.value = keys.ArrowLeft
}

const moveCharacter = () => {
  let payload = { x: 0, y: 0 }
  if (keys.ArrowLeft) {
    payload = { x: -MOVE_SPEED, y: 0 }
  } else if (keys.ArrowRight) {
    payload = { x: MOVE_SPEED, y: 0 }
  } else if (keys.ArrowUp) {
    payload = { x: 0, y: -MOVE_SPEED }
  } else if (keys.ArrowDown) {
    payload = { x: 0, y: MOVE_SPEED }
  } else {
    return
  }
  store.dispatch('movePlayer', payload)
}

const updateStore = () => {
  store.dispatch('updatePlayerState', {
    isRun: isRunning.value,
    toLeft: isFacingLeft.value
  })
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  stopMovement()
})
</script>

<style scoped lang="less">
.character {
  pointer-events: none;
  width: 100px;
  height: 150px;
  transform: translate(-50%, -90%);
  background-repeat: no-repeat;
  background-image: url("@/assets/character/idle.png");
  background-size: contain;
  &--run {
    width: 100px;
    height: 150px;
    background-repeat: no-repeat;
    animation: run 1s steps(1) infinite;
    background-size: contain;
  }
  &--left {
    transform: scaleX(-1) translate(50%, -90%);
  }
}
@keyframes run {
  0%   { background-image: url("@/assets/character/1.png"); }
  25%  { background-image: url("@/assets/character/2.png"); }
  50%  { background-image: url("@/assets/character/3.png"); }
  75% { background-image: url("@/assets/character/4.png"); }
}
</style>
