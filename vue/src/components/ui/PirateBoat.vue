<template>
  <div class="pirate-boat" :style="boatStyle">
    <img src="../../assets/images/pirate/boat.png" width="148" alt="boat">
    <div class="pirate-boat__pirate" :class="pirateClass" :style="[pirateStyle, moveStyle]"/>
  </div>
</template>

<script>
export default {
  name: 'PirateBoat',
  props: {
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    },
    speed: {
      type: Number,
      required: true
    },
    direction: {
      type: Number,
      required: true
    },
    isMoving: {
      type: Boolean,
      required: true
    },
    isFighting: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    boatStyle() {
      return {
        transform: 'translate(' + this.x + 'px, ' + this.y + 'px)'
      }
    },
    pirateClass() {
      return {
        'pirate-boat__pirate--move': this.isMoving,
        'pirate-boat__pirate--fight': this.isFighting,
      }
    },
    pirateStyle() {
      return {
        transform: 'scale(' + 2.5 * this.direction + ', 2.5)',
        left: 50 + this.direction * 20 + 'px'
      }
    },
    moveStyle() {
      if(this.isMoving) {
        return {
          animationDuration: 2.5 / this.speed + 's'
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.pirate-boat {
  position: absolute;
  top: -15.9px;
  left: -74px;
  image-rendering: pixelated;
  z-index: 2;

  &__pirate {
    position: absolute;
    width: 50px;
    height: 50px;
    top: -39px;
    background-image: url(../../assets/images/pirate/move.png);

    &--move {
      background-image: url(../../assets/images/pirate/move.png);
      animation: pirate-move infinite step-end
    }

    &--fight {
      top: -80px;
      background-image: url(../../assets/images/pirate/fight.png);
      animation: man-fight 0.55s steps(4) infinite
    }
  }
}
@keyframes pirate-move {
  0%   { background-position: -48px 0 }
  25%  { background-position: -96px 0 }
  50%  { background-position: -144px 0 }
  75%  { background-position: 0 0 }
  100% { background-position: -48px 0 }
}
@keyframes man-fight {
  from { background-position: 0 0 }
  to { background-position: -192px 0 }
}
</style>
