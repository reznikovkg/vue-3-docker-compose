<template>
  <button
    class = "base-button"
    @click = "() => handleClick()"
  >
    <slot>
      Button
    </slot>
  </button>
</template>

<script>
export default {
  name: 'BaseButton',

  emits: ['click'],

  methods: {
    handleClick() {
      this.$emit('click')
    }
  }
}
</script>

<style scoped lang="scss">
.base-button {
  padding: 8px 12px;

  border: 1px solid #000000;
  background: #eeeeee;
  color: #000000;
  cursor: pointer;
}
</style>