<template>
  <div class="minigame">
    <button v-if="!isFishing" @click="startFishing" class="minigame__start-button">🎣 Start Fishing</button>
    <div v-if="isFishing" class="minigame__content">
      <div class="minigame__info" :class="`minigame__info--zone-${fishingZone}`">
        {{ difficultyText }}
      </div>
      <div class="minigame__bar-container">
        <div class="minigame__bar" :style="barStyle"></div>
        <div class="minigame__target-zone" :style="targetZoneStyle"></div>
        <div class="minigame__perfect-zone" :style="perfectZoneStyle"></div>
      </div>
      <div class="minigame__result-message" v-if="resultMessage" :class="`minigame__result-message--${resultClass}`">
        {{ resultMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const fishingZone = computed(() => store.getters['game/fishingZone'])
const isFishing = ref(false)
const barPosition = ref(0)
const resultMessage = ref('')
const resultClass = ref('')
const hasPressed = ref(false)
let barDirection = 1
let animationFrameId: number

const fishTypes = {
  high: {
    perfect: ['🐉 Морской Дракон', '👑 Королевский Осетр', '💎 Алмазная Рыба', '⭐ Звездный Тунец'],
    good: ['🐠 Золотая Рыбка', '✨ Радужная Форель', '🌟 Серебряный Карп'],
    rare: ['🎯 Легендарная Щука', '🏆 Трофейный Лосось']
  },
  medium: {
    perfect: ['🐟 Королевский Окунь', '🎣 Благородная Форель', '💫 Сияющий Судак'],
    good: ['🐡 Речной Карась', '🌊 Морской Окунь', '⚡ Быстрая Плотва'],
    rare: ['🔱 Редкий Сом', '🎪 Цирковая Рыба']
  },
  low: {
    perfect: ['🦈 Речная Акула', '🐊 Зубастый Карп', '⚔️ Боевой Окунь'],
    good: ['🐟 Обычный Карась', '🌿 Речная Плотва', '💧 Водяная Рыбка'],
    rare: ['🎲 Удачливая Рыба', '🌪️ Вихревая Щука']
  }
}

const getRandomFish = (fishArray: string[]): string => {
  return fishArray[Math.floor(Math.random() * fishArray.length)] || 'Рыба'
}

const difficulty = computed(() => {
  switch (fishingZone.value) {
    case 'high':
      return {
        speed: 3,
        targetSize: 80,
        text: 'ВЫСОКАЯ ЗОНА - Легко! (Большая зона)',
        perfectZone: 15,
        fishTypes: fishTypes.high
      }
    case 'medium':
      return {
        speed: 5,
        targetSize: 40,
        text: 'СРЕДНЯЯ ЗОНА - Средне (Средняя зона)',
        perfectZone: 10,
        fishTypes: fishTypes.medium
      }
    case 'low':
    default:
      return {
        speed: 7,
        targetSize: 20,
        text: 'НИЗКАЯ ЗОНА - Сложно! (Маленькая зона)',
        perfectZone: 5,
        fishTypes: fishTypes.low
      }
  }
})

const difficultyText = computed(() => difficulty.value.text)

const barStyle = computed(() => ({
  top: barPosition.value + 'px'
}))

const targetZoneStyle = computed(() => ({
  height: difficulty.value.targetSize + 'px'
}))

const perfectZoneStyle = computed(() => ({
  height: difficulty.value.perfectZone + 'px'
}))

const startFishing = () => {
  isFishing.value = true
  barPosition.value = 0
  barDirection = 1
  resultMessage.value = ''
  resultClass.value = ''
  hasPressed.value = false
  animateBar()
}

const animateBar = () => {
  barPosition.value += barDirection * difficulty.value.speed
  if (barPosition.value >= 290 || barPosition.value <= 0) {
    barDirection *= -1
  }
  animationFrameId = requestAnimationFrame(animateBar)
}

const handleSpacebar = (event: KeyboardEvent) => {
  if ((event.key === ' ' || event.key === 'Spacebar') && isFishing.value && !hasPressed.value) {
    event.preventDefault()
    hasPressed.value = true
    cancelAnimationFrame(animationFrameId)
    
    const targetStart = 300 - difficulty.value.targetSize
    const perfectStart = 300 - difficulty.value.perfectZone
    const isInTargetZone = barPosition.value >= targetStart && barPosition.value <= 300
    const isPerfect = barPosition.value >= perfectStart && barPosition.value <= 300
    
    if (isInTargetZone) {
      let caughtFish = ''
      
      if (isPerfect) {
        const randomChance = Math.random()
        if (randomChance < 0.3) {
          caughtFish = getRandomFish(difficulty.value.fishTypes.rare)
          resultMessage.value = '💎 ИДЕАЛЬНО! Супер редкая рыба!'
          resultClass.value = 'perfect'
        } else {
          caughtFish = getRandomFish(difficulty.value.fishTypes.perfect)
          resultMessage.value = '🎉 ОТЛИЧНО! Редкая рыба!'
          resultClass.value = 'success'
        }
      } else {
        caughtFish = getRandomFish(difficulty.value.fishTypes.good)
        resultMessage.value = '✅ Хорошо! Поймали рыбу!'
        resultClass.value = 'success'
      }
      
      store.dispatch('game/runAddFish', caughtFish)
    } else {
      resultMessage.value = '❌ Промах! Попробуйте еще раз'
      resultClass.value = 'fail'
    }
    
    setTimeout(() => {
      isFishing.value = false
      resultMessage.value = ''
      resultClass.value = ''
      hasPressed.value = false
    }, 2000)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleSpacebar)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleSpacebar)
  cancelAnimationFrame(animationFrameId)
})
</script>

