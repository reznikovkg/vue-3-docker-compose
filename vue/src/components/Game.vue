<template>
  <div class="game">
    <Menu v-if="gameOver" @start="startGame" />
    <Tetris 
      v-else 
      :rows="rows" 
      :columns="columns" 
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import Menu from './Menu.vue'
import Tetris from './Tetris.vue'

const props = defineProps({
  rows: { type: Number, default: 20 },
  columns: { type: Number, default: 10 }
})

const store = useStore()

const gameOver = computed(() => store.getters['game/gameOver'])

const startGame = () => {
  store.dispatch('game/startGame')
  // console.log('Game started')
}
</script>