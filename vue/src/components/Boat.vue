<template>
  <div class="boat">
    <div class="boat__images" :style="boatStyle">
        <img class="boat__boat" src="../assets/images/Boat.png" width="200px">
        <div class="boat__sailor" :class="{ 'boat__sailor--animate': rowing }" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const boat = computed(() => store.getters['game/getBoat'])

const rowing = computed(() => boat.value.rowing)

const boatStyle = computed(() => ({
  transform: `scaleX(${boat.value.direction})` 
}))
</script>

<style scoped>
.boat {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}

.boat__images {
  position: relative;
  transition: transfrom 0.15s linear;
}

.boat__sailor {
  position: absolute;

  left: 40px;
  top: -82px;

  width: 150px;
  height: 150px;

  background-image: url(../assets/images/Sailor.png);
  background-repeat: no-repeat;

  background-position: 0 0;
}

.boat__sailor--animate {
  animation: sailor-row 0.6s steps(4) infinite;
}

@keyframes sailor-row {
  from {
    background-position: 0 0;
  }

  to {
    background-position: -600px 0;
  }
}

</style>
