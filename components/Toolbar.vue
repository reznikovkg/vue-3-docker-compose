<template>
  <div class="toolbar">
    <button
      @click="() => triggerModeChange('place')"
      :class="{ active: currentMode == 'place' }"
    >
      Разместить
    </button>
    <button
      @click="() => triggerModeChange('delete')"
      :class="{ active: currentMode == 'delete' }"
    >
      Удалить
    </button>
  </div>
</template>

<script>
export default {
  name: 'Toolbar',
  props: {
    currentMode: {
      type: String,
      default: 'place', 
    },
  },
  emits: ['set-mode'],
  methods: {
    triggerModeChange(mode) {
      this.$emit('set-mode', mode);
    },
  },
};
</script>

<style scoped leng = "less">
.toolbar {
  margin-bottom: 30px;
  display: flex;
  gap: 20px;
}
button {
  font-size: 20px; 
  padding: 20px 25px;
  border: 1px solid #ccc;
  border-radius: 15px;
  cursor: pointer;
  background-color: #f0f0f0;
}
button.active {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
}
</style>