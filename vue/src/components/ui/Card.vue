<template>
  <div class="card" :class="{ 'card--selected': selected, 'card--matched': matched }" @click="(event) => onClick(event)">
    <span v-if="selected || matched">{{ label }}</span>
  </div>
</template>

<script setup>
defineProps(["label", "selected", "matched", "onClick"])
</script>

<style lang="scss" scoped>
.card {
  width: 100px;
  height: 100px;
  cursor: pointer;
  background-color: #2c3e50;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32px;
  color: white;
  &--selected {
    background-color: #42b983;
  }
  &--matched {
    opacity: 0;
  }
}
</style>
