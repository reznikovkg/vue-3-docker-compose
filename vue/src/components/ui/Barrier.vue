<template>
  <div class="barrier" :style="styles">
    <div class="barrier__hp" :style="hpStyles"></div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'Barrier',
  props: {
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    },
    angle: {
      type: Number,
      default: 0,
    },
    stats: {
      type: Object,
      default: {hp: 0, cost: 0}
    },
  },
  data () {
    return {
      
    }
  },
  computed: {
    styles () {
      return {
        left: `${this.x}%`,
        top: `${this.y}%`,
        transform: `translate(-50%, -50%) rotate(${this.angle}deg)`
      }
    },
    hpPercent() {
      return (this.stats.currentHp / this.stats.maxHp) * 100
    },
    hpStyles () {
      return {
        width: this.hpPercent + '%',
        backgroundColor: this.hpPercent > 50 ? 'rgb(27, 224, 17)' : 'rgb(224, 33, 23)'
      }
    }
  },
  methods: {
   
  }
}
</script>

<style scoped lang="scss">
.barrier {
  position: absolute;
  width: 30px;
  height: 60px;
  border-radius: 20%;
  background-color: rgb(113, 55, 20);

  &__hp {
    position: absolute;
    bottom: -8px;
    left: 0;
    height: 6px;
    transition: width 0.1s;
  }
}
</style>