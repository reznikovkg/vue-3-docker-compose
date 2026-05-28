<template>
  <div class="player" :style="styles">
    <img :src="currentSprite" class="player__sprite">
  </div>
</template>

<script>
import up_0 from './../../assets/player/up_0.png'
import up_1 from './../../assets/player/up_1.png'
import down_0 from './../../assets/player/down_0.png'
import down_1 from './../../assets/player/down_1.png'
import left_0 from './../../assets/player/left_0.png'
import left_1 from './../../assets/player/left_1.png'
import right_0 from './../../assets/player/right_0.png'
import right_1 from './../../assets/player/right_1.png'
import upLeft_0 from './../../assets/player/upLeft_0.png'
import upLeft_1 from './../../assets/player/upLeft_1.png'
import upRight_0 from './../../assets/player/upRight_0.png'
import upRight_1 from './../../assets/player/upRight_1.png'
import downLeft_0 from './../../assets/player/downLeft_0.png'
import downLeft_1 from './../../assets/player/downLeft_1.png'
import downRight_0 from './../../assets/player/downRight_0.png'
import downRight_1 from './../../assets/player/downRight_1.png'

import upgraded_up_0 from './../../assets/player/upgraded_up_0.png'
import upgraded_down_0 from './../../assets/player/upgraded_down_0.png'
import upgraded_left_0 from './../../assets/player/upgraded_left_0.png'
import upgraded_right_0 from './../../assets/player/upgraded_right_0.png'
import upgraded_upLeft_0 from './../../assets/player/upgraded_upLeft_0.png'
import upgraded_upRight_0 from './../../assets/player/upgraded_upRight_0.png'
import upgraded_downLeft_0 from './../../assets/player/upgraded_downLeft_0.png'
import upgraded_downRight_0 from './../../assets/player/upgraded_downRight_0.png'

export default {
  name: 'Player',
  props: {
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    },
    direction: {
      type: String,
      default: "up"
    },
    speedLevel: {
      type: Number,
      default: 1
    },
    isMoving: {
      type: Boolean,
      default: false
    },
    upgraded: {
      type: Boolean,
      default: false
    },
  },
  data () {
    return {
      frame: 0,
      lastFrameTime: 0
    }
  },
  computed: {
    styles () {
      return {
        top: `${this.y}px`,
        left: `${this.x}px`
      }
    },
    currentSprite () {
      const sprites = {
        notUpgraded: {
          up: [up_0, up_1],
          down: [down_0, down_1],
          left: [left_0, left_1],
          right: [right_0, right_1],
          upLeft: [upLeft_0, upLeft_1],
          upRight: [upRight_0, upRight_1],
          downLeft: [downLeft_0, downLeft_1],
          downRight: [downRight_0, downRight_1]
        },
        upgraded: {
          up: [upgraded_up_0, up_1],
          down: [upgraded_down_0, down_1],
          left: [upgraded_left_0, left_1],
          right: [upgraded_right_0, right_1],
          upLeft: [upgraded_upLeft_0, upLeft_1],
          upRight: [upgraded_upRight_0, upRight_1],
          downLeft: [upgraded_downLeft_0, downLeft_1],
          downRight: [upgraded_downRight_0, downRight_1]
        }
      }
      if (!this.upgraded) {
        return sprites['notUpgraded'][this.direction][this.frame]
      }
      return sprites['upgraded'][this.direction][this.frame]
    }
  },
  mounted () {
    requestAnimationFrame((time) => this.loop(time))
  },
  methods: {
    animationDelay () {
      const maxDelay = 200
      const minDelay = 60
      return Math.max(minDelay, maxDelay - this.speedLevel * 30)
    },
    loop (time = 0) {
      const delay = this.animationDelay()
      if (this.isMoving) {
        if (time - this.lastFrameTime > delay) {
          this.frame = (this.frame + 1) % 2
          this.lastFrameTime = time
        }
      }
      else {
        this.frame = 0
      }
      requestAnimationFrame((time) => this.loop(time))
    }
  }
}
</script>

<style scoped lang="scss">
.player {
  position: absolute;
  border-radius: 50%;
  width: 52px;
  height: 52px;
  transform: translate(-50%, -50%);

  &__sprite {
    width: 100%;
    height: 100%;
    image-rendering: pixelated;
    user-select: none;
    pointer-events: none;
  }
}
</style>
