<template>
  <div class="pair-select-wrapper">
    <select class="pair-select" :value="modelValue" @change="(event) => onChange(event)">
      <slot />
    </select>
  </div>
</template>

<script setup>
defineProps(["modelValue", "onChange"])
</script>

<style lang="scss" scoped>
.pair-select {
  cursor: pointer;
  background-color: #2c3e50;
  border-radius: 10px;
  border: none;
  padding: 10px 20px;
  font-size: 24px;
  color: white;
  appearance: none;
  width: 100%;
  min-height: 50px;

  &:hover {
    background-color: #42b983;
  }

  &-wrapper {
    position: relative;
    display: inline-block;
    min-width: 200px;

    &::after {
      content: '▼';
      font-size: 24px;
      color: white;
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
    }
  }
}
</style>
