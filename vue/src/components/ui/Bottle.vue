<template>
  <div :class = "bottleClasses" @click = "() => onClick()">
    <div class = "bottle__inner">
      <div
        v-for = "(color, index) in displayLayers" :key = "index"
        class = "bottle__layer"
        :style = "{
          backgroundColor: color,
          height: layerHeight + '%'
          }"
      ></div>
    </div>
  </div>
</template>

<script>

export default {
  name: "Bottle",
  props: {
    layers: {
      type: Array,
      default: () => []
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    maxLayers: {
      type: Number,
      default: 4
    }
  },
  emits: ['select'],
  computed: {
    bottleClasses() {
      return ['bottle', { 'bottle--selected': this.isSelected }]
    },
    layerHeight() {
      return 100 / this.maxLayers
    },
    displayLayers() {
      return [...this.layers].reverse()
    }
  },
  methods: {
    onClick() {
      this.$emit('select')
    }
  }
}
</script>

<style scoped lang = "scss">
.bottle {
  width: 60px;
  height: 180px;
  border: 4px solid gray;
  border-top: none;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  cursor: pointer;
  transition: transform 0.2s;
  overflow: hidden; // Чтобы слои не выходили за скругления дна

  &--selected {
    transform: translateY(-20px);
    border-color: #F4A900;
  }

  &__inner {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    height: 100%;
  }

  &__layer {
    width: 100%;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }
}
</style>