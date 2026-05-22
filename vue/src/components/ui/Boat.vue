<template>
  <div class="boat" :class="'boat--' + type" :style="boatStyle">
    <img :src="boatImage" width="150" alt="boat">
    <div :class="manClass" :style="[manStyle, moveStyle]"/>
  </div>
</template>

<script>
import playerBoatImage from '../../assets/images/player/boat.png'
import pirateBoatImage from '../../assets/images/pirate/boat.png'

export default {
  name: 'Boat',
  props: {
    boat: {
      type: Object,
      required: true
    },
    type: {
      type: String,
      required: true
    }
  },
  computed: {
    boatStyle() {
      if(this.type === 'pirate') {
        return {
          transform: 'translate(' + this.boat.x + 'px, ' + this.boat.y + 'px)'
        }
      }
    },
    boatImage() {
      return this.type === 'pirate' ? pirateBoatImage : playerBoatImage
    },
    manClass() {
      if(this.type === 'player') {
        return {
          'boat--player__man': true,
          'boat--player__man--move': this.boat.isMoving,
          'boat--player__man--delay': this.boat.isFishing && !this.boat.isGaming,
          'boat--player__man--fishing': this.boat.isGaming,
          'boat--player__man--hook': this.boat.isHooked,
          'boat--player__man--broke': this.boat.isBroken,
          'boat--player__man--fight': this.boat.isFighting
        }
      }
      else if(this.type === 'pirate') {
        return {
          'boat--pirate__man': true,
          'boat--pirate__man--move': this.boat.isMoving,
          'boat--pirate__man--fight': this.boat.isFighting
        }
      }
    },
    manStyle() {
      return {
        transform: 'scale(' + 2.5 * this.boat.direction + ', 2.5)',
        left: 50 + this.boat.direction * 20 + 'px'
      }
    },
    moveStyle() {
      if(this.boat.isMoving) {
        return {
          animationDuration: 2.5 / this.boat.speed + 's'
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.boat {
  position: absolute;
  image-rendering: pixelated;

  &--player {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;

    &__man {
      position: absolute;
      width: 50px;
      height: 50px;
      top: -39px;
      background-image: url(../../assets/images/player/move.png);

      &--move {
        background-image: url(../../assets/images/player/move.png);
        animation: man-move infinite step-end
      }

      &--delay {
        top: -80px;
        background-image: url(../../assets/images/player/fish.png);
      }

      &--fishing {
        top: -80px;
        background-image: url(../../assets/images/player/fish.png);
        animation: man-fish 0.55s steps(4) infinite
      }

      &--hook {
        top: -80px;
        background-image: url(../../assets/images/player/hook.png);
        animation: man-hook 0.55s steps(5) 1 forwards
      }

      &--broke {
        top: -80px;
        background-image: url(../../assets/images/player/broke.png);
        animation: man-broke 0.4s steps(5) 1 forwards
      }

      &--fight {
        top: -80px;
        background-image: url(../../assets/images/player/fight.png);
        animation: man-fight 0.55s steps(4) infinite
      }
    }
  }

  &--pirate {
    top: -16.17px;
    left: -75px;
    z-index: 2;

    &__man {
      position: absolute;
      width: 50px;
      height: 50px;
      top: -39px;
      background-image: url(../../assets/images/pirate/move.png);

      &--move {
        background-image: url(../../assets/images/pirate/move.png);
        animation: man-move infinite step-end
      }

      &--fight {
        top: -80px;
        background-image: url(../../assets/images/pirate/fight.png);
        animation: man-fight 0.55s steps(4) infinite
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
@keyframes man-fight {
  from { background-position: 0 0 }
  to { background-position: -192px 0 }
}
</style>
