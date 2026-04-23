<template>
  <div class="btn">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'Button',
}
</script>

<style scoped lang="scss">
.btn {
  display: block;
  color: #194d6c;
  font-weight: bold;
  background-color: #abdaf4;
  border-radius: 100px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 6px 12px 0 #194d6c;
  border-width: 2px;
  border-style: solid;

  &:hover {
    cursor: pointer;
    box-shadow: 0 8px 16px 0 #194d6c;
  }
}
</style>