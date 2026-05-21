<template>
  <div class="game">
    <div class="game__bar">
      <div class="game__bar__target" v-if="getIsGaming" :style="targetStyle"/>
      <div class="game__bar__player" v-if="getIsGaming" :style="{ top: playerPosition + '%' }"/>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'MiniGame',
  data() {
    return {
      baitKeyIndex: {
        KeyZ: 0,
        KeyX: 1,
        KeyC: 2
      },
      targetPosition: 10,
      playerPosition: 0,
      playerSpeed: 2,
      playerDelay: 0,
      direction: 1,
      winCount: 0,
      fightCount: 0,
      timeout: null,
      interval: null
    }
  },
  mounted() {
    window.addEventListener('keydown', this.checkKeyDown)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.checkKeyDown)
  },
  computed: {
    ...mapGetters([
      'getIsFishing',
      'getIsGaming',
      'getIsHooked',
      'getIsBroken',
      'getIsFighting',
      'getIsNight',
      'getCurrentFish',
      'getActiveTacklesInfo',
      'getFeedInfo',
      'getActiveBaitInfo',
      'getCurrentAreaInfo'
    ]),
    targetStyle() {
      return {
        top: this.targetPosition + '%',
        backgroundColor: this.getIsFighting ? 'rgb(155, 0, 40)' : 'rgb(46, 139, 87)'
      }
    }
  },
  methods: {
    ...mapActions([
      'setFishing',
      'setGaming',
      'setHooked',
      'setBroken',
      'setFighting',
      'setShopping',
      'fightResult',
      'setCurrentFish',
      'addCurrentFish',
      'changeFeedCount',
      'setActiveBait',
      'relocateCurrentArea',
      'relocateMaxDistanceAreaToBoat'
    ]),
    startGaming() {
      if(this.getIsFighting) {
        this.playerDelay = 0
      }
      else {
        this.setCurrentFish()
        this.playerDelay = (!this.getCurrentAreaInfo ? 2500 : (this.getCurrentAreaInfo.area.type === 'medium' ? 1000 : 0))
        if(this.getIsNight) {
          this.playerDelay = Math.max(this.playerDelay * 2, 500)
        }
      }
      this.timeout = setTimeout(() => {
        this.playerSpeed =  this.getIsFighting ? 3 : Math.max(Math.min(Math.floor(this.getCurrentFish.weight / this.getActiveTacklesInfo.totalLevel), 17), 1)
        this.setGaming(true)
        this.direction = 1
        this.playerPosition = 0
        this.targetPosition = Math.floor(Math.random() * 81) + 10
      }, this.playerDelay)
      this.interval = setInterval(() => {
        this.playerPosition += this.direction * this.playerSpeed
        if(this.playerPosition <= 0) {
          this.playerPosition = 0
          this.direction = 1
        }
        else if(this.playerPosition >= 100) {
          this.playerPosition = 100
          this.direction = -1
        }
      }, 10)
    },
    stopGaming() {
      this.setGaming(false)
      clearTimeout(this.timeout)
      clearInterval(this.interval)
    },
    stopFighting() {
      this.fightResult(this.winCount)
      this.fightCount = 0
      this.winCount = 0
      this.setFighting(false)
    },
    checkKeyDown(event) {
      if(!this.getIsHooked && !this.getIsBroken) {
        if(this.baitKeyIndex.hasOwnProperty(event.code) && !this.getIsFishing) {
          this.setActiveBait(this.baitKeyIndex[event.code])
        }
        else if(event.code === 'KeyV' && !this.getIsFishing) {
          if(this.getFeedInfo.feed.count > 0 && !this.getCurrentAreaInfo) {
            this.relocateMaxDistanceAreaToBoat('medium')
            this.changeFeedCount(-1)
          }
          else if(this.getFeedInfo.feed.count > 2 && this.getCurrentAreaInfo.area.type === 'medium') {
            this.relocateCurrentArea()
            this.relocateMaxDistanceAreaToBoat('high')
            this.changeFeedCount(-3)
          }
        }
        else if(event.code === 'Space') {
          if(!this.getIsFighting && this.getCurrentAreaInfo && this.getCurrentAreaInfo.area.type === 'shallow') {
            this.setShopping()
          }
          else {
            this.setFishing()
            if(this.getIsFishing) {
              if(!this.getIsFighting && (this.getActiveBaitInfo.bait.count <= 0 || this.getActiveTacklesInfo.totalLevel === 0)) {
                this.setFishing()
              }
              else {
                this.startGaming()
              }
            }
            else if(this.getIsGaming && Math.abs(this.targetPosition - this.playerPosition) <= 5) {
              this.stopGaming()
              if(this.getIsFighting) {
                this.fightCount++
                this.winCount++
                if(this.fightCount >= 3) {
                  this.stopFighting()
                }
              }
              else {
                this.setHooked()
                setTimeout(() => {
                  this.relocateCurrentArea()
                  this.addCurrentFish()
                  this.setHooked()
                }, 1000)
              }
            }
            else {
              this.stopGaming()
              if(this.getIsFighting) {
                this.fightCount++
                if(this.fightCount >= 3) {
                  this.stopFighting()
                }
              }
              else {
                this.setBroken()
                setTimeout(() => {
                  this.setBroken()
                }, 800)
              }
            }
          }
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
  z-index: 3;

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
