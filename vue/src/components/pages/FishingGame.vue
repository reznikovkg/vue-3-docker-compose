<template>
  <div class="modal">
    <div class="game-window">
      <h2>Ловим рыбу!</h2>
      <p>Нажми <kbd>ПРОБЕЛ</kbd> когда полоска будет внизу!</p>

      <div class="game-area">
        <div class="slider-container">
          <div class="slider-bar" :style="{ top: barPosition + '%' }"></div>
          <div class="target-area"></div>
        </div>
      </div>

      <div class="time">Осталось: {{ timeLeft }}с</div>

      <button @click="tryCatch" class="catch-btn">🎣 Ловить!</button>
      <button @click="cancel" class="cancel-btn">❌ Сбежать</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['close', 'catch']) // Будем отправлять родителю событие об окончании игры и результате, чтобы он уничтожил компонент

const barPosition = ref(50)
const barDirection = ref(1)
const timeLeft = ref(3)

let interval = null
let timeInterval = null

function startGame() {
  // Анимация полоски
  interval = setInterval(() => {
    let newPos = barPosition.value + barDirection.value * 3
    if (newPos >= 90) {
      newPos = 90
      barDirection.value = -1
    } else if (newPos <= 10) {
      newPos = 10
      barDirection.value = 1
    }
    barPosition.value = newPos
  }, 50)

  // Таймер
  timeInterval = setInterval(() => {
    timeLeft.value -= 0.1
    if (timeLeft.value <= 0) {
      endGame(false)
    }
  }, 100)
}

function tryCatch() {
  const success = barPosition.value >= 80
  endGame(success)
}

function endGame(success) {
  if (interval) clearInterval(interval)
  if (timeInterval) clearInterval(timeInterval)
  emit('catch', success)
  emit('close')
}

function cancel() {
  endGame(false)
}

function handleKeydown(e) {
  if (e.code === 'Space') {
    e.preventDefault()
    tryCatch()
  }
}

onMounted(() => { // При заходе на компонент сразу запускаем игру
  startGame()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)  // При выходе очищаем все
  if (timeInterval) clearInterval(timeInterval)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.game-window {
  background: #1e2a1c;
  padding: 30px;
  border-radius: 24px;
  text-align: center;
  border: 3px solid gold;
  min-width: 350px;
}

.game-area {
  margin: 20px 0;
}

.slider-container {
  width: 100%;
  height: 250px;
  background: #0a1f0a;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #dbb45c;
}

.slider-bar {
  position: absolute;
  width: 100%;
  height: 20px;
  background: linear-gradient(90deg, #ff4444, #ffdd44);
  transition: top 0.03s linear;
  box-shadow: 0 0 5px yellow;
}

.target-area {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 20%;
  background: rgba(76, 175, 80, 0.5);
  border-top: 3px solid #4caf50;
}

.time {
  font-size: 24px;
  font-weight: bold;
  color: #ffd966;
  margin: 10px 0;
}

.catch-btn {
  background: #4caf50;
  color: white;
  padding: 10px 24px;
  font-size: 1rem;
  margin: 5px;
}

.cancel-btn {
  background: #aa3c3c;
  color: white;
}

kbd {
  background: #333;
  padding: 2px 8px;
  border-radius: 6px;
  font-family: monospace;
}
</style>