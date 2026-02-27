<template>
  <div
    class="rod-view"
    :class="`rod-view--${rodState}`"
    :style="{
      left: `${position.x}%`,
      top: `${position.y}%`,
    }"
  >
    <div class="rod-view__body"></div>
    <div class="rod-view__tip"></div>
  </div>
</template>

<script>
export default {
  name: 'RodView',
  props: {
    rodState: {
      type: String,
      default: 'idle',
    },
    position: {
      type: Object,
      default: () => ({
        x: 10,
        y: 26,
      }),
    },
  },
};
</script>

<style scoped lang="scss">
.rod-view {
  height: 10px;
  position: absolute;
  transform-origin: left center;
  transition: transform 0.2s ease;
  width: 150px;
}

.rod-view__body {
  background: linear-gradient(90deg, #241406, #553520 70%, #b9906f);
  border-radius: 999px;
  height: 4px;
  left: 0;
  position: absolute;
  top: 3px;
  width: 100%;
}

.rod-view__tip {
  background: #c7d2df;
  border-radius: 999px;
  height: 5px;
  position: absolute;
  right: -2px;
  top: 2px;
  width: 10px;
}

.rod-view--idle {
  transform: rotate(-7deg);
}

.rod-view--cast {
  transform: rotate(10deg);
}

.rod-view--tension {
  transform: rotate(4deg);
}
</style>
