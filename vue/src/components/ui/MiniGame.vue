<template>
  <div class="game">
    <div class="game__bar">
      <div class="game__bar__target" v-if="getIsGaming" :style="{ top: targetPosition + '%' }"/>
      <div class="game__bar__player" v-if="getIsGaming" :style="{ top: playerPosition + '%' }"/>
    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'

export default {
  name: 'MiniGame',
  data() {
    return {
      targetPosition: 10,
      playerPosition: 0,
      playerSpeed: 2,
      playerDelay: 0,
      direction: 1,
      timeout: null,
      interval: null
    }
  },
  mounted() {
    window.addEventListener('keydown', this.fishingKeyDown)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.fishingKeyDown)
  },
  computed: {
    ...mapGetters([
      'getIsFishing',
      'getIsGaming',
      'getIsHooked',
      'getIsBroken'
    ])
  },
  methods: {
    ...mapActions([
      'setFishing',
      'setGaming',
      'setHooked',
      'setBroken',
      'addFish'
    ]),
    startFishing() {
      this.timeout = setTimeout(() => {
        this.setGaming(true)
        this.direction = 1
        this.playerPosition = 0
        this.targetPosition = Math.floor(Math.random() * (90 - 10 + 1)) + 10
      }, this.playerDelay)
      this.interval = setInterval(() => {
        this.playerPosition += this.direction * this.playerSpeed
        if(this.playerPosition <= 0 || this.playerPosition >= 100)
          this.direction *= -1
      }, 20)
    },
    stopFishing() {
      this.setGaming(false)
      clearTimeout(this.timeout)
      clearInterval(this.interval)
    },
    fishingKeyDown(event) {
      if (event.key === ' ' && !this.getIsHooked && !this.getIsBroken) {
        this.setFishing()
        if(this.getIsFishing)
          this.startFishing()
        else if(this.getIsGaming && Math.abs(this.targetPosition - this.playerPosition) <= 5) {
          this.stopFishing()
          this.setHooked()
          setTimeout(() => {
            this.addFish()
            this.setHooked()
          }, 1000)
        }
        else {
          this.stopFishing()
          this.setBroken()
          setTimeout(() => {
            this.setBroken()
          }, 800)
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.game {
  position: absolute;
  overflow: hidden;
  width: 75px;
  height: 450px;
  top: 50%;
  left: 25px;
  border: 4px solid black;
  border-radius: 20px;
  padding: 13px;
  box-shadow:
    4px 4px rgba(0, 0, 0, 0.4),
    6px 6px rgba(0, 0, 0, 0.2);
  transform: translateY(-50%);
  z-index: 2;

  &__bar {
    position: relative;
    width: 100%;
    height: 100%;
    border: 3px solid black;
    border-radius: 20px;
    background-color: rgba(245, 222, 179, 0.75);

    &__target {
      position: absolute;
      width: 100%;
      height: 12%;
      transform: translateY(-50%);
      background-color: seagreen;
    }

    &__player {
      position: absolute;
      width: 200%;
      height: 1.8%;
      border: 2px solid black;
      transform: translate(-25%, -50%);
      background-color: white;
    }
  }
}
</style>
