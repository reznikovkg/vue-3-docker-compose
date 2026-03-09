<template>
  <div class="game-map">
    <div class="game-map__world"/>
  </div>

  <Boat/>
</template>

<script setup>
import { onMounted, onUnmounted, computed } from 'vue'
import { useStore } from 'vuex'
import Boat from './Boat.vue'

const store = useStore()

const speed = 1

const move = (e) => {
  const fishing = computed(() => store.getters['game/getIsFishing'])
  if (fishing.value) return

  if (e.key === 'ArrowUp' || e.key === 'w') {
    store.dispatch('game/moveBoat', {x: 0, y: -speed})
    store.dispatch('game/setRowing', true)
  }
  if (e.key === 'ArrowLeft' || e.key === 'a') {
    store.dispatch('game/moveBoat', {x: -speed, y: 0})
    store.dispatch('game/setDirection', -1)
    store.dispatch('game/setRowing', true)
  }
  if (e.key === 'ArrowDown' || e.key === 's') {
    store.dispatch('game/moveBoat', {x: 0, y: speed})
    store.dispatch('game/setRowing', true)
  }
  if (e.key === 'ArrowRight' || e.key === 'd') {
    store.dispatch('game/moveBoat', {x: speed, y: 0})
    store.dispatch('game/setDirection', 1)
    store.dispatch('game/setRowing', true)
  }
}

const stopMove = (e) => {
  if (e.key === 'ArrowUp' || e.key === 'w') {
    store.dispatch('game/setRowing', false)
  }
  if (e.key === 'ArrowLeft' || e.key === 'a') {
    store.dispatch('game/setRowing', false)
  }
  if (e.key === 'ArrowDown' || e.key === 's') {
    store.dispatch('game/setRowing', false)
  }
  if (e.key === 'ArrowRight' || e.key === 'd') {
    store.dispatch('game/setRowing', false)
  }
}

onMounted(() => {
  store.dispatch('game/generateZones')

  window.addEventListener('keydown', move)
  window.addEventListener('keyup', stopMove)
})

onUnmounted(() => {
  window.removeEventListener('keydown', move)
  window.removeEventListener('keyup', stopMove)
})

</script>

<style scoped>
.game-map {
  width: 100%;
  height: 100%;
  position: absolute;
  overflow: hidden;
  z-index: 1;
  
  background-color: rgb(50, 50, 100);
}

.game-map__world {
  position: absolute;
  width: 2500px;
  height: 2500px;
}
</style>
