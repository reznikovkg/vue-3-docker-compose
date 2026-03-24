<template>
  <div class="minigame">
    <div class="minigame__bar-container">
      <div class="minigame__catch-zone"></div>
      <div class="minigame__indicator" :style="{ top: indicatorPos + '%' }"></div>
    </div>
  </div>
</template>

<script>
import { getRandomFish } from '@/fish' 
const SPEED = 0.5
const INDICATOR_STEP_MS = 10
const CATCH_ZONE = [40, 60]
const WAIT_LOW = 3000
const WAIT_MEDIUM = 500
const WAIT_HIGH = 0
const KEY_SPACE = ' '

export default {
  name: 'FishingMinigame',
  props: {
    type: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      indicatorPos: 0,
      direction: 1,
      timer: null,
      caught: false,
      readyToCatch: false
    }
  },
  mounted() {
    let waitTime = WAIT_LOW
    if (this.type === 'medium') waitTime = WAIT_MEDIUM
    else if (this.type === 'high') waitTime = WAIT_HIGH

    setTimeout(() => {
      this.readyToCatch = true
    }, waitTime)

    this.timer = setInterval(this.moveIndicator, INDICATOR_STEP_MS)
    window.addEventListener('keydown', this.onSpace)
  },
  methods: {
    moveIndicator() {
      if (!this.readyToCatch) return

      this.indicatorPos += SPEED * this.direction
      if (this.indicatorPos >= 100) {
        this.indicatorPos = 100
        this.direction = -1
      } else if (this.indicatorPos <= 0) {
        this.indicatorPos = 0
        this.direction = 1
      }
    },
    onSpace(event) {
      if (event.key !== KEY_SPACE) return
      this.tryCatch()
    },
    tryCatch() {
      if (!this.readyToCatch || this.caught) return

      this.caught = true
      const [min, max] = CATCH_ZONE
      const success = this.indicatorPos >= min && this.indicatorPos <= max
      if(success){
        const caughtFish = getRandomFish()
        this.$store.dispatch('addFish',caughtFish )
      }
      this.$emit('catch', success)
    }
  },
  beforeUnmount() {
    clearInterval(this.timer)
    window.removeEventListener('keydown', this.onSpace)
  }
}
</script>

<style scoped>
.minigame {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 60px;
  height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
}

.minigame__bar-container {
  position: relative;
  width: 20px;
  height: 100%;
  background: linear-gradient(to bottom, #4aa1f3 0%, #0f1c3d 100%);
  border-radius: 5px;
  overflow: hidden;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.5);
}

.minigame__catch-zone {
  position: absolute;
  top: 40%;
  height: 20%;
  width: 100%;
  background: rgba(0, 255, 0, 0.5);
  border-radius: 5px;
}

.minigame__indicator {
  position: absolute;
  left: 0;
  width: 100%;
  height: 5%;
  background: #ff3b3b;
  border-radius: 3px;
  box-shadow: 0 0 5px #ff6666;
  transition: top 0.01s linear;
}
</style>