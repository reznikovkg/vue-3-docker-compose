<template>
  <div class="app">
    <GameBoard />
    <SidePanel />
  </div>
</template>

<script>
import GameBoard from '@/components/ui/GameBoard.vue'
import SidePanel from '@/components/ui/SidePanel.vue'

export default {
  name: 'IndexPage',
  components: {
    GameBoard,
    SidePanel
  }
}
</script>

<style>
.app {
  display: flex;
}
</style>