<template>
  <main class="recorder-page">
    <header class="recorder-page__header">
      <h1 class="recorder-page__title">Диктофон</h1>
      <p class="recorder-page__subtitle">
        Записывайте голос, прослушивайте и храните заметки офлайн.
      </p>
    </header>

    <RecorderControls
      :is-recording="isRecording"
      :is-processing="isProcessing"
      :status-text="statusText"
      :error-message="errorMessage"
      @toggle="() => toggleRecording()"
    />

    <RecorderDraft
      :draft="draft"
      :draft-name="draftName"
      :duration-label="draftDurationLabel"
      :can-save="canSaveDraft"
      @save="() => saveDraft()"
      @discard="() => discardDraft()"
      @update:name="(value) => updateDraftName(value)"
    />

    <RecorderList
      :entries="entries"
      :format-date="formatDate"
      :format-duration="formatDuration"
      @remove="(id) => removeEntry(id)"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import RecorderControls from '@/components/recorder/RecorderControls.vue'
import RecorderDraft from '@/components/recorder/RecorderDraft.vue'
import RecorderList from '@/components/recorder/RecorderList.vue'
import type { RecordingEntry } from '@/types/recorder'

const store = useStore()

const isRecording = ref(false)
const isProcessing = ref(false)
const errorMessage = ref('')

const draftName = ref('')
const mediaRecorder = ref<MediaRecorder | null>(null)
const mediaStream = ref<MediaStream | null>(null)
const audioChunks = ref<Blob[]>([])
const startedAt = ref<number | null>(null)

const draft = computed<RecordingEntry | null>(() => {
  const value = store.getters['recorder/getDraft']
  return value ?? null
})

const entries = computed<RecordingEntry[]>(() => {
  const value = store.getters['recorder/getEntries']
  return Array.isArray(value) ? value : []
})

const formatDuration = (seconds?: number) => {
  const total = Math.max(0, seconds || 0)
  const minutes = Math.floor(total / 60)
  const secs = total % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

const canSaveDraft = computed(() => {
  return Boolean(draft.value && draftName.value.trim().length > 0)
})

const statusText = computed(() => {
  if (isRecording.value) {
    return 'Идёт запись...'
  }
  if (draft.value) {
    return 'Запись готова к сохранению'
  }
  return 'Ожидание'
})

const draftDurationLabel = computed(() => {
  return draft.value ? `Длительность: ${formatDuration(draft.value.duration)}` : ''
})

const cleanupStream = () => {
  if (!mediaStream.value) {
    return
  }

  mediaStream.value.getTracks().forEach((track) => track.stop())
  mediaStream.value = null
}

const resetRecorderState = () => {
  isRecording.value = false
  startedAt.value = null
  audioChunks.value = []

  if (mediaRecorder.value) {
    mediaRecorder.value.removeEventListener('dataavailable', handleDataAvailable)
    mediaRecorder.value.removeEventListener('stop', handleStop)
    mediaRecorder.value = null
  }

  cleanupStream()
}

const blobToDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Не удалось прочитать данные записи'))
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

const handleDataAvailable = (event: BlobEvent) => {
  if (event.data && event.data.size > 0) {
    audioChunks.value.push(event.data)
  }
}

const handleStop = () => {
  const recorder = mediaRecorder.value
  const mimeType = recorder?.mimeType || 'audio/webm'
  const blob = new Blob(audioChunks.value, { type: mimeType })

  if (blob.size === 0) {
    errorMessage.value = 'Получена пустая запись'
    resetRecorderState()
    return
  }

  const finishedAt = Date.now()
  const durationMs = startedAt.value ? finishedAt - startedAt.value : 0
  const duration = Math.max(1, Math.round(durationMs / 1000))

  blobToDataUrl(blob)
    .then((dataUrl) => {
      const entry: RecordingEntry = {
        id: `draft-${finishedAt}`,
        name: `Запись ${new Date(finishedAt).toLocaleString()}`,
        createdAt: finishedAt,
        duration,
        dataUrl
      }

      errorMessage.value = ''
      return store.dispatch('recorder/setDraft', entry)
    })
    .catch((error) => {
      errorMessage.value = 'Не удалось обработать запись'
      console.error(error)
    })
    .finally(() => {
      resetRecorderState()
    })
}

const startRecording = () => {
  if (isRecording.value || isProcessing.value) {
    return Promise.resolve()
  }

  if (!navigator?.mediaDevices?.getUserMedia) {
    errorMessage.value = 'Ваш браузер не поддерживает запись звука'
    return Promise.resolve()
  }

  errorMessage.value = ''
  isProcessing.value = true

  return navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
      mediaStream.value = stream

      const recorder = new MediaRecorder(stream)
      mediaRecorder.value = recorder
      audioChunks.value = []
      startedAt.value = Date.now()

      recorder.addEventListener('dataavailable', handleDataAvailable)
      recorder.addEventListener('stop', handleStop)

      recorder.start()
      isRecording.value = true
    })
    .catch((error) => {
      errorMessage.value = 'Не удалось получить доступ к микрофону'
      console.error(error)
      cleanupStream()
    })
    .finally(() => {
      isProcessing.value = false
    })
}

const stopRecording = () => {
  if (!mediaRecorder.value) {
    return
  }

  const state = mediaRecorder.value.state
  if (state === 'inactive') {
    return
  }

  mediaRecorder.value.stop()
}

const toggleRecording = () => {
  if (isRecording.value) {
    stopRecording()
    return
  }

  startRecording()
}

const saveDraft = () => {
  if (!draft.value) {
    return
  }

  const trimmedName = draftName.value.trim()
  store.dispatch('recorder/saveDraft', {
    name: trimmedName || draft.value.name
  }).then(() => {
    draftName.value = ''
  })
}

const discardDraft = () => {
  draftName.value = ''
  store.dispatch('recorder/setDraft', null)
}

const updateDraftName = (value: string) => {
  draftName.value = value
}

const removeEntry = (id: string) => {
  store.dispatch('recorder/removeEntry', id)
}

onMounted(() => {
  store.dispatch('recorder/init')
})

onBeforeUnmount(() => {
  if (isRecording.value) {
    stopRecording()
  }
  cleanupStream()
})

watch(draft, (value) => {
  draftName.value = value?.name || ''
}, { immediate: true })

watch(draftName, (value) => {
  if (!draft.value || draft.value.name === value) {
    return
  }

  store.dispatch('recorder/setDraft', {
    ...draft.value,
    name: value
  })
})
</script>

<style scoped lang="scss">
.recorder-page {
  --recorder-text-strong: #0f172a;
  --recorder-text-muted: rgba(15, 23, 42, 0.65);

  max-width: 780px;
  margin: 0 auto;
  padding: 40px 18px 60px;
  display: flex;
  flex-direction: column;
  gap: 32px;

  &__header {
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-align: left;
  }

  &__title {
    margin: 0;
    font-size: 32px;
    font-weight: 700;
    color: var(--recorder-text-strong);
  }

  &__subtitle {
    margin: 0;
    font-size: 15px;
    color: var(--recorder-text-muted);
  }

  @media (prefers-color-scheme: dark) {
    & {
      --recorder-text-strong: #f8fafc;
      --recorder-text-muted: rgba(226, 232, 240, 0.7);
    }

    &__title {
      text-shadow: 0 8px 28px rgba(30, 58, 138, 0.35);
    }
  }
}
</style>
