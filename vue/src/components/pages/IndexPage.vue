<template>
  <div class="map" :style="mapStyle">
    <div v-for="area in getReversedAreas" class="map__area" :style="areaStyle(area)"></div>
  </div>
  <div class="water"/>
  <Boat/>
  <Inventory/>
  <Location/>
  <MiniGame/>
</template>

<script>
import Boat from './../ui/Boat.vue'
import Inventory from './../ui/Inventory.vue'
import Location from './../ui/Location.vue'
import MiniGame from './../ui/MiniGame.vue'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'IndexPage',
  components: {
    Boat,
    Inventory,
    Location,
    MiniGame
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
      'getIsFishing',
      'getIsHooked',
      'getIsBroken',
      'getBoat',
      'getAreas'
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
        height: (area.radius * 2) + 'px',
        backgroundColor: area.type === 'high' ? 'rgba(25, 10, 10, 0.5)' : (area.type === 'medium' ? 'rgba(25, 80, 80, 0.5)' : (area.type === 'shallow' ? 'rgba(165, 165, 40, 0.5)' : 'rgb(165, 165, 40)'))
      }
    },
    updateMoving() {
      if(!this.getIsFishing && !this.getIsHooked && !this.getIsBroken) {
        let x = 0, y = 0
        if(this.pressed.ArrowDown)
          y += 1
        if(this.pressed.ArrowUp)
          y -= 1
        if(this.pressed.ArrowRight)
          x += 1
        if(this.pressed.ArrowLeft)
          x -= 1
        if(x !== 0 || y !== 0) {
          if(Math.abs(this.getBoat.x - this.lastCheck.x) > 500 || Math.abs(this.getBoat.y - this.lastCheck.y) > 500) {
            this.relocateDistantAreas()
            this.lastCheck.x = this.getBoat.x
            this.lastCheck.y = this.getBoat.y
          }
          this.move({px: x, py: y})
        }
        else
          this.setMoving(false)
      }
      else
        this.setMoving(false)
      requestAnimationFrame(this.updateMoving)
    },
    updateCenter() {
      this.center.x = window.innerWidth / 2
      this.center.y = window.innerHeight / 2
    },
    movingKeyDown(event) {
      if(this.pressed.hasOwnProperty(event.key))
        this.pressed[event.key] = true
    },
    movingKeyUp(event) {
      if(this.pressed.hasOwnProperty(event.key))
        this.pressed[event.key] = false
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
