<template>
  <main class="editor-page">
    <RecorderEditor
      v-if="entry"
      :key="entry.id"
      :entry="entry"
      :format-duration="formatDuration"
      @save="(value) => handleSave(value)"
      @cancel="() => goToList()"
    />

    <section v-else class="editor-page__empty">
      <h1 class="editor-page__title">Запись не найдена</h1>
      <p class="editor-page__text">
        Не удалось загрузить запись для редактирования. Вернитесь к списку и попробуйте ещё раз.
      </p>
      <RouterLink class="editor-page__link" :to="{ name: $routes.RECORDER }">
        К списку записей
      </RouterLink>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import RecorderEditor from '@/components/recorder/RecorderEditor.vue'
import { ROUTES } from '@/router/index.js'
import type { RecordingEntry } from '@/types/recorder'

const router = useRouter()
const route = useRoute()
const store = useStore()

const formatDuration = (seconds: number) => {
  const total = Math.max(0, Math.round(seconds || 0))
  const minutes = Math.floor(total / 60)
  const secs = total % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const entryId = computed(() => {
  const param = route.params.id
  return typeof param === 'string' ? param : Array.isArray(param) ? param[0] : ''
})

const entry = computed<RecordingEntry | null>(() => {
  const getter = store.getters['recorder/getEntryById']
  if (typeof getter !== 'function') {
    return null
  }

  return getter(entryId.value)
})

const goToList = () => {
  router.push({ name: ROUTES.RECORDER })
}

const handleSave = (value: RecordingEntry) => {
  store.dispatch('recorder/updateEntry', value)
  goToList()
}

onMounted(() => {
  store.dispatch('recorder/init')
})
</script>

<style scoped lang="scss">
.editor-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 36px 18px 60px;

  &__empty {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 32px 24px;
    border-radius: 16px;
    border: 1px solid rgba(148, 163, 184, 0.25);
    background: rgba(15, 23, 42, 0.04);
  }

  &__title {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: #0f172a;
  }

  &__text {
    margin: 0;
    font-size: 15px;
    color: rgba(15, 23, 42, 0.7);
  }

  &__link {
    align-self: flex-start;
    padding: 10px 16px;
    border-radius: 10px;
    background: linear-gradient(135deg, #22d3ee, #6366f1);
    color: #0b1120;
    text-decoration: none;
    font-weight: 600;
    box-shadow: 0 12px 22px rgba(79, 70, 229, 0.22);
  }
}
</style>
