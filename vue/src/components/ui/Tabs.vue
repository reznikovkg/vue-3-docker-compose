<template>
  <div class="tabs">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      class="tabs__tab"
      :class="{ 'tabs__tab--active': modelValue === tab.value }"
      @click="() => selectTab(tab.value)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script lang="ts">
import soundManager from './../../utils/soundManager';

export default {
  name: 'Tabs',
  props: {
    modelValue: {
      type: String,
      required: true
    },
    tabs: {
      type: Array as () => Array<{ value: string; label: string }>,
      required: true
    }
  },
  emits: ['update:modelValue', 'change'],
  methods: {
    selectTab(value: string) {
      soundManager.play('click')

      this.$emit('update:modelValue', value)
      this.$emit('change', value)
    }
  }
}
</script>

<style scoped lang="scss">
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 1px solid #3a3f44;
  padding-bottom: 10px;

  &__tab {
    padding: 10px 20px;
    background: transparent;
    border: none;
    color: #b0b0b0;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 6px;

    &:hover {
      color: #ededf0;
      background: rgba(0, 211, 137, 0.1);
    }

    &--active {
      color: #00d389;
      border-bottom: 2px solid #00d389;
      
      &:hover {
        background: transparent;
      }
    }
  }
}
</style>