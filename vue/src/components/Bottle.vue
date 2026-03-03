<template>
  <button
    ref="bottleButton"
    class="bottle"
    :class="{ 'bottle--selected': isSelected }"
    @click="() => handleClick()"
  >
    <div class="bottle__layers">
      <div
        v-for="(layer, layerIndex) in bottle.layers"
        :key="layerIndex"
        class="bottle__layer"
        :style="{
          height: layer.amount + '%',
          backgroundColor: layer.color,
        }"
      >
        <span>{{ layer.amount }}%</span>
      </div>
    </div>
  </button>
</template>

<script>
export default {
  name: 'BottleItem',
  props: {
    bottle: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['select'],
  methods: {
    handleClick() {
      this.$emit('select', this.index)
    }
  }
}
</script>

<style scoped lang="scss">
.bottle {
  width: 120px;
  height: 260px;
  padding: 0;
  border: 2px solid rgb(40, 40, 40);
  border-top: 0;
  border-bottom-left-radius: 18px;
  border-bottom-right-radius: 18px;
  background: white;
  overflow: hidden;
  box-sizing: border-box;
  appearance: none;
  cursor: pointer;

  &--selected {
    border-color: black;
    box-shadow: 0 0 4px 4px rgb(143, 143, 143);
  }

  &__layers {
    height: 100%;
    display: flex;
    flex-direction: column-reverse;
  }

  &__layer {
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 1);
    font-weight: 700;
    font-size: 14px;
    text-shadow: 1px 1px 5px black;
  }
}
</style>