<style scoped>
.minigame {
  background-color: rgba(255, 255, 255, 0.95);
  border: 3px solid #333;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.minigame__start-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.minigame__start-button:hover {
  background-color: #45a049;
  transform: scale(1.05);
}

.minigame__content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.minigame__info {
  color: white;
  padding: 10px 15px;
  border-radius: 5px;
  text-align: center;
  font-weight: bold;
  font-size: 13px;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.minigame__info--zone-low {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.4);
}

.minigame__info--zone-medium {
  background: linear-gradient(135deg, #FF9800, #F57C00);
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.4);
}

.minigame__info--zone-high {
  background: linear-gradient(135deg, #4CAF50, #388E3C);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
}

.minigame__bar-container {
  position: relative;
  width: 60px;
  height: 300px;
  background-color: #e0e0e0;
  border: 3px solid #333;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.2);
}

.minigame__bar {
  width: 100%;
  height: 20px;
  background: linear-gradient(135deg, #2196F3, #1976D2);
  position: absolute;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: none;
}

.minigame__target-zone {
  width: 100%;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.9), rgba(56, 142, 60, 0.9));
  position: absolute;
  bottom: 0;
  border-top: 3px solid #2E7D32;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: height 0.3s ease;
  z-index: 1;
}

.minigame__perfect-zone {
  width: 100%;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.95), rgba(255, 193, 7, 0.95));
  position: absolute;
  bottom: 0;
  border-top: 3px solid #FF6F00;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 0 10px rgba(255, 215, 0, 0.6);
  transition: height 0.3s ease;
  z-index: 2;
  animation: perfectGlow 1s ease-in-out infinite alternate;
}

@keyframes perfectGlow {
  from {
    box-shadow: 
      inset 0 2px 4px rgba(0, 0, 0, 0.3),
      0 0 10px rgba(255, 215, 0, 0.6);
  }
  to {
    box-shadow: 
      inset 0 2px 4px rgba(0, 0, 0, 0.3),
      0 0 20px rgba(255, 215, 0, 0.9);
  }
}

.minigame__result-message {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 14px;
  text-align: center;
  animation: fadeIn 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.minigame__result-message--success {
  background: linear-gradient(135deg, #4CAF50, #66BB6A);
  color: white;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
}

.minigame__result-message--perfect {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #333;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.6);
  animation: perfectPulse 0.5s ease-in-out;
  font-size: 16px;
}

.minigame__result-message--fail {
  background: linear-gradient(135deg, #f44336, #ef5350);
  color: white;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.4);
}

@keyframes perfectPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
