<template>
  <div
    class="flask-container"
  >
    <div
      class="flask"
      :class="{ selected: isSelected }"
    >
      <div
        v-for="layer in layers"
        class="liquid"
        :style="{ height: layer.percent + '%', backgroundColor: layer.color }"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Flask',
  props: {
    layers: {
      type: Array,
      default: () => []
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
$border-color: #f0f0f0;
$selected-color: gold;
$backcolor: #333;

.flask-container {
  display: inline-block;
  margin: 10px;
}

.flask {
  width: 80px;
  height: 200px;
  border: 3px solid $border-color;
  border-radius: 0 0 30px 30px;
  border-top: none;
  position: relative;
  background-color: $backcolor;
  overflow: hidden;
  display: flex;
  flex-direction: column-reverse;
}

.liquid {
  width: 100%;
  transition: height 0.2s ease;
}

.flask.selected {
  border-color: $selected-color;
  box-shadow: 0 0 10px $selected-color;
  transform: scale(1.02);
  transition: all 0.2s ease;
}
</style>