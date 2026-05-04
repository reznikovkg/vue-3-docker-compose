<template>
  <div class="boarding" v-if="boarding.active">
    <div class="boarding__title">
      Абордаж <span v-if="active">(Раунд {{ boarding.round + 1 }})</span>
    </div>

    <div class="boarding__bar" v-if="active">
      <div class="boarding__bar__bar" :style="{ left: barPosition + '%' }"></div>
      <div class="boarding__bar__target"></div>
    </div>

    <div class="boarding__info">
      <span class="boarding__label">
        Нажмите [ПРОБЕЛ] чтобы отбиться
      </span>
    </div>

    <div class="boarding__results">
      <div class="boarding__results__result" v-for="result in boarding.results" :class="{
        'boarding__results__result--win': result,
        'boarding__results__result--lose': !result
      }" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, computed, ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const boarding = computed(() => store.getters['game/getBoarding'])

const active = ref(false)

const barPosition = ref(0)
const direction = ref(1)

const intervalID = ref(null)

const targetStart = 45
const targetEnd = 55

const speed = computed(() => {
  const baseSpeed = 1.0
  return baseSpeed
})

const nextRound = () => {
  clearInterval(intervalID.value)
  const round = boarding.value.round

  if (round >= 3) {
    active.value = false
    setTimeout(() => stopBoarding(), 1000)
    return
  }

  setTimeout(() => startBoarding(), 200)
}

const handleSpace = (e) => {
  if (e.key !== ' ') return
  if (!boarding.value.active) return

  if (!active.value) {
    active.value = true
    startBoarding()
    return
  }

  const result = barPosition.value >= targetStart && barPosition.value <= targetEnd
  store.dispatch('game/addBoardingResult', result)

  nextRound()
}

const startBoarding = () => {
  barPosition.value = 0
  direction.value = 1

  intervalID.value = setInterval(() => {
    barPosition.value += direction.value * speed.value
    if (barPosition.value >= 95) direction.value = -1
    if (barPosition.value <= 0) direction.value = 1
  }, 10)
}

const stopBoarding = () => {
  clearInterval(intervalID.value)
  store.dispatch('game/applyBoardingResults')
  store.dispatch('game/endBoarding')
}

onMounted(() => {
  window.addEventListener('keydown', handleSpace)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleSpace)
  clearInterval(intervalID.value)
})
</script>

<style scoped lang="scss">
.boarding {
  position: absolute;
  top: 90%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;

  width: 400px;

  padding: 18px;
  background-color: rgb(200, 200, 200);
  border: 8px dashed rgb(10, 10, 100);
  box-shadow: 0 4px 10px rgb(0, 0, 0);

  &__title {
    color: rgb(10, 10, 100);
    font-size: 24px;
    font-style: bold;
    text-align: center;
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

  &__results {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 8px;

    &__result {
      width: 16px;
      height: 16px;
      padding: 2px;
      border: 4px dashed rgb(200, 200, 200);

      &--win {
        background-color: rgb(10, 10, 100);
      }

      &--lose {
        background-color: rgb(100, 10, 10);
      }
    }
  }
}
</style>