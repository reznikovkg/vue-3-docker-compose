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
      default: false
    },
    type: {
      type: String,
      default: 'button'
    }
  }
}
</script>

<style scoped lang="scss">
.base-button {
  background: #e6ecf4;
  border: 1px solid #9da8b7;
  border-radius: 8px;
  color: #394555;
  cursor: pointer;
  font-size: 14px;
  padding: 8px 12px;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
}
</style>
