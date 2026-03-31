<template>
  <div class ="map"></div>
  <Boat/>
  <Inventory/>
  <Location/>
  <MiniGame/>
</template>

<script>
import Boat from './../ui/Boat.vue'
import Inventory from './../ui/Inventory.vue'
import Location from './../ui/Inventory.vue'
import MiniGame from './../ui/MiniGame.vue'
export default {
  name: 'IndexPage',
  components: {
    Boat,
    Inventory,
    Location,
    MiniGame
  }
}
</script>

<style scoped lang="scss">
.map {
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: rgb(25 120 120);
}
</style>
