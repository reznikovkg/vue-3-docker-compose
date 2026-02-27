<template>
  <div class="levels">
    <button
      v-for="level in levels"
      :key="level.id"
      class="levels__button"
      :class="{ 'levels__button--active': currentId === level.id }"
      @click="() => $emit('select', level.id)"
    >
      Level {{ level.id }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  levels: Array,
  currentId: Number
})

defineEmits(['select'])
</script>

<style scoped>
.levels {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.levels__button {
  padding: 8px 16px;
  background: #ddd;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

.levels__button--active {
  background: #4CAF50;
  color: white;
}
</style>