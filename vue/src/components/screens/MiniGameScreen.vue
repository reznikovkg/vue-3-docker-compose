<template>
 <div class="minigame" @click.self="() => closeMinigame()">
   <div class="minigame-container">
    <div class="minigame-progressbar" @click="() => handleClick()">
      <div
        class="minigame-indicator"
        :style="{ left: indicatorPosition + 'px' }"
      ></div>
      <div class="minigame-targetZone" :style="{ left: targetZonePosition + 'px', width: targetZoneWidth + 'px' }"></div>
    </div>
     <div class="minigame-hint">Чтобы взять предмет нажмите, когда стрелка будет в зелёной зоне</div>
     <div v-if="showResult" :class="['minigame-result', isSuccess ? 'minigame-result--success' : 'minigame-result--fail']">
       {{ isSuccess ? 'Success!' : 'Try again!' }}
     </div>
     <button v-if="showResult" class="minigame-button" @click="() => resetMinigame()">Try Again</button>
   </div>
 </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  difficulty: {
    type: Number,
    default: 1,
    validator: value => value >= 1 && value <= 3
  },
  onComplete: {
    type: Function,
    required: true
  },
  onClose: {
    type: Function,
    required: true
  }
})

const indicatorPosition = ref(0)
const direction = ref(1)
const speed = ref(2)
const targetZonePosition = ref(0)
const targetZoneWidth = ref(0)
const isRunning = ref(true)
const showResult = ref(false)
const isSuccess = ref(false)
const barWidth = ref(200)
const animationFrame = ref(null)
const indicatorWidth = computed(() => 10)

const zoneWidth = computed(() => {
  return 100 - (props.difficulty * 8)
})

const getRandomPosition = () => {
  return Math.random() * (barWidth.value - zoneWidth.value)
}

const animate = () => {
  if (!isRunning.value) {
    return
  }
  indicatorPosition.value += speed.value * direction.value
  if (indicatorPosition.value >= barWidth.value || indicatorPosition.value <= 0) {
    direction.value *= -1
    indicatorPosition.value = Math.max(0, Math.min(indicatorPosition.value, barWidth.value))
  }
  animationFrame.value = requestAnimationFrame(animate)
}

const handleClick = () => {
  if (!isRunning.value) {
    return
  }
  isRunning.value = false
  cancelAnimationFrame(animationFrame.value)
  const indicatorCenter = indicatorPosition.value + (indicatorWidth.value / 2)
  isSuccess.value = indicatorCenter >= targetZonePosition.value && indicatorCenter <= (targetZonePosition.value + targetZoneWidth.value)
  showResult.value = true
  if (isSuccess.value) {
    setTimeout(() => {
      props.onComplete()
      props.onClose()
    }, 1000)
  }
}

const resetMinigame = () => {
  indicatorPosition.value = 0
  direction.value = 1
  targetZonePosition.value = getRandomPosition()
  showResult.value = false
  isRunning.value = true
  animate()
}

const closeMinigame = () => {
  props.onClose()
}

onMounted(() => {
  const progressBar = document.querySelector('.minigame-progressbar')
  if (progressBar) {
    barWidth.value = progressBar.offsetWidth - indicatorWidth.value
    targetZoneWidth.value = zoneWidth.value
    targetZonePosition.value = getRandomPosition()
    animate()
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame.value)
})
</script>

<style scoped lang="less">
.minigame {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  &-container {
    background: #2c3e50;
    padding: 2rem;
    border-radius: 8px;
    text-align: center;
    color: white;
    width: 300px;
  }
  &-progressbar {
    width: 100%;
    height: 30px;
    background-color: #34495e;
    position: relative;
    margin: 2rem 0;
    border-radius: 4px;
    overflow: hidden;
    cursor: url('/cursors/pointer-cursor.png'), pointer;
  }
  &-indicator {
    position: absolute;
    width: 10px;
    height: 100%;
    background-color: #3498db;
    cursor: pointer;
    transition: left 0.1s linear;
  }
  &-targetZone {
    position: absolute;
    height: 100%;
    background-color: rgba(46, 204, 113, 0.3);
    border: 1px solid #2ecc71;
    top: 0;
  }
  &-hint {
    margin: 1rem 0;
    color: #bdc3c7;
    font-size: 0.9rem;
  }
  &-button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #2980b9;
      cursor: url('/cursors/pointer-cursor.png'), pointer;
    }
  }
  &-result {
  margin: 1rem 0;
  font-weight: bold;
  font-size: 1.2rem;
    &--success {
      color: #2ecc71;
    }
    &--fail {
      color: #e74c3c;
    }
  }
}
</style>
