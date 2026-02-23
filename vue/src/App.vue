<template>
<div class="app">
    <div class="app__container">
      <h1 class="app__title">Игра 8×8</h1>
      <GameGrid />
    </div>
</div>
</template>

<script>
import GameGrid from './components/GameGrid.vue'

export default {
name: 'App',
components: {
    GameGrid
}
}
</script>