<template>
  <button class="custom-button" @click="() => onClick()">
    {{ label }}
  </button>
</template>

<script setup>
defineProps(["label", "onClick"])
</script>

<style lang="scss" scoped>
.custom-button {
  cursor: pointer;
  background-color: #2c3e50;
  border-radius: 10px;
  border: none;
  padding: 10px 20px;
  font-size: 24px;
  color: white;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s;
  min-width: 200px;
  min-height: 50px;

  &:hover {
    background-color: #42b983;
  }
}
</style>
