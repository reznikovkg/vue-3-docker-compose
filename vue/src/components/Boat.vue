<template>
  <div class="boat">
    <div class="boat__images" :style="boatStyle">
        <img class="boat__boat" src="../assets/images/Boat.png">
        <div class="boat__sailor" :class="{ 'boat__sailor--rowing': rowing, 'boat__sailor--fishing': fishing }" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const boat = computed(() => store.getters['game/getBoat'])

const rowing = computed(() => boat.value.rowing)
const fishing = computed(() => store.getters['game/getIsFishing'])

const boatStyle = computed(() => ({
  transform: `scaleX(${boat.value.direction})` 
}))
</script>

<style scoped lang="scss">
.boat {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) scale(0.5);
  z-index: 2;
  transform-origin: center bottom;


  &__boat {
    width: 200px;
  }

  &__images {
    position: relative;
    transition: transfrom 0.15s linear;
  }

  &__sailor {
    position: absolute;

    left: 40px;
    top: -82px;

    width: 150px;
    height: 150px;

    background-image: url(../assets/images/SailorRowing.png);
    background-repeat: no-repeat;
    background-position: 0 0;

    &--rowing {
      background-image: url(../assets/images/SailorRowing.png);
      animation: sailor-row 0.6s steps(4) infinite;
    }

    &--fishing {
      background-image: url(../assets/images/SailorFishing.png);
      animation: sailor-row 0.6s steps(4) infinite;

      
      top: -135px;
      left: -20px;
      transform: scaleX(-1);
    }
  }
}

@keyframes sailor-row {
  from { background-position: 0 0; }
  to { background-position: -600px 0; }
}

@keyframes sailor-fish {
  from { background-position: 0 0; }
  to { background-position: -600px 0; }
}

</style>
