<template>
  <div 
    class="touch-controls"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <div class="touch-overlay">
      <div class="touch-hint" v-if="showHint">
        <div class="hint-item"> Свайп влево/вправо - движение</div>
        <div class="hint-item"> Свайп вверх - поворот</div>
        <div class="hint-item"> Свайп вниз - ускорить</div>
        <div class="hint-item"> Зажать - быстрое падение</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useStore } from 'vuex'
import { Action } from '../business/Input.js'
import { playerController } from '../business/PlayerController.js'

const store = useStore()

const showHint = ref(false)
const showButtons = ref(true)

// Touch state
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchStartTime = ref(0)
const isLongPress = ref(false)
const longPressTimer = ref(null)

const board = computed(() => store.getters['board/board'])
const player = computed(() => store.getters['player/player'])
const dropTime = computed(() => store.getters['game/dropTime'])

// Минимальное расстояние для распознавания свайпа
const SWIPE_THRESHOLD = 50
const LONG_PRESS_DURATION = 300 // мс для определения зажатия

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

const handleTouchStart = (event) => {
  const touch = event.touches[0]
  touchStartX.value = touch.clientX
  touchStartY.value = touch.clientY
  touchStartTime.value = Date.now()
  isLongPress.value = false

  // Устанавливаем таймер для долгого нажатия
  longPressTimer.value = setTimeout(() => {
    isLongPress.value = true
    if (dropTime.value !== null) {
      store.dispatch('game/pauseDropTime')
    }
    handleInput({ action: Action.FastDrop })
  }, LONG_PRESS_DURATION)
}

const handleTouchMove = (event) => {
  // Отменяем долгое нажатие если палец двигается
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
}

const handleTouchEnd = (event) => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }

  // Если это было долгое нажатие, не обрабатываем как свайп
  if (isLongPress.value) {
    isLongPress.value = false
    return
  }

  const touch = event.changedTouches[0]
  const deltaX = touch.clientX - touchStartX.value
  const deltaY = touch.clientY - touchStartY.value
  const duration = Date.now() - touchStartTime.value

  // Определяем направление свайпа
  const absX = Math.abs(deltaX)
  const absY = Math.abs(deltaY)

  if (absX > SWIPE_THRESHOLD || absY > SWIPE_THRESHOLD) {
    if (absX > absY) {
      // Горизонтальный свайп
      if (deltaX > 0) {
        handleInput({ action: Action.Right })
      } else {
        handleInput({ action: Action.Left })
      }
    } else {
      // Вертикальный свайп
      if (deltaY > 0) {
        // Свайп вниз - ускоряем падение
        handleInput({ action: Action.SlowDrop })
      } else {
        // Свайп вверх - поворот
        handleInput({ action: Action.Rotate })
      }
    }
  } else if (duration < 200) {
    // Быстрый тап - поворот
    handleInput({ action: Action.Rotate })
  }
}

// Обработчики для виртуальных кнопок
const handleLeft = () => {
  handleInput({ action: Action.Left })
}

const handleRight = () => {
  handleInput({ action: Action.Right })
}

const handleRotate = () => {
  handleInput({ action: Action.Rotate })
}

const handleDown = () => {
  if (dropTime.value !== null) {
    store.dispatch('game/pauseDropTime')
  }
  handleInput({ action: Action.SlowDrop })
}

const handleDownRelease = () => {
  store.dispatch('game/resumeDropTime')
}

const handleDrop = () => {
  if (dropTime.value !== null) {
    store.dispatch('game/pauseDropTime')
  }
  handleInput({ action: Action.FastDrop })
}

// Показываем подсказку при первом запуске
onMounted(() => {
  const hintShown = localStorage.getItem('tetris_touch_hint_shown')
  if (!hintShown) {
    showHint.value = true
    setTimeout(() => {
      showHint.value = false
      localStorage.setItem('tetris_touch_hint_shown', 'true')
    }, 5000)
  }

  // Определяем мобильное устройство
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  showButtons.value = isMobile || window.innerWidth < 768
})

onUnmounted(() => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
  }
})
</script>

<style lang="scss" scoped>
.touch-controls {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  pointer-events: none;
}

.touch-overlay {
  width: 100%;
  height: 100%;
  pointer-events: auto;
}

.touch-hint {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 25px;
  border-radius: 15px;
  z-index: 1000;
  text-align: center;
  max-width: 90%;
  animation: fadeIn 0.3s ease-in;

  .hint-item {
    margin: 12px 0;
    font-size: 1.1em;
    line-height: 1.6;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

</style>