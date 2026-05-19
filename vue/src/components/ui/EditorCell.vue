<template>
  <div
    class = "editor-cell"
    :class = "{ 'editor-cell--active': active }"
    @click = "() => $emit('toggle')"
  >
  </div>
</template>

<script>
export default {
  name: 'EditorCell',
  props: {
    active: Boolean
  },
  emits: ['toggle']
}
</script>

<style scoped lang = "scss">
.editor-cell {
  width: 40px;
  height: 40px;
  background: #f0f0f0;
  border: 1px solid #ccc;
  cursor: pointer;

  &--active {
    background: #333;
  }

  &:hover {
    opacity: 0.7;
  }
}
</style>