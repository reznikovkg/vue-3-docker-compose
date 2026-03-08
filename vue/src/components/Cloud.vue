<template>
  <div class="c-cloud">
    <transition :name="`move--${getCloudDirection}`">
      <div
        v-if="showCloud"
        class="c-cloud__element"
        :key="getCloudIndex"
      >
        <slot>☁️</slot>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Cloud',
  props: {
    showCloud: { type: Boolean, default: true }
  },
  emits: [],
  computed: {
    ...mapGetters('game', [
      'getCloudIndex',
      'getCloudDirection'
    ])
  },
  mounted() {},
  beforeUnmount() {},
  methods: {}
}
</script>

<style lang="scss" scoped>
.c-cloud {
  display: contents; 
  
  &__element {
    font-size: 40px;
    line-height: 1;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9;
    pointer-events: none;
  }
}
</style>