<template>
  <div class="layout">
    <GameMap/>
    <InfoBar/>
    <MiniGame/>
    <Inventory/>
    <Market/>
  </div>
</template>

<script setup>
import GameMap from '../GameMap.vue';
import InfoBar from '../InfoBar.vue';
import Inventory from '../Inventory.vue';
import Market from '../Market.vue';
import MiniGame from '../MiniGame.vue';
</script>

<style scoped lang="scss">
.layout {
  width: 100%;
  height: 100%;
  overflow:hidden;
  position: relative;
}
</style>
