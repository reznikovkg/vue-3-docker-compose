<template>
  <div class="toolbar">
    <button
      class="btn"
      :class="{ 'btn--active': currentMode === 'place' }"
      @click="() => triggerModeChange('place')"
    >
      Разместить
    </button>
    <button
      class="btn"
      :class="{ 'btn--active': currentMode === 'delete' }"
      @click="() => triggerModeChange('delete')"
    >
      Удалить
    </button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  currentMode: {
    type: String,
    default: 'place',
  },
});

const emit = defineEmits(['set-mode']);

const triggerModeChange = (mode) => {
  if (props.currentMode !== mode) {
    emit('set-mode', mode);
  }
};
</script>

<style scoped lang="less">
.toolbar {
  margin-bottom: 30px;
  display: flex;
  gap: 20px;
}

.btn {
  font-size: 20px;
  padding: 20px 25px;
  border: 1px solid #ccc;
  border-radius: 15px;
  cursor: pointer;
  background-color: #f0f0f0;
  transition: background-color 0.2s, border-color 0.2s;
  color: #333;

  &:hover {
    background-color: #e0e0e0;
  }

  &--active {
    background-color: #4CAF50;
    color: white;
    border-color: #4CAF50;

    &:hover {
      background-color: #45a049;
    }
  }
}
</style>