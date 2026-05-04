<template>
  <div class="game-map" :style="mapStyle">
    <div class="game-map__world" />
  </div>

  <Island v-for="island in islands" :island="island" />
  <Pirate v-for="pirate in pirates" :pirate="pirate" />
  <Boat />
</template>

<script setup>
import { onMounted, onUnmounted, computed } from 'vue'
import { useStore } from 'vuex'
import Boat from './Boat.vue'
import Island from './Island.vue'
import Pirate from './Pirate.vue'

const store = useStore()

const islands = computed(() => store.getters['game/getIslands'])
const pirates = computed(() => store.getters['game/getPirates'])
const fishing = computed(() => store.getters['game/getIsFishing'])
const boarding = computed(() => store.getters['game/getBoarding'])

const isNight = computed(() => store.getters['game/getIsNight'])

const mapStyle = computed(() => {
  return {
    backgroundColor: !isNight.value ? 'rgb(50, 50, 100)' : 'rgb(33, 33, 66)',
    transition: 'background-color 2s ease'
  }
})

const keys = {
  up: false,
  left: false,
  down: false,
  right: false
}

const handleMoveKeyDown = (e) => {
  if (e.key === 'ArrowUp' || e.key === 'w') keys.up = true
  if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true
  if (e.key === 'ArrowDown' || e.key === 's') keys.down = true
  if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true
}

const handleMoveKeyUp = (e) => {
  if (e.key === 'ArrowUp' || e.key === 'w') keys.up = false
  if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false
  if (e.key === 'ArrowDown' || e.key === 's') keys.down = false
  if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false
}

const moving = () => {
  if (fishing.value) return
  if (boarding.value.active) return

  let x = 0
  let y = 0

  if (keys.up) y -= 1
  if (keys.left) x -= 1
  if (keys.down) y += 1
  if (keys.right) x += 1

  if (x !== 0 || y !== 0) {
    store.dispatch('game/moveBoat', { x: x, y: y })
    store.dispatch('game/setRowing', true)

    if (x !== 0) store.dispatch('game/setDirection', x > 0 ? 1 : -1)
  } else {
    store.dispatch('game/setRowing', false)
  }
}

const useGroundbait = (e) => {
  if (e.key === 'z') {
    store.dispatch('game/useGroundbait')
  }
}

const changeTime = (e) => {
  if (e.key === 't') {
    store.dispatch('game/setIsNight', !isNight.value)
  }
}

let interval = null

onMounted(() => {
  store.dispatch('game/generateZones')
  store.dispatch('game/spawnPirates')
  store.dispatch('game/startPirates')

  window.addEventListener('keydown', handleMoveKeyDown)
  window.addEventListener('keyup', handleMoveKeyUp)

  window.addEventListener('keydown', useGroundbait)
  window.addEventListener('keydown', changeTime)

  interval = setInterval(moving, 25)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleMoveKeyDown)
  window.removeEventListener('keyup', handleMoveKeyUp)

  window.removeEventListener('keydown', useGroundbait)
  window.addEventListener('keydown', changeTime)

  clearInterval(interval)
})

</script>

<style scoped lang="scss">
.game-map {
  width: 100%;
  height: 100%;
  position: absolute;
  overflow: hidden;
  z-index: 1;

  &__world {
    position: absolute;
    width: 2500px;
    height: 2500px;
  }
}
</style>
