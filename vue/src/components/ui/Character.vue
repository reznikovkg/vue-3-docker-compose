<template>
  <div class="character" :class="`character--${variant}`" :style="styles">
  </div>
</template>

<script lang="ts">
export default {
  name: 'Character',
  props: {
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    },
    color: {
      type: String,
      default: 'rgb(171, 17, 17)'
    },
    variant: {
      type: String,
      default: 'enemy',
    }
  },
  computed: {
    styles () {
      return {
        left: `${this.x}%`,
        top: `${this.y}%`,
        backgroundColor: this.color
      }
    }
  },
}

</script>

<style scoped lang="scss">
.character {
  position: absolute;
  transform: translate(-50%, -50%);
  border-radius: 50%;

  &--enemy {
    width: 30px;
    height: 30px;
  }

  &--ally {
    width: 35px;
    height: 35px;
  }
}
</style>