<template>
  <div class="minigame">
    <div class="minigame__bar-container">
      <div class="minigame__catch-zone" :style="catchZoneStyle"></div>
      <div class="minigame__indicator" :style="{ top: indicatorPos + '%' }"></div>
    </div>
  </div>
</template>

<script>
import { getFishByBait } from '@/fish'
import { mapActions, mapGetters, mapState } from 'vuex'
const SPEED = 0.5
const INDICATOR_STEP_MS = 10
const BASE_CATCH_GAP = 10
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
      fish: null,
      indicatorPos: 0,
      direction: 1,
      timer: null,
      caught: false,
      readyToCatch: false
    }
  },
  computed: {
    ...mapState(['selectedBaitId']),
    ...mapGetters(['getFishingPower']),

    effectiveGap() {
      if (!this.fish) return

      return BASE_CATCH_GAP * Math.sqrt(this.getFishingPower / this.fish.mass)
    },

    catchZoneStyle() {
      const top = 50 - this.effectiveGap
      const height = this.effectiveGap * 2
      return {
        top: `${top}%`,
        height: `${height}%`
      }
    }
  },

  mounted() {
    let waitTime = WAIT_LOW
    if (this.type === 'medium') waitTime = WAIT_MEDIUM
    else if (this.type === 'high') waitTime = WAIT_HIGH
    waitTime /= Math.sqrt(this.getFishingPower)
    
    this.fish = getFishByBait(this.selectedBaitId)

    setTimeout(() => {
      this.readyToCatch = true
    }, waitTime)

    this.timer = setInterval(this.moveIndicator, INDICATOR_STEP_MS)
    window.addEventListener('keydown', this.onSpace)
  },

  methods: {
    moveIndicator() {
      if (!this.readyToCatch)
        return

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
      if (event.key !== KEY_SPACE)
        return
      this.tryCatch()
    },

    tryCatch() {
      if (!this.readyToCatch || this.caught)
        return
      this.caught = true

      const min = 50 - this.effectiveGap
      const max = 50 + this.effectiveGap
      const success = this.indicatorPos >= min && this.indicatorPos <= max
      if (!success) {
        this.fish = null
      }
      console.log(`IN EMIT ${success}`)
      this.$emit('catch', { success, fish: this.fish })
    }
  },

  beforeUnmount() {
    clearInterval(this.timer)
    window.removeEventListener('keydown', this.onSpace)
  }
}
</script>

<style scoped lang="scss">

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

  &__bar-container {
    position: relative;
    width: 20px;
    height: 100%;
    background: linear-gradient(to bottom, #4aa1f3 0%, #0f1c3d 100%);
    border-radius: 5px;
    overflow: hidden;
  }

  &__catch-zone {
    position: absolute;
    top: 40%;
    height: 20%;
    width: 100%;
    background: rgba(0, 255, 0, 0.5);
    border-radius: 5px;
  }

  &__indicator {
    position: absolute;
    left: 0;
    width: 100%;
    height: 5%;
    background: #ff3b3b;
    border-radius: 3px;
    box-shadow: 0 0 5px #ff6666;
    transition: top 0.01s linear;
  }
}
</style>