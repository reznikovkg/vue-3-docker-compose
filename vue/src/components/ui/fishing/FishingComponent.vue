<template>
  <FishingArea :showRodCursor="showRodCursor" :onClick="() => onClick()" />
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

const state = ref('ready')
const isHolding = ref(false)
const progress = ref(0)
const tension = ref(0)
const showResultModal = ref(false)
const resultMessage = ref('')

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

const closeResultModal = () => {
  showResultModal.value = false
}

const finishFishing = () => {
  clearInterval(holdInterval)
  state.value = 'ready'
  isHolding.value = false
  progress.value = 0
  tension.value = 0
  showResultModal.value = true
}

const toggleHold = (value) => {
  if (state.value === 'hold') {
    isHolding.value = value
  }
}

const startFishing = () => {
  clearInterval(holdInterval)
  state.value = 'hold'

  holdInterval = setInterval(() => {
    if (state.value !== 'hold') {
      return
    }

    if (isHolding.value) {
      progress.value = Math.min(progress.value + 1, 100)
      tension.value = Math.min(tension.value + 1.5, 100)
    } else {
      progress.value = Math.max(progress.value - 1, 0)
      tension.value = Math.max(tension.value - 2, 0)
    }

    if (tension.value >= 100) {
      resultMessage.value = 'Леска порвалась!'
      finishFishing()
    } else if (progress.value >= 100) {
      resultMessage.value = 'Рыба поймана!'
      finishFishing()
    } else if (progress.value <= 0) {
      resultMessage.value = 'Рыба сорвалась!'
      finishFishing()
    }
  }, 30)
}

const throwRod = () => {
  state.value = 'processing'

  const minDelay = 5000
  const maxDelay = 10000
  const delay = minDelay + Math.random() * (maxDelay - minDelay)

  const minProgress = 10
  const maxProgress = 40
  progress.value = minProgress + Math.random() * (maxProgress - minProgress)

  processingTimeout = setTimeout(() => {
    startFishing()
  }, delay)
}

const onClick = () => {
  if (state.value === 'ready') {
    throwRod()
  }
}
</script>

<style scoped lang="scss">
.fishing-container {
  margin-bottom: 3rem;
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);

  .fishing-button {
    padding: 0.5rem 1rem;
    font-size: 1.5rem;
    border-radius: 0.5rem;
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
