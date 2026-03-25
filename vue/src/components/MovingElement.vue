<template>
  <div :class="`c-moving-element c-moving-element--${elementData.type}`">
    <transition name="c-moving-element__fade">
      <div class="c-moving-element__content">
        <Element
          :type="elementData.type"
          :emoji="elementData.customEmoji"
        />
      </div>
    </transition>
  </div>
</template>

<script>
import Element from './Element.vue'
export default {
    name: 'MovingElement',
    components: {
      Element
  },
  props: {
    elementData: {
      type: Object,
      required: true,
      validator: (value) => {
        return value && 
               ['cloud', 'spark'].includes(value.type)
      }
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
.c-moving-element__fade-enter-active,
.c-moving-element__fade-leave-active {
  transition: opacity 0.2s ease;
}
.c-moving-element__fade-enter-from,
.c-moving-element__fade-leave-to {
  opacity: 0;
}
</style>