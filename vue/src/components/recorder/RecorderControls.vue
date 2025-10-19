<template>
  <section class="recorder-controls">
    <div class="recorder-controls__primary">
      <button
        class="recorder-controls__button"
        type="button"
        :disabled="isProcessing"
        @click="emitToggle"
      >
        {{ isRecording ? 'Остановить запись' : 'Начать запись' }}
      </button>
      <span
        class="recorder-controls__status"
        :class="{ 'recorder-controls__status--active': isRecording }"
      >
        {{ statusText }}
      </span>
    </div>
    <p v-if="errorMessage" class="recorder-controls__error">{{ errorMessage }}</p>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  isRecording: boolean
  isProcessing: boolean
  statusText: string
  errorMessage: string
}>()

const emit = defineEmits<{
  (event: 'toggle'): void
}>()

const emitToggle = () => {
  if (props.isProcessing) {
    return
  }

  emit('toggle')
}
</script>

<style scoped lang="scss">
.recorder-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__primary {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  &__button {
    padding: 12px 24px;
    border-radius: 28px;
    border: none;
    background: linear-gradient(135deg, #ef4444, #facc15);
    color: #0b0f19;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 10px 18px rgba(239, 68, 68, 0.35);
    }

    &:disabled {
      background: linear-gradient(135deg, #9ca3af, #d1d5db);
      color: rgba(11, 15, 25, 0.6);
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
    }
  }

  &__status {
    font-size: 14px;
    color: var(--recorder-text-muted);

    &--active {
      color: #facc15;
      text-shadow: 0 0 6px rgba(250, 204, 21, 0.45);
    }
  }

  &__error {
    margin: 0;
    font-size: 13px;
    color: #f87171;
  }

  @media (prefers-color-scheme: dark) {
    &__button {
      background: linear-gradient(135deg, #dc2626, #f97316);
      color: #0b0f19;
    }
  }
}

:global(body.dark) {
  .recorder-controls {
    &__button {
      background: linear-gradient(135deg, #dc2626, #f97316);
      color: #0b0f19;
    }
  }
}
</style>
