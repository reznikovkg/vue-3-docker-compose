<template>
  <section v-if="draft" class="recorder-draft">
    <header class="recorder-draft__header">
      <h2 class="recorder-draft__title">Текущая запись</h2>
      <span class="recorder-draft__duration">{{ durationLabel }}</span>
    </header>

    <label class="recorder-draft__field">
      <span class="recorder-draft__label">Название</span>
      <input
        class="recorder-draft__input"
        type="text"
        :value="draftName"
        placeholder="Введите название"
        @input="handleNameInput"
      >
    </label>

    <audio
      class="recorder-draft__audio"
      :src="draft.dataUrl"
      controls
      :key="draft.dataUrl"
    />

    <div class="recorder-draft__actions">
      <button
        class="recorder-draft__button recorder-draft__button--accent"
        type="button"
        :disabled="!canSave"
        @click="emitSave"
      >
        Сохранить запись
      </button>
      <button
        class="recorder-draft__button recorder-draft__button--ghost"
        type="button"
        @click="emitDiscard"
      >
        Удалить
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { RecordingEntry } from '@/types/recorder'

const props = defineProps<{
  draft: RecordingEntry | null
  draftName: string
  durationLabel: string
  canSave: boolean
}>()

const emit = defineEmits<{
  (event: 'save'): void
  (event: 'discard'): void
  (event: 'update:name', value: string): void
}>()

const emitSave = () => {
  if (!props.canSave) {
    return
  }

  emit('save')
}

const emitDiscard = () => {
  emit('discard')
}

const handleNameInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:name', target.value)
}
</script>

<style scoped lang="scss">
.recorder-draft {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(129, 140, 248, 0.22));
  border: 1px solid rgba(148, 163, 184, 0.25);
  backdrop-filter: blur(14px);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
  }

  &__title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--recorder-text-strong);
  }

  &__duration {
    font-size: 14px;
    color: var(--recorder-text-muted);
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__label {
    font-size: 13px;
    color: var(--recorder-text-muted);
  }

  &__input {
    padding: 10px 14px;
    border-radius: 12px;
    border: 1px solid rgba(148, 163, 184, 0.4);
    background: rgba(15, 23, 42, 0.04);
    color: var(--recorder-text-strong);
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: rgba(59, 130, 246, 0.5);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }
  }

  &__audio {
    width: 100%;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  &__button {
    padding: 10px 18px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
    border: 1px solid transparent;

    &:hover {
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    &--accent {
      background: linear-gradient(135deg, #22d3ee, #3b82f6);
      color: #0b1120;

      &:hover {
        box-shadow: 0 10px 20px rgba(59, 130, 246, 0.28);
      }
    }

    &--ghost {
      background: transparent;
      border-color: rgba(148, 163, 184, 0.4);
      color: var(--recorder-text-muted);

      &:hover {
        border-color: rgba(59, 130, 246, 0.4);
        color: var(--recorder-text-strong);
      }
    }
  }

  @media (prefers-color-scheme: dark) {
    & {
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.26), rgba(14, 165, 233, 0.18));
      border-color: rgba(148, 163, 184, 0.35);
    }

    &__input {
      background: rgba(15, 23, 42, 0.4);
    }
  }
}
</style>
