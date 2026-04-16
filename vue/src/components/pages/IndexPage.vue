<template>
  <div class="map"/>
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
      }
    }
  },
  mounted() {
    window.addEventListener('keydown', this.movingKeyDown)
    window.addEventListener('keyup', this.movingKeyUp)
    this.updateMoving()
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.movingKeyDown)
    window.removeEventListener('keyup', this.movingKeyUp)
  },
  computed: {
    ...mapGetters([
      'getIsFishing',
      'getIsHooked',
      'getIsBroken'
    ])
  },
  methods: {
    ...mapActions([
      'move',
      'setMoving'
    ]),
    updateMoving() {
      let updMoving = false
      if(!this.getIsFishing && !this.getIsHooked && !this.getIsBroken) {
        let x = 0
        let y = 0
        if (this.pressed.ArrowUp) {
          y += 1
        }
        if (this.pressed.ArrowDown) {
          y -= 1
        }
        if (this.pressed.ArrowRight) {
          x += 1
        }
        if (this.pressed.ArrowLeft) {
          x -= 1
        }
        if (x !== 0 || y !== 0) {
          updMoving = true
          this.move({px: x, py: y})
        }
      }
      this.setMoving(updMoving)
        .then(() => this.updateMoving())
    },
    movingKeyDown (event) {
      if (this.pressed.hasOwnProperty(event.key)) {
        this.pressed[event.key] = true
      }
    },
    movingKeyUp (event) {
      if (this.pressed.hasOwnProperty(event.key)) {
        this.pressed[event.key] = false
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
  background-color: rgb(25, 120, 120);
  z-index: 1;
}
</style>
