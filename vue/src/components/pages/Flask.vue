<template>
  <div
    class="flask"
    :class="{
      'flask--selected': isSelected,
      'flask--blocked': isBlocked
    }"
    draggable="true"
    @click="() => handleClick()"
    @dragstart="() => handleDragStart()"
    @dragover.prevent
    @drop="(event) => handleDrop(event)"
  >
    <div
      v-for="(layer, index) in layers"
      :key="index"
      class="flask__layer"
      :style="{ background: layer, height: layerHeight + '%' }"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'Flask',

  props: {
    layers: { type: Array, required: true },
    maxLayers: { type: Number, required: true },
    isSelected: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false }
  },

  emits: ['select', 'dragStart', 'dropFlask'],

  computed: {
    layerHeight () {
      return 100 / this.maxLayers
    }
  },

  methods: {
    handleClick () {
      this.$emit('select')
    },

    handleDragStart () {
      this.$emit('dragStart')
    },

    handleDrop (event) {
      const width = event.currentTarget.offsetWidth
      const place = event.offsetX < width / 2 ? 'left' : 'right'

      this.$emit('dropFlask', place)
    }
  }
}
</script>

<style scoped lang="scss">
.flask {
  width: 60px;
  height: 200px;
  border: 2px solid black;
  margin: 0 10px;
  display: flex;
  flex-direction: column-reverse;
  cursor: pointer;

  &--selected {
    border: 2px solid red;
  }

  &--blocked {
    border: 2px solid gray;
    opacity: 0.6;
  }

  &__layer {
    width: 100%;
  }
}
</style>