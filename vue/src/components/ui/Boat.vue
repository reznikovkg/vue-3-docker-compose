<template>
  <div class="boat">
    <div class = "boat__image">
      <img src="../../assets/images/boat.png" width="150" alt="boat">
      <div class="boat__image__man" :class="manClass" :style="manStyle"/>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Boat',
  computed: {
    ...mapGetters([
      'getBoat',
      'getIsMoving',
      'getIsFishing',
      'getIsGaming',
      'getIsHooked',
      'getIsBroken'
    ]),
    manClass() {
      return {
        'boat__image__man--move': this.getIsMoving,
        'boat__image__man--delay': this.getIsFishing && !this.getIsGaming,
        'boat__image__man--fishing': this.getIsGaming,
        'boat__image__man--hook': this.getIsHooked,
        'boat__image__man--broke': this.getIsBroken
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
  z-index: 2;

  &__image {
    image-rendering: pixelated;

    &__man {
      position: absolute;
      width: 50px;
      height: 50px;
      top: -39px;
      background-image: url(../../assets/images/man/move.png);

      &--move {
        background-image: url(../../assets/images/man/move.png);
        animation: man-move 0.65s infinite step-end
      }

      &--delay {
        top: -80px;
        background-image: url(../../assets/images/man/fish.png);
      }

      &--fishing {
        top: -80px;
        background-image: url(../../assets/images/man/fish.png);
        animation: man-fish 0.55s steps(4) infinite
      }

      &--hook {
        top: -80px;
        background-image: url(../../assets/images/man/hook.png);
        animation: man-hook 0.55s steps(5) 1 forwards
      }

      &--broke {
        top: -80px;
        background-image: url(../../assets/images/man/broke.png);
        animation: man-broke 0.4s steps(5) 1 forwards
      }
    }
  }
}
@keyframes man-move {
  0%   { background-position: -48px 0 }
  25%  { background-position: -96px 0 }
  50%  { background-position: -144px 0 }
  75%  { background-position: 0 0 }
  100% { background-position: -48px 0 }
}
@keyframes man-fish {
  from { background-position: 0 0 }
  to { background-position: -192px 0 }
}
@keyframes man-hook {
  from { background-position: 0 0 }
  to { background-position: -240px 0 }
}
@keyframes man-broke {
  from { background-position: 0 0 }
  to { background-position: -240px 0 }
}
</style>
