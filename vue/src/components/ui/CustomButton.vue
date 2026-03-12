<template>
  <button
    class="custom-btn"
    :class="[`custom-btn--${variant}`, { 'custom-btn--disabled': disabled }]"
    :disabled="disabled"
    @click="(e) => $emit('click', e)"
  >
    <slot />
  </button>
</template>

<script>
export default {
  name: 'CustomButton',
  emits: ['click'],

  props: {
    variant: {
      type: String,
      default: 'primary',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style lang="scss" scoped>
.custom-btn {
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  width: 100%;

  &--primary {
    background: #0f3460;
    color: #fff;
    &:hover:not(:disabled) { background: #1a4e8a; }
  }

  &--upgrade {
    background: #1a5c1a;
    color: #aaffaa;
    &:hover:not(:disabled) { background: #226622; }
  }

  &--danger {
    background: #4a1010;
    color: #ffaaaa;
    &:hover:not(:disabled) { background: #6a1818; }
  }

  &--small {
    padding: 5px 10px;
    font-size: 0.78rem;
    width: auto;
    background: #0f3460;
    color: #fff;
    &:hover:not(:disabled) { background: #1a4e8a; }
  }

  &--danger-small {
    padding: 3px 8px;
    font-size: 0.75rem;
    width: auto;
    background: #4a1010;
    color: #ffaaaa;
    &:hover:not(:disabled) { background: #6a1818; }
  }

  &--disabled,
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}
</style>
