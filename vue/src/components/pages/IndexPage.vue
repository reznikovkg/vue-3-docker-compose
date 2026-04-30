<template>
  <div class="layout">
    <GameMap/>
    <InfoBar/>
    <MiniGame/>
    <Inventory/>
    <Market/>
    <Boarding/>
  </div>
</template>

<script setup>
import Boarding from '../Boarding.vue';
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
