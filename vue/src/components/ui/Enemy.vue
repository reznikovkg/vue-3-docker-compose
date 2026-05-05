<template>
  <div class="enemy" :style="styles">
    Enemy
  </div>
</template>

<script>
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
    type: {
      type: String,
      default: "warrior"
    }
  },
  computed: {
    styles () {
      let color = "#1c2780"
      if (this.type === "archer") {
        color = "#eca740"
      }
      else if (this.type === "tank") {
        color = "#dd496e"
      }
      return {
        transform: `translate(-50%, -50%) translateX(${this.x}px) translateY(${this.y}px)`,
        background: color
      }
    }
  }
}
</script>

<style scoped lang="scss">
.enemy {
  position: absolute;
  border-radius: 50%;
  width: 52px;
  height: 52px;
  transition: 0.1s;
  text-align: center;
}
</style>
