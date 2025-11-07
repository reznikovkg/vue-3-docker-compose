<template>
  <div class="game-board-controls">
    <div class="size-selector">
      <label for="grid-size" class="size-selector__label">
        Размер сетки:
      </label>
      <select
        id="grid-size"
        :value="gridSize"
        @change="(event) => handleSizeChange(event)"
        class="size-selector__select"
      >
        <option
          v-for="size in AVAILABLE_SIZES"
          :key="size"
          :value="size"
          class="size-selector__option"
        >
          {{ size }}×{{ size }}
        </option>
      </select>
    </div>

    <button @click="() => $emit('reset')" class="reset-button">
      Новая игра
    </button>
  </div>
</template>

<script setup lang="ts">
import { AVAILABLE_SIZES } from "@/services/constants"

interface Props {
  gridSize: number
}

interface Emits {
  (e: 'size-change', size: number): void
  (e: 'reset'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleSizeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement

  emit('size-change', parseInt(target.value))
}
</script>

<style lang="scss" scoped>
.game-board-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;

  .size-selector {
    display: flex;
    align-items: center;
    gap: 8px;

    &__label {
      font-weight: 500;
      color: #374151;
    }

    &__select {
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: white;
      cursor: pointer;

      &:focus {
        outline: none;
        border-color: #3b82f6;
      }
    }
  }

  .reset-button {
    padding: 8px 16px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;

    &:hover {
      background: #2563eb;
    }
  }
}
</style>
