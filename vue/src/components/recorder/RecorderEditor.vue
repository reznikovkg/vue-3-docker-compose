<template>
  <section class="recorder-editor">
    <header class="recorder-editor__header">
      <div class="recorder-editor__titles">
        <p class="recorder-editor__eyebrow">Редактирование</p>
        <h1 class="recorder-editor__title">{{ nameValue || entry.name }}</h1>
        <p class="recorder-editor__meta">
          {{ formatDuration(entry.duration) }} · {{ new Date(entry.createdAt).toLocaleString() }}
        </p>
      </div>
      <button
        class="recorder-editor__ghost"
        type="button"
        @click="() => emitCancel()"
      >
        Вернуться
      </button>
    </header>

    <label class="recorder-editor__field">
      <span class="recorder-editor__label">Название записи</span>
      <input
        class="recorder-editor__input"
        type="text"
        :value="nameValue"
        placeholder="Введите новое название"
        @input="(event) => handleNameInput(event)"
      >
    </label>

    <div class="recorder-editor__panel">
      <div class="recorder-editor__timeline" ref="timelineRef">
        <div class="recorder-editor__track">
          <div
            class="recorder-editor__selection"
            :style="{
              left: `${selectionStart}%`,
              width: `${selectionWidth}%`
            }"
          >
            <button
              class="recorder-editor__handle recorder-editor__handle--start"
              type="button"
              @pointerdown="(event) => beginDrag(event, 'start')"
            >
              <span class="recorder-editor__handle-bar"></span>
              <span class="recorder-editor__handle-bar"></span>
            </button>
            <button
              class="recorder-editor__handle recorder-editor__handle--end"
              type="button"
              @pointerdown="(event) => beginDrag(event, 'end')"
            >
              <span class="recorder-editor__handle-bar"></span>
              <span class="recorder-editor__handle-bar"></span>
            </button>
          </div>
        </div>
        <div class="recorder-editor__scale">
          <span class="recorder-editor__scale-point">{{ formattedStart }}</span>
          <span class="recorder-editor__scale-point">{{ formattedEnd }}</span>
        </div>
      </div>
      <div class="recorder-editor__legend">
        <div class="recorder-editor__stat">
          <p class="recorder-editor__stat-label">Начало</p>
          <p class="recorder-editor__stat-value">{{ formattedStart }}</p>
        </div>
        <div class="recorder-editor__stat">
          <p class="recorder-editor__stat-label">Конец</p>
          <p class="recorder-editor__stat-value">{{ formattedEnd }}</p>
        </div>
        <div class="recorder-editor__stat">
          <p class="recorder-editor__stat-label">Фрагмент</p>
          <p class="recorder-editor__stat-value">{{ selectionDurationLabel }}</p>
        </div>
        <button
          class="recorder-editor__ghost recorder-editor__ghost--small"
          type="button"
          @click="() => resetSelection()"
        >
          Сбросить выделение
        </button>
      </div>
    </div>

    <div class="recorder-editor__player">
      <audio
        ref="previewAudio"
        class="recorder-editor__audio"
        :src="entry.dataUrl"
        controls
        @timeupdate="() => handleTimeUpdate()"
        @ended="() => stopPreview()"
      />
      <div class="recorder-editor__player-actions">
        <button
          class="recorder-editor__button recorder-editor__button--light"
          type="button"
          :disabled="isProcessing"
          @click="() => previewSegment()"
        >
          {{ isPreviewing ? 'Остановить прослушивание' : 'Прослушать фрагмент' }}
        </button>
        <button
          class="recorder-editor__button recorder-editor__button--accent"
          type="button"
          :disabled="isProcessing"
          @click="() => saveChanges()"
        >
          {{ isProcessing ? 'Сохраняем…' : 'Сохранить изменения' }}
        </button>
      </div>
      <p v-if="errorMessage" class="recorder-editor__error">{{ errorMessage }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import type { RecordingEntry } from '@/types/recorder'

const props = defineProps<{
  entry: RecordingEntry
  formatDuration: (value: number) => string
}>()

const emit = defineEmits<{
  (event: 'save', value: RecordingEntry): void
  (event: 'cancel'): void
}>()

const timelineRef = ref<HTMLElement | null>(null)
const previewAudio = ref<HTMLAudioElement | null>(null)
const nameValue = ref(props.entry.name)

const selectionStart = ref(0)
const selectionEnd = ref(100)
const activeHandle = ref<'start' | 'end' | null>(null)
const isPreviewing = ref(false)
const isProcessing = ref(false)
const errorMessage = ref('')

const selectionWidth = computed(() => selectionEnd.value - selectionStart.value)
const startSeconds = computed(() => Math.max(0, props.entry.duration * (selectionStart.value / 100)))
const endSeconds = computed(() => Math.max(startSeconds.value + 0.1, props.entry.duration * (selectionEnd.value / 100)))

const formattedStart = computed(() => props.formatDuration(Math.floor(startSeconds.value)))
const formattedEnd = computed(() => props.formatDuration(Math.ceil(endSeconds.value)))
const selectionDurationLabel = computed(() => {
  const duration = Math.max(1, Math.round(endSeconds.value - startSeconds.value))
  return props.formatDuration(duration)
})

const resetSelection = () => {
  selectionStart.value = 0
  selectionEnd.value = 100
  stopPreview()
}

const handleNameInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  nameValue.value = target.value
}

