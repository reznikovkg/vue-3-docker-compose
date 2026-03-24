<template>
  <div 
    class="zone"
    :class="`zone--${zone.type}`"
    :style="styleObject"
  ></div>
</template>

<script>
export default {
  name: 'Zone',
  props: {
    zone: Object,
    boat: Object
  },
  computed: {
    styleObject() {
      const offsetX = this.zone.x - this.boat.x
      const offsetY = this.zone.y - this.boat.y

      return {
        left: `calc(50% + ${offsetX}px)`,
        top: `calc(50% + ${offsetY}px)`,
        width: `${this.zone.radius * 2}px`,
        height: `${this.zone.radius * 2}px`
      }
    }
  }
}
</script>

<style scoped>
.zone {
  position: absolute;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  opacity: 0.3;
  pointer-events: none;
}


.zone--medium {
  background: yellow;
}

.zone--high {
  background: red;
}
</style>