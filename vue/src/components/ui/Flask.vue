<template>
  <div class="flask" @click="() => handleClick()">
    <div class="flask__layers">
      <div
        v-for="(layer, index) in layers"
        :key="index"
        :style="{ backgroundColor: layer }"
        class="flask__block"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Flask",
  props: {
    layersCount: {
      type: Number,
      required: true
    },
    layers: {
      type: Array,
      required: true
    },
    isSelected: {
      type: Boolean,
      required: true
    }
  },
  emits: ["onSelect"],
  methods: {
    handleClick() {
      this.$emit("onSelect")
    }
  }
}
</script>
<style scoped lang="scss">
.flask {
  position: relative;
  height: 250px;
  width: 50px;
  border: 3px solid white;
  border-top: none;
  border-bottom-left-radius: 50px;
  border-bottom-right-radius: 50px;
  cursor: pointer;
  overflow: hidden;
  transition: 0.3s;
  transform: v-bind('isSelected ? "translateY(-20px)" : "none"');

  &__layers {
    position: absolute;
    bottom: 0;
    display: grid;
    height: 90%;
    width: 100%;
    rotate: 180deg;
    grid-template-rows: v-bind("`repeat(${layersCount}, 1fr)`");
  }

  &__block {
    height: 100%;
    width: 100%;
  }
}
</style>