const emitCancel = () => {
  stopPreview()
  emit('cancel')
}

const detachPointerListeners = () => {
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerup', handlePointerUp)
  activeHandle.value = null
}

const handlePointerMove = (event: PointerEvent) => {
  if (!activeHandle.value || !timelineRef.value) {
    return
  }

  const rect = timelineRef.value.getBoundingClientRect()
  const percent = ((event.clientX - rect.left) / rect.width) * 100
  const clamped = Math.min(100, Math.max(0, percent))
  const minGap = 2

  if (activeHandle.value === 'start') {
    selectionStart.value = Math.min(clamped, selectionEnd.value - minGap)
  } else {
    selectionEnd.value = Math.max(clamped, selectionStart.value + minGap)
  }
}

const handlePointerUp = () => {
  detachPointerListeners()
}

const beginDrag = (event: PointerEvent, handle: 'start' | 'end') => {
  activeHandle.value = handle
  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('pointerup', handlePointerUp)
  handlePointerMove(event)
}

const stopPreview = () => {
  const audio = previewAudio.value
  if (!audio) {
    return
  }

  audio.pause()
  isPreviewing.value = false
}

const handleTimeUpdate = () => {
  const audio = previewAudio.value
  if (!audio) {
    return
  }

  if (audio.currentTime >= endSeconds.value) {
    stopPreview()
  }
}

const previewSegment = () => {
  const audio = previewAudio.value
  if (!audio) {
    return
  }

  if (isPreviewing.value) {
    stopPreview()
    return
  }

  audio.currentTime = startSeconds.value
  audio.play()
    .then(() => {
      isPreviewing.value = true
      errorMessage.value = ''
    })
    .catch((error) => {
      isPreviewing.value = false
      errorMessage.value = 'Не удалось воспроизвести отрезок'
      console.error(error)
    })
}

const writeString = (view: DataView, offset: number, text: string) => {
  for (let i = 0; i < text.length; i += 1) {
    view.setUint8(offset + i, text.charCodeAt(i))
  }
}

const bufferToWav = (buffer: AudioBuffer) => {
  const numOfChan = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const format = 1
  const bitDepth = 16
  const blockAlign = numOfChan * bitDepth / 8
  const byteRate = sampleRate * blockAlign
  const dataLength = buffer.length * numOfChan * 2
  const bufferLength = 44 + dataLength
  const arrayBuffer = new ArrayBuffer(bufferLength)
  const view = new DataView(arrayBuffer)

  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataLength, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, format, true)
  view.setUint16(22, numOfChan, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitDepth, true)
  writeString(view, 36, 'data')
  view.setUint32(40, dataLength, true)

  let offset = 44
  const channelData: Float32Array[] = []

  for (let channel = 0; channel < numOfChan; channel += 1) {
    channelData.push(buffer.getChannelData(channel))
  }

  for (let index = 0; index < buffer.length; index += 1) {
    for (let channel = 0; channel < numOfChan; channel += 1) {
      const sample = Math.max(-1, Math.min(1, channelData[channel][index]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
      offset += 2
    }
  }

  return arrayBuffer
}

const arrayBufferToDataUrl = (value: ArrayBuffer, mimeType: string) => {
  return new Promise<string>((resolve, reject) => {
    const blob = new Blob([value], { type: mimeType })
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Не удалось подготовить файл'))
      }
    }
    reader.onerror = () => reject(reader.error || new Error('Не удалось прочитать файл'))
    reader.readAsDataURL(blob)
  })
}

const trimDataUrl = (dataUrl: string, startAt: number, endAt: number) => {
  const duration = Math.max(0.5, endAt - startAt)
  return fetch(dataUrl)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => {
      const audioContext = new AudioContext()
      return audioContext.decodeAudioData(arrayBuffer)
    })
    .then((audioBuffer) => {
      const sampleRate = audioBuffer.sampleRate
      const frameCount = Math.max(1, Math.floor(duration * sampleRate))
      const offlineContext = new OfflineAudioContext(audioBuffer.numberOfChannels, frameCount, sampleRate)
      const source = offlineContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(offlineContext.destination)
      source.start(0, startAt, duration)

      return offlineContext.startRendering()
    })
    .then((renderedBuffer) => {
      const wavData = bufferToWav(renderedBuffer)
      const trimmedDuration = Math.max(1, Math.round(renderedBuffer.duration))
      return arrayBufferToDataUrl(wavData, 'audio/wav')
        .then((url) => ({
          dataUrl: url,
          duration: trimmedDuration,
        }))
    })
}

