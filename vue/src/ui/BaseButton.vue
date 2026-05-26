<template>
  <button
    class="base-button"
    type="button"
    @click="handleClick"
  >
    {{ text }}
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  props: {
    text: {
      type: String,
      required: true,
    },
  },
  emits: ['click'],
  methods: {
    handleClick () {
      this.$emit('click')
    },
  },
}
</script>

<style scoped lang="scss">
.base-button {
  padding: 12px 18px;
  border: none;
  border-radius: 12px;
  background: #3b82f6;
  color: #ffffff;
  font-size: 16px;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    opacity: 0.85;
  }
}
</style>