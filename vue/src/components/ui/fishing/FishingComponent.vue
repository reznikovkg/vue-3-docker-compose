<template>
  <Bobber v-if="!showRodCursor" :position="currentBobberPosition" />
  <FishingArea v-if="showRodCursor" :onClick="(event) => onClick(event)" />

  <ResultModal
    :isOpen="showResultModal"
    :message="resultMessage"
    :onClose="() => closeResultModal()"
  />

  <div class="fishing-container">
    <ProgressBar
      :show="showProgressBar"
      :style="progressBarStyle"
      type="progress"
    />
    <ProgressBar
      :show="showProgressBar"
      :style="tensionBarStyle"
      type="tension"
    />

    <button
      :class="['fishing-button', buttonClass]"
      @mousedown="() => toggleHold(true)"
      @mouseup="() => toggleHold(false)"
      @mouseleave="() => toggleHold(false)"
    >
      {{ buttonText }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

import ResultModal from './ResultModal.vue'
import FishingArea from './FishingArea.vue'
import ProgressBar from './ProgressBar.vue'
import Bobber from './Bobber.vue'

const state = ref('ready')
const isHolding = ref(false)
const progress = ref(0)
const tension = ref(0)
const showResultModal = ref(false)
const resultMessage = ref('')
const bobberPosition = ref({ x: 0, y: 0 })

let holdInterval = null
let processingTimeout = null

const showProgressBar = computed(() => state.value === 'hold')
const showRodCursor = computed(() => state.value === 'ready')

const buttonText = computed(() => {
  if (state.value === 'ready') {
    return 'Закиньте удочку'
  }

  if (state.value === 'processing') {
    return 'В процессе...'
  }

  return 'Удерживайте'
})

const buttonClass = computed(() => {
  if (state.value === 'ready') {
    return 'fishing-button--ready'
  }

  if (state.value === 'processing') {
    return 'fishing-button--processing'
  }

  if (isHolding.value) {
    return 'fishing-button--hold-active'
  }

  return 'fishing-button--hold'
})

const progressBarStyle = computed(() => ({
  width: `${progress.value}%`,
  background: '#00d000',
}))

const tensionBarStyle = computed(() => ({
  width: `${tension.value}%`,
  background: '#c9c900',
}))

const currentBobberPosition = computed(() => {
  const bottomOffset = 180
  const targetX = window.innerWidth / 2
  const targetY = window.innerHeight - bottomOffset
  const percent = progress.value / 100

  const currentX =
    bobberPosition.value.x + (targetX - bobberPosition.value.x) * percent
  const currentY =
    bobberPosition.value.y + (targetY - bobberPosition.value.y) * percent

  return { x: currentX, y: currentY }
})

const closeResultModal = () => {
  showResultModal.value = false
}

const finishFishing = () => {
  clearInterval(holdInterval)
  state.value = 'ready'
  isHolding.value = false
  progress.value = 0
  tension.value = 0
  bobberPosition.value = { x: 0, y: 0 }
  showResultModal.value = true
}

const toggleHold = (value) => {
  if (state.value === 'hold') {
    isHolding.value = value
  }
}

const startFishing = () => {
  const gameSpeed = 40
  const loseThresholdTime = 1000
  const progressIncreaseMultiplier = 1
  const progressDecreaseMultiplier = 1
  const tensionIncreaseMultiplier = 1.4
  const tensionDecreaseMultiplier = 2

  clearInterval(holdInterval)
  state.value = 'hold'

  let canLose = false
  const loseThreshold = setTimeout(() => {
    canLose = true
  }, loseThresholdTime)

  holdInterval = setInterval(() => {
    if (state.value !== 'hold') {
      return
    }

    if (isHolding.value) {
      canLose = true
      clearTimeout(loseThreshold)

      progress.value = Math.min(
        progress.value + progressIncreaseMultiplier,
        100,
      )
      tension.value = Math.min(tension.value + tensionIncreaseMultiplier, 100)
    } else if (canLose) {
      progress.value = Math.max(progress.value - progressDecreaseMultiplier, 0)
      tension.value = Math.max(tension.value - tensionDecreaseMultiplier, 0)
    }

    if (tension.value >= 100) {
      resultMessage.value = 'Леска порвалась!'
      finishFishing()
    } else if (progress.value >= 100) {
      resultMessage.value = 'Рыба поймана!'
      finishFishing()
    } else if (progress.value <= 0 && canLose) {
      resultMessage.value = 'Рыба сорвалась!'
      finishFishing()
    }
  }, gameSpeed)
}

const throwRod = () => {
  state.value = 'processing'

  const minDelay = 3000
  const maxDelay = 5000
  const delay = minDelay + Math.random() * (maxDelay - minDelay)

  processingTimeout = setTimeout(() => {
    startFishing()
  }, delay)
}

const onClick = (event) => {
  if (state.value !== 'ready') {
    return
  }

  bobberPosition.value = {
    x: event.clientX,
    y: event.clientY,
  }

  throwRod()
}
</script>

<style scoped lang="scss">
.fishing-container {
  margin-bottom: 48px;
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);

  .fishing-button {
    padding: 8px 16px;
    font-size: 24px;
    border-radius: 8px;
    background: #008bd1;
    user-select: none;
    transition: background-color 0.2s ease;

    &--processing {
      background: #00b8c2;
    }

    &--hold {
      background: #a20000;
      cursor: grab;
    }

    &--hold-active {
      background: #00b400;
      cursor: grabbing;
    }
  }
}
</style>