const saveChanges = () => {
  if (isProcessing.value) {
    return
  }

  if (selectionEnd.value <= selectionStart.value) {
    errorMessage.value = 'Конец фрагмента должен быть больше начала'
    return
  }

  const newName = nameValue.value.trim() || props.entry.name
  const startAt = startSeconds.value
  const endAt = endSeconds.value

  isProcessing.value = true
  errorMessage.value = ''

  trimDataUrl(props.entry.dataUrl, startAt, endAt)
    .then((result) => {
      emit('save', {
        ...props.entry,
        name: newName,
        duration: result.duration,
        dataUrl: result.dataUrl,
      })
      stopPreview()
    })
    .catch((error) => {
      errorMessage.value = 'Не удалось обрезать запись'
      console.error(error)
    })
    .finally(() => {
      isProcessing.value = false
    })
}

onBeforeUnmount(() => {
  detachPointerListeners()
  stopPreview()
})
</script>

<style scoped lang="scss">
.recorder-editor {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 32px;
  border-radius: 20px;
  background: radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.08), transparent 32%), #0f172a;
  color: #e2e8f0;
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.4);

  &__header {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
  }

  &__titles {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__eyebrow {
    margin: 0;
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(226, 232, 240, 0.7);
  }

  &__title {
    margin: 0;
    font-size: 26px;
    font-weight: 700;
    color: #f8fafc;
  }

  &__meta {
    margin: 0;
    font-size: 13px;
    color: rgba(226, 232, 240, 0.7);
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__label {
    font-size: 13px;
    color: rgba(226, 232, 240, 0.7);
  }

  &__input {
    padding: 10px 14px;
    border-radius: 12px;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: rgba(15, 23, 42, 0.6);
    color: #f8fafc;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: rgba(94, 234, 212, 0.8);
      box-shadow: 0 0 0 2px rgba(94, 234, 212, 0.25);
    }
  }

  &__panel {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 16px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(148, 163, 184, 0.2);
  }

  &__timeline {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__track {
    position: relative;
    height: 120px;
    border-radius: 16px;
    background: linear-gradient(90deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9));
    overflow: hidden;
    box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.18);
  }

  &__selection {
    position: absolute;
    top: 0;
    bottom: 0;
    background: rgba(248, 180, 0, 0.8);
    border-radius: 14px;
    box-shadow: 0 0 0 1px rgba(31, 41, 55, 0.35), 0 10px 22px rgba(248, 180, 0, 0.35);
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    pointer-events: none;
  }

  &__handle {
    width: 18px;
    background: rgba(15, 23, 42, 0.9);
    border: 2px solid #f5c518;
    border-radius: 12px;
    display: grid;
    place-items: center;
    cursor: ew-resize;
    pointer-events: auto;
    transition: transform 0.12s ease;

    &:hover {
      transform: translateY(-1px);
    }

    &--start {
      border-right: none;
      border-top-left-radius: 14px;
      border-bottom-left-radius: 14px;
    }

    &--end {
      border-left: none;
      border-top-right-radius: 14px;
      border-bottom-right-radius: 14px;
    }
  }

  &__handle-bar {
    width: 2px;
    height: 18px;
    background: #facc15;
    display: inline-block;
  }

  &__scale {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: rgba(226, 232, 240, 0.75);
    padding: 0 4px;
  }

  &__scale-point {
    padding: 4px 8px;
    border-radius: 10px;
    background: rgba(15, 23, 42, 0.55);
    border: 1px solid rgba(148, 163, 184, 0.15);
  }

  &__legend {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
    align-items: center;
  }

  &__stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__stat-label {
    margin: 0;
    font-size: 12px;
    color: rgba(226, 232, 240, 0.7);
  }

  &__stat-value {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #facc15;
  }

  &__ghost {
    padding: 10px 14px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(148, 163, 184, 0.3);
    color: #e2e8f0;
    cursor: pointer;
    transition: transform 0.2s ease, border-color 0.2s ease, color 0.2s ease;

    &:hover {
      transform: translateY(-1px);
      border-color: rgba(226, 232, 240, 0.5);
    }

    &--small {
      justify-self: flex-end;
    }
  }

  &__player {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__audio {
    width: 100%;
    border-radius: 12px;
    background: rgba(15, 23, 42, 0.4);
  }

  &__player-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  &__button {
    padding: 12px 18px;
    border-radius: 12px;
    border: 1px solid transparent;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &--light {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(148, 163, 184, 0.3);
      color: #e2e8f0;

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        border-color: rgba(226, 232, 240, 0.45);
      }
    }

    &--accent {
      background: linear-gradient(135deg, #facc15, #f472b6);
      color: #0f172a;
      box-shadow: 0 14px 24px rgba(236, 72, 153, 0.32);

      &:hover:not(:disabled) {
        transform: translateY(-1px);
      }
    }
  }

  &__error {
    margin: 0;
    font-size: 13px;
    color: #fca5a5;
  }

  @media (max-width: 720px) {
    padding: 20px;

    &__track {
      height: 100px;
    }

    &__title {
      font-size: 22px;
    }
  }
}
</style>
