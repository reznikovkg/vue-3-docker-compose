<template>
  <div class="minigame">
    <div class="minigame__title">
      Мини-игра
    </div>

    <div class="minigame__bar" v-if="active">
      <div class="minigame__bar__bar" :style="{ left: barPosition + '%'}"></div>
      <div class="minigame__bar__target"></div>
    </div>

    <div class="minigame__info" v-if="!fishing">
      <span class="minigame__label">[Z] чтобы сбросить прикормку за борт</span>
      <span class="minigame__label">
        Выбранная наживка: {{ activeBaitText }} ({{ baitCount }})<br> 
        ([1], [2], [3] чтобы сменить наживку)
      </span>
      <span class="minigame__label" v-if="baitCount > 0">
        Нажмите [ПРОБЕЛ] чтобы ловить
      </span>
      <span class="minigame__label" v-else>Недостаточно выбранной наживки</span>
    </div>

    <span class="minigame__label" v-if="!active && fishing">Ждем клёва...</span>
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

const targetStart = 45
const targetEnd = 55

const activeBait = computed(() => store.getters['game/getActiveBait'])

const baits = computed(() => store.getters['game/getBaits'])

const zone = computed(() => store.getters['game/getCurrentZone'])

const baitsNames = {
  worms: 'Черви',
  corn: 'Кукуруза',
  maggots: 'Опарыши'
}

const baitDifficulty = {
  worms: 1,
  corn: 5,
  maggots: 10
}

const power = computed(() => store.getters['game/getPower'])
const speed = computed(() => { return 1.0 / (1 + Math.log(power.value / 0.05)) * baitDifficulty[activeBait.value] })

const activeBaitText = computed(() => baitsNames[activeBait.value])
const baitCount = computed(() => baits.value[activeBait.value])

const handleNum = (e) => {
  if (fishing.value) return
  if (e.code === 'Digit1') {
    store.dispatch('game/setActiveBait', 'worms')
  } else if (e.code === 'Digit2') {
    store.dispatch('game/setActiveBait', 'corn')
  } else if (e.code === 'Digit3') {
    store.dispatch('game/setActiveBait', 'maggots')
  }
}

const handleSpace = (e) => {
  if (e.key !== ' ') return
  if (!active.value && fishing.value) return

  if (!active.value) {
    if (baitCount.value > 0) {
      startMiniGame(zone.value)
      return
    }
  } else {
    const success = barPosition.value >= targetStart && barPosition.value <= targetEnd
    if (success) {
      const baitToFish = {
        worms: 'common',
        corn: 'rare',
        maggots: 'legendary'
      }

      store.dispatch('game/removeZone')
      store.dispatch('game/addFish', baitToFish[activeBait.value])
    }
    store.dispatch('game/useBait', activeBait.value)
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
    barPosition.value += direction.value * speed.value
    if (barPosition.value >= 95) direction.value = -1
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
  window.addEventListener('keydown', handleNum)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleSpace)
  window.removeEventListener('keydown', handleNum)
  clearInterval(intervalID.value)
})
</script>

<style scoped lang="scss">
.minigame {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;

  width: 400px;

  padding: 18px;
  background-color: rgb(200, 200, 200);
  border: 8px dashed rgb(10, 10, 100);
  box-shadow: 0 4px 10px rgb(0, 0, 0);
  left: 20px;

  &__title {
    color: rgb(10, 10, 100);
    font-size: 24px;
    font-style: bold;
  }

  &__label {
    color: rgb(10, 10, 100);
    font-size: 18px;
    font-style: italic;
  }

  &__bar {
    position: relative;
    width: 100%;
    height: 24px;
    background-color: rgb(200, 200, 200);
    border: 4px dashed rgb(10, 10, 100);

    &__bar {
      position: absolute;
      width: 5%;
      height: 100%;
      background-color: rgb(10, 10, 100);

      left: 0;

      z-index: 5;
    }

    &__target {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);

      width: 10%;
      height: 100%;

      background-color: rgb(100, 10, 10);

      z-index: 4;
    }
  }
}
</style>
