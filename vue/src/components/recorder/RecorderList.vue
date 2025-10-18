<template>
  <section class="recorder-list">
    <header class="recorder-list__header">
      <h2 class="recorder-list__title">Сохранённые записи</h2>
      <span class="recorder-list__badge">{{ entries.length }}</span>
    </header>

    <p v-if="entries.length === 0" class="recorder-list__empty">
      Список пуст — начните запись и сохраните её.
    </p>

    <ul v-else class="recorder-list__items">
      <li
        v-for="entry in entries"
        :key="entry.id"
        class="recorder-list__item"
      >
        <div class="recorder-list__item-header">
          <strong class="recorder-list__item-title">{{ entry.name }}</strong>
          <time class="recorder-list__item-date">
            {{ formatDate(entry.createdAt) }}
          </time>
          <span class="recorder-list__item-duration">
            {{ formatDuration(entry.duration) }}
          </span>
        </div>
        <audio class="recorder-list__audio" :src="entry.dataUrl" controls />
        <button
          class="recorder-list__remove"
          type="button"
          @click="emitRemove(entry.id)"
        >
          Удалить
        </button>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { RecordingEntry } from '@/types/recorder'

const props = defineProps<{
  entries: RecordingEntry[]
  formatDate: (value: number) => string
  formatDuration: (value?: number) => string
}>()

const emit = defineEmits<{
  (event: 'remove', value: string): void
}>()

const emitRemove = (id: string) => {
  emit('remove', id)
}
</script>

<style scoped lang="scss">
.recorder-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: rgba(15, 23, 42, 0.04);
  backdrop-filter: blur(12px);
}

.recorder-list__header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.recorder-list__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--recorder-text-strong);
}

.recorder-list__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.16);
  color: #2563eb;
  font-size: 13px;
  font-weight: 500;
}

.recorder-list__empty {
  margin: 0;
  font-size: 14px;
  color: var(--recorder-text-muted);
}

.recorder-list__items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.recorder-list__item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(255, 255, 255, 0.65);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
}

.recorder-list__item-header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 12px;
}

.recorder-list__item-title {
  font-size: 15px;
  color: var(--recorder-text-strong);
}

.recorder-list__item-date,
.recorder-list__item-duration {
  font-size: 13px;
  color: var(--recorder-text-muted);
}

.recorder-list__audio {
  width: 100%;
}

.recorder-list__remove {
  align-self: flex-start;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid rgba(244, 63, 94, 0.5);
  background: transparent;
  color: rgba(244, 63, 94, 0.9);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;

  &:hover {
    border-color: rgba(244, 63, 94, 0.8);
    color: rgba(244, 63, 94, 1);
    transform: translateY(-1px);
  }
}

@media (prefers-color-scheme: dark) {
  .recorder-list {
    background: rgba(15, 23, 42, 0.6);
    border-color: rgba(148, 163, 184, 0.2);
  }

  .recorder-list__item {
    background: rgba(30, 41, 59, 0.7);
    border-color: rgba(148, 163, 184, 0.24);
    box-shadow: 0 12px 24px rgba(2, 6, 23, 0.3);
  }

  .recorder-list__remove {
    border-color: rgba(248, 113, 113, 0.5);
    color: rgba(248, 113, 113, 0.9);
  }
}
</style>
