<template>
  <button class="base-button">
    {{ label }}
  </button>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: 'Button'
  }
})
</script>

<style scoped>
.base-button {
  padding: 10px 16px;
  background: #42b883;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.base-button:hover {
  background: #369870;
}
</style>