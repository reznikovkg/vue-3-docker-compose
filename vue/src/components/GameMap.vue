<template>
  <div class="game-map">
    <div class="game-map__world"/>
  </div>

  <Island v-for="island in islands" :island="island"/>
  <Boat/>
</template>

<script setup>
import { onMounted, onUnmounted, computed } from 'vue'
import { useStore } from 'vuex'
import Boat from './Boat.vue'
import Island from './Island.vue'

const store = useStore()

const islands = computed(() => store.getters['game/getIslands'])

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

const useGroundbait = (e) => {
  if (e.key === 'z') {
    store.dispatch('game/useGroundbait')
  }
}

onMounted(() => {
  store.dispatch('game/generateZones')

  window.addEventListener('keydown', move)
  window.addEventListener('keyup', stopMove)
  window.addEventListener('keydown', useGroundbait)
})

onUnmounted(() => {
  window.removeEventListener('keydown', move)
  window.removeEventListener('keyup', stopMove)
  window.removeEventListener('keydown', useGroundbait)
})

</script>

<style scoped lang="scss">
.game-map {
  width: 100%;
  height: 100%;
  position: absolute;
  overflow: hidden;
  z-index: 1;
  
  background-color: rgb(50, 50, 100);

  &__world {
    position: absolute;
    width: 2500px;
    height: 2500px;
  }
}
</style>
