<template>
  <div class="boat">
    <div class = "boat__image">
      <img src="../../assets/images/Boat.png" width="150px" alt="Boat">
      <div class="boat__man" :class="{ 'boat__man--move': getIsMoving, 'boat__man--fish': getIsFishing }" />
    </div>
  </div>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: "Boat",
  computed: {
    ...mapGetters([
      'getIsMoving',
      'getIsFishing'
    ])
  }
}
</script>

<style scoped lang="scss">
.boat {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  &__man {
    position: relative;
    left: 70px;
    top: -71px;
    width: 50px;
    height: 50px;
    transform: scale(2.5);
    background-image: url(../../assets/images/ManMove.png);

    &--move {
      background-image: url(../../assets/images/ManMove.png);
      animation: man-move 0.65s steps(4) infinite;
    }

    &--fish {
      left: 85px;
      top: -112px;
      background-image: url(../../assets/images/ManFish.png);
      animation: man-fish 0.55s steps(4) infinite;
    }
  }
}
@keyframes man-move {
  from { background-position: 0 0; }
  to { background-position: -192px 0; }
}
@keyframes man-fish {
  from { background-position: 0 0; }
  to { background-position: -192px 0; }
}
</style>
