<template>
  <div class="boat">
    <div class = "boat__image">
      <img src="../../assets/images/Boat.png" width="150px" alt="Boat">
      <div class="boat__man" :class="manClass" :style="manStyle"/>
    </div>
  </div>
</template>

<script>
import {mapGetters} from 'vuex'

export default {
  name: 'Boat',
  computed: {
    ...mapGetters([
      'getIsMoving',
      'getIsFishing',
      'getIsGaming',
      'getBoat'
    ]),
    manClass() {
      return {
        'boat__man--move': this.getIsMoving,
        'boat__man--delayfish': this.getIsFishing && !this.getIsGaming,
        'boat__man--gamefish': this.getIsGaming
      }
    },
    manStyle() {
      return {
        transform: 'scale(' + 2.5 * this.getBoat.direction + ', 2.5)',
        left: 50 + this.getBoat.direction * 20 + 'px'
      }
    }
  }
}
</script>

<style scoped lang="scss">
.boat {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  image-rendering: pixelated;
  z-index: 2;

  &__man {
    position: absolute;
    width: 50px;
    height: 50px;
    top: -39px;
    background-image: url(../../assets/images/ManMove.png);

    &--move {
      background-image: url(../../assets/images/ManMove.png);
      animation: man-move 0.65s steps(4) infinite
    }

    &--delayfish {
      top: -80px;
      background-image: url(../../assets/images/ManFish.png);
    }

    &--gamefish {
      top: -80px;
      background-image: url(../../assets/images/ManFish.png);
      animation: man-fish 0.55s steps(4) infinite
    }
  }
}
@keyframes man-move {
  from { background-position: 0 0 }
  to { background-position: -192px 0 }
}
@keyframes man-fish {
  from { background-position: 0 0 }
  to { background-position: -192px 0 }
}
</style>
