<template>
  <button class="base-button" :type="type" :disabled="disabled">
    <slot />
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'button',
    },
  },
}
</script>

<style scoped lang="scss">
@use '@/styles/mixins' as mixins;
@use '@/styles/tokens' as tokens;

.base-button {
  background: tokens.$button-soft-background;
  border: 1px solid tokens.$button-soft-border;
  border-radius: tokens.$button-soft-border-radius;
  color: tokens.$button-soft-text;
  cursor: pointer;
  font-size: tokens.$button-soft-font-size;
  line-height: tokens.$button-soft-line-height;
  padding: tokens.$button-soft-padding-y tokens.$button-soft-padding-x;
  transition:
    background-color tokens.$button-soft-transition-duration ease,
    border-color tokens.$button-soft-transition-duration ease,
    transform tokens.$button-soft-press-duration ease;

  &:hover {
    background: tokens.$button-soft-background-hover;
  }

  &:active {
    transform: translateY(tokens.$button-soft-active-offset);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: tokens.$button-soft-disabled-opacity;
  }

  &:focus-visible {
    @include mixins.focus-ring(tokens.$button-soft-focus);
  }
}
</style>
