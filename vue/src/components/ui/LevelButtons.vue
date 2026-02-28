<template>
  <div class="levels">
    <button
      v-for="level in levels"
      :key="level.id"
      class="levels__button"
      :class="{ 'levels__button--active': currentId === level.id }"
      @click="() => onSelect(level.id)"
    >
      Level {{ level.id }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'LevelButtons',
  emits: ['select'],
  props: {
    levels: Array,
    currentId: Number
  },
  methods: {
    onSelect(levelId) {
      this.$emit('select', levelId)
    }
  }
}
</script>

<style scoped lang="scss">
.levels {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;

  &__button {
    padding: 8px 16px;
    background: #ddd;
    border: none;
    cursor: pointer;
    border-radius: 4px;

    &--active {
      background: #4CAF50;
      color: white;
    }
  }
}
</style>