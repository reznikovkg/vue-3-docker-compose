<template>
  <button
    class="base-button base-button--soft"
    :type="type"
    :disabled="disabled"
  >
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
@use 'sass:map';
@use '@/styles/mixins' as mixins;
@use '@/styles/tokens' as tokens;

$base-soft-variant: map.get(tokens.$button-variants, 'soft');
$base-primary-variant: map.get(tokens.$button-variants, 'primary');
$base-ghost-variant: map.get(tokens.$button-variants, 'ghost');
$base-size-md: map.get(tokens.$button-sizes, 'md');
$base-size-sm: map.get(tokens.$button-sizes, 'sm');
$base-size-lg: map.get(tokens.$button-sizes, 'lg');

.base-button {
  background: map.get($base-soft-variant, 'background');
  border: 1px solid map.get($base-soft-variant, 'border');
  border-radius: tokens.$button-radius;
  color: map.get($base-soft-variant, 'text');
  cursor: pointer;
  font-size: map.get($base-size-md, 'font-size');
  line-height: tokens.$button-line-height;
  padding: map.get($base-size-md, 'padding-y')
    map.get($base-size-md, 'padding-x');
  transition:
    background-color tokens.$button-transition-duration ease,
    border-color tokens.$button-transition-duration ease,
    color tokens.$button-transition-duration ease,
    transform tokens.$button-press-duration ease;

  &:hover {
    background: map.get($base-soft-variant, 'background-hover');
  }

  &:active {
    transform: translateY(tokens.$button-press-offset);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: tokens.$button-disabled-opacity;
  }

  &:focus-visible {
    @include mixins.focus-ring(tokens.$button-focus-ring);
  }

  &--soft {
    background: map.get($base-soft-variant, 'background');
    border-color: map.get($base-soft-variant, 'border');
    color: map.get($base-soft-variant, 'text');

    &:hover {
      background: map.get($base-soft-variant, 'background-hover');
    }
  }

  &--primary {
    background: map.get($base-primary-variant, 'background');
    border-color: map.get($base-primary-variant, 'border');
    color: map.get($base-primary-variant, 'text');

    &:hover {
      background: map.get($base-primary-variant, 'background-hover');
    }
  }

  &--ghost {
    background: map.get($base-ghost-variant, 'background');
    border-color: map.get($base-ghost-variant, 'border');
    color: map.get($base-ghost-variant, 'text');

    &:hover {
      background: map.get($base-ghost-variant, 'background-hover');
    }
  }

  &--sm {
    font-size: map.get($base-size-sm, 'font-size');
    padding: map.get($base-size-sm, 'padding-y')
      map.get($base-size-sm, 'padding-x');
  }

  &--lg {
    font-size: map.get($base-size-lg, 'font-size');
    padding: map.get($base-size-lg, 'padding-y')
      map.get($base-size-lg, 'padding-x');
  }

  &--block {
    width: 100%;
  }
}
</style>
