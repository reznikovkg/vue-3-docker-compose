<template>
  <div class="map" :style="mapStyle">
    <div class="map__area" v-for="area in getReversedAreas" :class="'map__area--' + area.type" :style="areaStyle(area)"/>
  </div>
  <div class="water"/>
  <Boat/>
  <BottomInventory/>
  <Location/>
  <MiniGame/>
  <Shop v-if="getIsShopping"/>
  <SideInventory/>
</template>

<script>
import Boat from './../ui/Boat.vue'
import BottomInventory from './../ui/BottomInventory.vue'
import Location from './../ui/Location.vue'
import MiniGame from './../ui/MiniGame.vue'
import Shop from './../ui/Shop.vue'
import SideInventory from './../ui/SideInventory.vue'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'IndexPage',
  components: {
    Boat,
    BottomInventory,
    Location,
    MiniGame,
    Shop,
    SideInventory
  },
  data() {
    return {
      pressed: {
        ArrowUp: false,
        ArrowDown: false,
        ArrowRight: false,
        ArrowLeft: false
      },
      center: {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      },
      lastCheck: {
        x: 0,
        y: 0
      }
    }
  },
  mounted() {
    window.addEventListener('keydown', this.movingKeyDown)
    window.addEventListener('keyup', this.movingKeyUp)
    window.addEventListener('resize', this.updateCenter)
    this.updateMoving()
    this.updateCenter()
    this.startArea()
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.movingKeyDown)
    window.removeEventListener('keyup', this.movingKeyUp)
    window.removeEventListener('resize', this.updateCenter)
  },
  computed: {
    ...mapGetters([
      'getBoat',
      'getIsFishing',
      'getIsHooked',
      'getIsBroken',
      'getAreas',
      'getIsShopping'
    ]),
    mapStyle() {
      return {
        transform: 'translate(' + (this.center.x - this.getBoat.x) + 'px, ' + (this.center.y - this.getBoat.y) + 'px)'
      }
    },
    getReversedAreas() {
      return this.getAreas.slice().reverse()
    }
  },
  methods: {
    ...mapActions([
      'move',
      'setMoving',
      'startArea',
      'relocateDistantAreas'
    ]),
    areaStyle(area) {
      return {
        left: (area.x - area.radius) + 'px',
        top: (area.y - area.radius) + 'px',
        width: (area.radius * 2) + 'px',
        height: (area.radius * 2) + 'px'
      }
    },
    updateMoving() {
      if(!this.getIsFishing && !this.getIsHooked && !this.getIsBroken && !this.getIsShopping) {
        let x = 0, y = 0
        if(this.pressed.ArrowDown) {
          y += 1
        }
        if(this.pressed.ArrowUp) {
          y -= 1
        }
        if(this.pressed.ArrowRight) {
          x += 1
        }
        if(this.pressed.ArrowLeft) {
          x -= 1
        }
        if(x !== 0 || y !== 0) {
          if(Math.abs(this.getBoat.x - this.lastCheck.x) > 500 || Math.abs(this.getBoat.y - this.lastCheck.y) > 500) {
            this.relocateDistantAreas()
            this.lastCheck.x = this.getBoat.x
            this.lastCheck.y = this.getBoat.y
          }
          this.move({px: x, py: y})
        }
        else {
          this.setMoving(false)
        }
      }
      else {
        this.setMoving(false)
      }
      requestAnimationFrame(this.updateMoving)
    },
    updateCenter() {
      this.center.x = window.innerWidth / 2
      this.center.y = window.innerHeight / 2
    },
    movingKeyDown(event) {
      if(this.pressed.hasOwnProperty(event.code)) {
        this.pressed[event.code] = true
      }
    },
    movingKeyUp(event) {
      if(this.pressed.hasOwnProperty(event.code)) {
        this.pressed[event.code] = false
      }
    }
  }
}
</script>

<style scoped lang="scss">
.map {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;

  &__area {
    position: absolute;
    border-radius: 50%;

    &--medium {
      background-color: rgba(25, 80, 80, 0.5);
    }

    &--high {
      background-color: rgba(25, 10, 10, 0.5);
    }

    &--shallow {
      background-color: rgba(165, 165, 40, 0.5);
    }

    &--island {
      background-color: rgb(165, 165, 40);
    }
  }
}

.water {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgb(25, 120, 120);
  z-index: 0;
}
</style>
