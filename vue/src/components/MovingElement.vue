<template>
  <div :class="`c-moving-element c-moving-element--${type}`">
    <transition :name="`move--${direction}`">
      <div
        v-if="show"
        class="c-moving-element__content"
        :key="keyValue"
      >
        <slot>{{ defaultEmoji }}</slot>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'MovingElement',
  props: {
    show: {
      type: Boolean,
      default: true
    },
    type: {
      type: String,
      required: true,
      validator: (value) => ['cloud', 'spark'].includes(value)
    },
    direction: {
      type: String,
      default: null
    },
    keyValue: {
      type: [Number, String],
      default: null
    },
    defaultEmoji: {
      type: String,
      default: '☁️'
    }
  }
}
</script>

<style lang="scss" scoped>
.c-moving-element {
  display: contents;
  &--cloud {
    .c-moving-element__content {
      z-index: 9;
    }
  }
  &--spark {
    .c-moving-element__content {
      z-index: 11;
    }
  }
  &__content {
    font-size: 40px;
    line-height: 1;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
}
</style>