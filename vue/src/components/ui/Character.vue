<template>
  <div class="character" :style="styles">
    <img :src="currentSprite" class="enemy__sprite">
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

import warrior_up_0 from './../../assets/enemies/warrior/up_0.png'
import warrior_up_1 from './../../assets/enemies/warrior/up_1.png'
import warrior_down_0 from './../../assets/enemies/warrior/down_0.png'
import warrior_down_1 from './../../assets/enemies/warrior/down_1.png'
import warrior_left_0 from './../../assets/enemies/warrior/left_0.png'
import warrior_left_1 from './../../assets/enemies/warrior/left_1.png'
import warrior_right_0 from './../../assets/enemies/warrior/right_0.png'
import warrior_right_1 from './../../assets/enemies/warrior/right_1.png'
import warrior_upLeft_0 from './../../assets/enemies/warrior/upLeft_0.png'
import warrior_upLeft_1 from './../../assets/enemies/warrior/upLeft_1.png'
import warrior_upRight_0 from './../../assets/enemies/warrior/upRight_0.png'
import warrior_upRight_1 from './../../assets/enemies/warrior/upRight_1.png'
import warrior_downLeft_0 from './../../assets/enemies/warrior/downLeft_0.png'
import warrior_downLeft_1 from './../../assets/enemies/warrior/downLeft_1.png'
import warrior_downRight_0 from './../../assets/enemies/warrior/downRight_0.png'
import warrior_downRight_1 from './../../assets/enemies/warrior/downRight_1.png'

import archer_up_0 from './../../assets/enemies/archer/up_0.png'
import archer_up_1 from './../../assets/enemies/archer/up_1.png'
import archer_down_0 from './../../assets/enemies/archer/down_0.png'
import archer_down_1 from './../../assets/enemies/archer/down_1.png'
import archer_left_0 from './../../assets/enemies/archer/left_0.png'
import archer_left_1 from './../../assets/enemies/archer/left_1.png'
import archer_right_0 from './../../assets/enemies/archer/right_0.png'
import archer_right_1 from './../../assets/enemies/archer/right_1.png'
import archer_upLeft_0 from './../../assets/enemies/archer/upLeft_0.png'
import archer_upLeft_1 from './../../assets/enemies/archer/upLeft_1.png'
import archer_upRight_0 from './../../assets/enemies/archer/upRight_0.png'
import archer_upRight_1 from './../../assets/enemies/archer/upRight_1.png'
import archer_downLeft_0 from './../../assets/enemies/archer/downLeft_0.png'
import archer_downLeft_1 from './../../assets/enemies/archer/downLeft_1.png'
import archer_downRight_0 from './../../assets/enemies/archer/downRight_0.png'
import archer_downRight_1 from './../../assets/enemies/archer/downRight_1.png'

import tank_up_0 from './../../assets/enemies/tank/up_0.png'
import tank_up_1 from './../../assets/enemies/tank/up_1.png'
import tank_down_0 from './../../assets/enemies/tank/down_0.png'
import tank_down_1 from './../../assets/enemies/tank/down_1.png'
import tank_left_0 from './../../assets/enemies/tank/left_0.png'
import tank_left_1 from './../../assets/enemies/tank/left_1.png'
import tank_right_0 from './../../assets/enemies/tank/right_0.png'
import tank_right_1 from './../../assets/enemies/tank/right_1.png'
import tank_upLeft_0 from './../../assets/enemies/tank/upLeft_0.png'
import tank_upLeft_1 from './../../assets/enemies/tank/upLeft_1.png'
import tank_upRight_0 from './../../assets/enemies/tank/upRight_0.png'
import tank_upRight_1 from './../../assets/enemies/tank/upRight_1.png'
import tank_downLeft_0 from './../../assets/enemies/tank/downLeft_0.png'
import tank_downLeft_1 from './../../assets/enemies/tank/downLeft_1.png'
import tank_downRight_0 from './../../assets/enemies/tank/downRight_0.png'
import tank_downRight_1 from './../../assets/enemies/tank/downRight_1.png'

