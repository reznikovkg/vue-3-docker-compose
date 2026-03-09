<template>
  <div class="minigame">
    <div class="minigame__title">
      Мини-игра
    </div>

    <div class="minigame__bar-container" v-if="active">
      <div class="minigame__bar" :style="{ left: barPosition + '%'}"></div>
      <div class="minigame__target"></div>
    </div>

    <span class="minigame__invite" v-if="!fishing">Нажмите ПРОБЕЛ чтобы ловить</span>
    <span class="minigame__invite" v-if="!active && fishing">Ждем клёва...</span>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, computed, ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const active = ref(false)

const fishing = computed(() => store.getters['game/getIsFishing'])

const barPosition = ref(0)
const direction = ref(1)

const intervalID = ref(null)

const speed = 0.8

const targetStart = 40
const targetEnd = 60

const handleSpace = (e) => {
  if (e.key !== ' ') return

  const zone = computed(() => store.getters['game/getCurrentZone'])

  if (!active.value) {
    startMiniGame(zone.value)
    return
  } else {
    const success = barPosition.value >= targetStart && barPosition.value <= targetEnd
    if (success) {
      let randomVal = Math.floor(Math.random() * 100)

      let fishType = 'common'
      if (randomVal >= 75 && randomVal < 95) fishType = 'rare'
      else if (randomVal >= 95) fishType = 'legendary'

      console.log(randomVal)

      store.dispatch('game/addFish', fishType)
    }
    stopMiniGame()
  }
}

const startMiniGame = (zone) => {
  let delay = (zone === 'Обычный' ? 3000 : (zone === 'Средний' ? 1000 : 0))

  store.dispatch('game/fishing')

  setTimeout(() => {
    active.value = true
    barPosition.value = 0
    direction.value = 1
  }, delay)

  intervalID.value = setInterval(() => {
    barPosition.value += direction.value * speed
    if (barPosition.value >= 90) direction.value = -1
    if (barPosition.value <= 0) direction.value = 1
  }, 10)
}

const stopMiniGame = () => {
  active.value = false
  clearInterval(intervalID.value)
  store.dispatch('game/fishing')
} 

onMounted(() => {
  window.addEventListener('keydown', handleSpace)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleSpace)
})
</script>

<style scoped>
.minigame {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;

  width: 300px;

  padding: 18px;
  background-color: rgb(200, 200, 200);
  border: 8px dashed rgb(10, 10, 100);
  box-shadow: 0 4px 10px rgb(0, 0, 0);
  left: 20px;
}

.minigame__title {
  color: rgb(10, 10, 100);
  font-size: 24px;
  font-style: bold;
}

.minigame__invite {
  color: rgb(10, 10, 100);
  font-size: 16px;
  font-style: italic;
}

.minigame__bar-container {
  position: relative;
  width: 100%;
  height: 24px;
  background-color: rgb(200, 200, 200);
  border: 4px dashed rgb(10, 10, 100);
}

.minigame__bar {
  position: absolute;
  width: 10%;
  height: 100%;
  background-color: rgb(10, 10, 100);

  left: 0;

  z-index: 5;
}

.minigame__target {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);

  width: 20%;
  height: 100%;

  background-color: rgb(100, 10, 10);

  z-index: 4;
}
</style>
