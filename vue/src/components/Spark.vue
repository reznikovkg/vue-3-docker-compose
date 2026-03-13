<template>
  <div class="c-spark">
    <transition :name="`move--${sparkDirection}`">
      <div
        v-if="showSpark"
        class="c-spark__element"
        :key="`${sparkId}-${sparkIndex}`"
      >
        <slot>💥</slot>
      </div>
    </transition>
  </div>
</template>
<script>
export default {
  name: 'Spark',
  props: {
    showSpark: { type: Boolean, default: true },
    sparkIndex: { type: Number, required: true },
    sparkDirection: { type: String, required: true },
    sparkId: { type: [Number, String], required: true }
  },
  emits: []
}
</script>
<style lang="scss" scoped>
.c-spark {
  display: contents; 
  &__element {
    font-size: 40px;
    line-height: 1;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 11;
    pointer-events: none;
  }
}
</style>