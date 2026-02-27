<template>
  <div
    class="bobber-view"
    :class="{ 'bobber-view--active': isActive }"
    :style="{
      left: `${position.x}%`,
      top: `${position.y}%`,
    }"
  ></div>
</template>

<script>
export default {
  name: 'BobberView',
  props: {
    isActive: {
      type: Boolean,
      default: false,
    },
    position: {
      type: Object,
      default: () => ({
        x: 40,
        y: 56,
      }),
    },
  },
};
</script>

<style scoped lang="scss">
.bobber-view {
  background: radial-gradient(circle at 30% 30%, #ffffff 1px, #d32f2f 60%);
  border: 1px solid #7f1212;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.24);
  height: 14px;
  position: absolute;
  transform: translate(-50%, -50%);
  transition: transform 0.2s ease;
  width: 14px;
}

.bobber-view--active {
  animation: bobber-pulse 0.8s ease-in-out infinite alternate;
}

@keyframes bobber-pulse {
  from {
    transform: translate(-50%, -48%);
  }
  to {
    transform: translate(-50%, -52%);
  }
}
</style>