export default {
  name: 'Enemy',
  props: {
    id: {
      type: Number,
      default: 0
    },
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    },
    vx: {
      type: Number,
      default: 0
    },
    vy: {
      type: Number,
      default: 0
    },
    enemyType: {
      type: String,
      default: "warrior"
    },
    characterType: {
      type: String,
      default: "player"
    },
    direction: {
      type: String,
      default: "up"
    },
    speed: {
      type: Number,
      default: 5
    },
    isMoving: {
      type: Boolean,
      default: false
    }
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
        notUpgradedPlayer: {
          up: [up_0, up_1],
          down: [down_0, down_1],
          left: [left_0, left_1],
          right: [right_0, right_1],
          upLeft: [upLeft_0, upLeft_1],
          upRight: [upRight_0, upRight_1],
          downLeft: [downLeft_0, downLeft_1],
          downRight: [downRight_0, downRight_1]
        },
        upgradedPlayer: {
          up: [upgraded_up_0, up_1],
          down: [upgraded_down_0, down_1],
          left: [upgraded_left_0, left_1],
          right: [upgraded_right_0, right_1],
          upLeft: [upgraded_upLeft_0, upLeft_1],
          upRight: [upgraded_upRight_0, upRight_1],
          downLeft: [upgraded_downLeft_0, downLeft_1],
          downRight: [upgraded_downRight_0, downRight_1]
        },
        warrior: {
          up: [warrior_up_0, warrior_up_1],
          down: [warrior_down_0, warrior_down_1],
          left: [warrior_left_0, warrior_left_1],
          right: [warrior_right_0, warrior_right_1],
          upLeft: [warrior_upLeft_0, warrior_upLeft_1],
          upRight: [warrior_upRight_0, warrior_upRight_1],
          downLeft: [warrior_downLeft_0, warrior_downLeft_1],
          downRight: [warrior_downRight_0, warrior_downRight_1]
        },
        archer: {
          up: [archer_up_0, archer_up_1],
          down: [archer_down_0, archer_down_1],
          left: [archer_left_0, archer_left_1],
          right: [archer_right_0, archer_right_1],
          upLeft: [archer_upLeft_0, archer_upLeft_1],
          upRight: [archer_upRight_0, archer_upRight_1],
          downLeft: [archer_downLeft_0, archer_downLeft_1],
          downRight: [archer_downRight_0, archer_downRight_1]
        },
        tank: {
          up: [tank_up_0, tank_up_1],
          down: [tank_down_0, tank_down_1],
          left: [tank_left_0, tank_left_1],
          right: [tank_right_0, tank_right_1],
          upLeft: [tank_upLeft_0, tank_upLeft_1],
          upRight: [tank_upRight_0, tank_upRight_1],
          downLeft: [tank_downLeft_0, tank_downLeft_1],
          downRight: [tank_downRight_0, tank_downRight_1]
        }
      }
      if (this.characterType === 'player') {
        if (!this.upgraded) {
          return sprites['notUpgradedPlayer'][this.characterDirection][this.frame]
        }
        return sprites['upgradedPlayer'][this.characterDirection][this.frame]
      }
      return sprites[this.enemyType][this.characterDirection][this.frame]
    },
    characterDirection () {
      if (this.characterType === 'player') {
        return this.direction
      }
      if (!this.vx && !this.vy) {
        return 'down'
      }
      if (this.vx > 0 && this.vy < 0) {
        return 'upRight'
      }
      if (this.vx < 0 && this.vy < 0) {
        return 'upLeft'
      }
      if (this.vx > 0 && this.vy > 0) {
        return 'downRight'
      }
      if (this.vx < 0 && this.vy > 0) {
        return 'downLeft'
      }
      if (Math.abs(this.vx) > Math.abs(this.vy)) {
        if (this.vx > 0) {
          return 'right'
        }
        else {
          return 'left'
        }
      }
      if (this.vy > 0) {
        return 'down'
      }
      else {
        return 'up'
      }
    }
  },
  mounted () {
    requestAnimationFrame((time) => this.loop(time))
  },
  methods: {
    animationDelay () {
      const maxDelay = 200
      const minDelay = 60
      return Math.max(minDelay, maxDelay - this.speed * 30)
    },
    loop (time = 0) {
      let animate = false
      if (this.characterType === 'player') {
        animate = this.isMoving
      }
      else {
        animate = true
      }
      const delay = this.animationDelay()
      if (animate) {
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
.character {
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
