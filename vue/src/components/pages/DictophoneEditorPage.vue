<template>
  <main class="voice-recorder">
    <div class="voice-recorder__header">
      <h1 class="voice-recorder__title">Recording Editor</h1>
      <button
        @click="() => goBack()"
        class="voice-recorder__button voice-recorder__button--secondary"
      >
        ← Back
      </button>
    </div>
    <div class="voice-recorder__content">
      <div v-if="!recording" class="voice-recorder__section">
        <div class="voice-recorder__empty">
          <p>Recording not found</p>
          <p>ID: {{ recordingId }}</p>
        </div>
      </div>
      <div v-else>
        <div class="voice-recorder__section">
          <h3 class="voice-recorder__subtitle">Original Recording</h3>
          <audio
            :src="recording.url"
            ref="audioPlayer"
            controls
            class="voice-recorder__audio-player"
            @loadedmetadata="onAudioLoaded"
          ></audio>
        </div>
        <div class="voice-recorder__section">
          <h3 class="voice-recorder__subtitle">Trim Audio</h3>
          <div class="voice-recorder__waveform-container">
            <div
              class="voice-recorder__waveform"
              ref="waveformContainer"
              @pointerdown="onWaveformPointerDown"
            >
              <div
                class="voice-recorder__unselected-area voice-recorder__unselected-area--left"
                :style="{ width: `${selectionStartPercent}%` }"
              ></div>
              <div
                class="voice-recorder__unselected-area voice-recorder__unselected-area--right"
                :style="{ width: `${100 - selectionEndPercent}%` }"
              ></div>
              <div
                class="voice-recorder__selection"
                :style="selectionStyle"
              >
                <div class="voice-recorder__selection-content">
                  <span class="voice-recorder__selection-time">
                    {{ formattedSelectionDuration }}
                  </span>
                </div>
                <div
                  class="voice-recorder__handle voice-recorder__handle--left"
                  @pointerdown="beginDrag($event, 'start')"
                >
                  <div class="voice-recorder__handle-line"></div>
                </div>
                <div
                  class="voice-recorder__handle voice-recorder__handle--right"
                  @pointerdown="beginDrag($event, 'end')"
                >
                  <div class="voice-recorder__handle-line"></div>
                </div>
              </div>
              <div class="voice-recorder__timeline">
                <div
                  v-for="marker in timelineMarkers"
                  :key="marker"
                  class="voice-recorder__timeline-marker"
                  :style="{ left: `${(marker / duration) * 100}%` }"
                >
                  <span class="voice-recorder__timeline-label">
                    {{ formatTime(marker) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="voice-recorder__time-info">
            <div class="voice-recorder__time-item">
              <span class="voice-recorder__time-label">Start:</span>
              <span class="voice-recorder__time-value">{{ formattedStart }}</span>
            </div>
            <div class="voice-recorder__time-item">
              <span class="voice-recorder__time-label">End:</span>
              <span class="voice-recorder__time-value">{{ formattedEnd }}</span>
            </div>
            <div class="voice-recorder__time-item">
              <span class="voice-recorder__time-label">Duration:</span>
              <span class="voice-recorder__time-value">{{ formattedSelectionDuration }}</span>
            </div>
          </div>
          <div class="voice-recorder__quick-actions">
            <button
              @click="() => setSelectionToStart() "
              class="voice-recorder__button voice-recorder__button--secondary"
            >
              Set to Start
            </button>
            <button
              @click="() => setSelectionToEnd()"
              class="voice-recorder__button voice-recorder__button--secondary"
            >
              Set to End
            </button>
            <button
              @click="() => selectAll()"
              class="voice-recorder__button voice-recorder__button--secondary"
            >
              Select All
            </button>
          </div>
        </div>
        <div v-if="previewUrl" class="voice-recorder__section">
          <h3 class="voice-recorder__subtitle">Preview</h3>
          <audio
            :src="previewUrl"
            ref="previewAudio"
            controls
            class="voice-recorder__audio-player"
            @timeupdate="handleTimeUpdate"
          ></audio>
        </div>
        <div class="voice-recorder__section">
          <h3 class="voice-recorder__subtitle">Controls</h3>
          <div class="voice-recorder__controls">
            <button
              @click="() => previewSegment()"
              :disabled="isProcessing || !hasSelection"
              class="voice-recorder__button voice-recorder__button--primary"
            >
              {{ isPreviewing ? 'Stop Preview' : 'Preview Selection' }}
            </button>
            <button
              @click="() => saveChanges()"
              :disabled="isProcessing || !hasSelection"
              class="voice-recorder__button voice-recorder__button--secondary"
            >
              {{ isProcessing ? 'Saving...' : 'Save Trimmed Audio' }}
            </button>
            <button
              @click="() => resetSelection()"
              class="voice-recorder__button voice-recorder__button--secondary"
            >
              Reset
            </button>
          </div>
          <div v-if="errorMessage" class="voice-recorder__error">
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted,  nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

const route = useRoute()
const router = useRouter()
const store = useStore()


const audioPlayer = ref<HTMLAudioElement>()
const previewAudio = ref<HTMLAudioElement>()
const waveformContainer = ref<HTMLElement>()

const duration = ref(0)
const selectionStart = ref(0)
const selectionEnd = ref(100)
const activeHandle = ref<'start' | 'end' | null>(null)
const isPreviewing = ref(false)
const isProcessing = ref(false)
const previewUrl = ref<string | null>(null)
const errorMessage = ref('')


const recordingId = computed(() => route.params.id as string)
const recording = computed(() => {
  const recordings = store.getters['dictophone/getRecordings']
  return recordings.find((r: any) => r.id === recordingId.value)
})

const selectionStartPercent = computed(() => selectionStart.value)
const selectionEndPercent = computed(() => selectionEnd.value)

const startSeconds = computed(() => Math.max(0, duration.value * (selectionStart.value / 100)))
const endSeconds = computed(() => Math.max(startSeconds.value + 0.1, duration.value * (selectionEnd.value / 100)))

const formattedStart = computed(() => formatTime(Math.floor(startSeconds.value)))
const formattedEnd = computed(() => formatTime(Math.ceil(endSeconds.value)))
const formattedSelectionDuration = computed(() => {
  const dur = Math.max(1, Math.round(endSeconds.value - startSeconds.value))
  return formatTime(dur)
})

const hasSelection = computed(() => selectionEnd.value > selectionStart.value)

const selectionStyle = computed(() => ({
  left: `${selectionStart.value}%`,
  width: `${selectionEnd.value - selectionStart.value}%`
}))

const timelineMarkers = computed(() => {
  if (duration.value <= 0) return []
  const markers = []
  const interval = duration.value >= 60 ? 10 : 5
  for (let time = 0; time <= duration.value; time += interval) {
    markers.push(time)
  }
  return markers
})

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const goBack = () => {
  router.push({
    name: 'dictophone-editor',
  })
}

const onAudioLoaded = () => {
  if (audioPlayer.value) {
    const newDuration = audioPlayer.value.duration
    if (isFinite(newDuration) && !isNaN(newDuration) && newDuration > 0) {
      duration.value = newDuration
      selectionStart.value = 0
      selectionEnd.value = 100
    } else {
      duration.value = 0
    }
  }
}

const resetSelection = () => {
  selectionStart.value = 0
  selectionEnd.value = 100
  stopPreview()
  previewUrl.value = null
  errorMessage.value = ''
}

const setSelectionToStart = () => {
  selectionStart.value = 0
  selectionEnd.value = Math.min(100, selectionStart.value + 5)
}

const setSelectionToEnd = () => {
  selectionEnd.value = 100
  selectionStart.value = Math.max(0, selectionEnd.value - 5)
}

const selectAll = () => {
  selectionStart.value = 0
  selectionEnd.value = 100
}

const onWaveformPointerDown = (event: PointerEvent) => {
  if (!waveformContainer.value) return
  const rect = waveformContainer.value.getBoundingClientRect()
  const percent = ((event.clientX - rect.left) / rect.width) * 100
  const clamped = Math.min(100, Math.max(0, percent))
  const minGap = 5
  if (Math.abs(clamped - selectionStart.value) < 3) {
    beginDrag(event, 'start')
    return
  }
  if (Math.abs(clamped - selectionEnd.value) < 3) {
    beginDrag(event, 'end')
    return
  }
  const newStart = Math.max(0, clamped - minGap / 2)
  const newEnd = Math.min(100, newStart + minGap)
  selectionStart.value = newStart
  selectionEnd.value = newEnd
}

const beginDrag = (event: PointerEvent, handle: 'start' | 'end') => {
  activeHandle.value = handle
  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('pointerup', handlePointerUp)
  handlePointerMove(event)
}

const handlePointerMove = (event: PointerEvent) => {
  if (!activeHandle.value || !waveformContainer.value) return
  const rect = waveformContainer.value.getBoundingClientRect()
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

const detachPointerListeners = () => {
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerup', handlePointerUp)
  activeHandle.value = null
}

const stopPreview = () => {
  if (previewAudio.value) {
    previewAudio.value.pause()
  }
  isPreviewing.value = false
}

const handleTimeUpdate = () => {
  if (previewAudio.value && previewAudio.value.currentTime >= endSeconds.value) {
    stopPreview()
  }
}

const previewSegment = () => {
  if (isPreviewing.value) {
    stopPreview()
    return
  }
  if (!recording.value?.url) {
    errorMessage.value = 'No recording available'
    return
  }
  isProcessing.value = true
  errorMessage.value = ''
  isPreviewing.value = false
  let audioContext = null
  let previewBlobUrl = null
  fetch(recording.value.url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`)
      }
      return response.arrayBuffer()
    })
    .then(arrayBuffer => {
      audioContext = new AudioContext()
      return audioContext.decodeAudioData(arrayBuffer)
    })
    .then(audioBuffer => {
      const sampleRate = audioBuffer.sampleRate
      const totalSamples = audioBuffer.length
      const startSample = Math.floor(Math.max(0, startSeconds.value) * sampleRate)
      const endSample = Math.floor(Math.min(endSeconds.value, totalSamples / sampleRate) * sampleRate)
      if (startSample >= endSample || startSample >= totalSamples) {
        throw new Error('Invalid segment time range')
      }
      const length = Math.min(endSample - startSample, totalSamples - startSample)
      const newBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        length,
        sampleRate
      )
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel)
        const newChannelData = newBuffer.getChannelData(channel)
        newChannelData.set(channelData.subarray(startSample, startSample + length))
      }
      return audioBufferToWav(newBuffer)
    })
    .then(wavBlob => {
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
        previewUrl.value = null
      }
      previewBlobUrl = URL.createObjectURL(wavBlob)
      previewUrl.value = previewBlobUrl
      return nextTick()
    })
    .then(() => {
      if (previewAudio.value) {
        previewAudio.value.currentTime = 0
        const playPromise = previewAudio.value.play()
        if (playPromise !== undefined) {
          return playPromise
        }
      }
    })
    .then(() => {
      isPreviewing.value = true
    })
    .catch(error => {
      errorMessage.value = error.message || 'Failed to preview segment'
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl)
      }
      if (previewUrl.value === previewBlobUrl) {
        previewUrl.value = null
      }
    })
    .finally(() => {
      if (audioContext) {
        audioContext.close()
          .then(() => {
            audioContext = null
          })
          .catch(err => {
            console.warn('Failed to close audio context:', err)
          })
      }
      isProcessing.value = false
    })
}

const saveChanges = () => {
  if (selectionEnd.value <= selectionStart.value) {
    errorMessage.value = 'End must be greater than start'
    return
  }
  isProcessing.value = true
  errorMessage.value = ''
  let audioContext = null
  let fileUrl = null
  fetch(recording.value.url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`)
      }
      return response.arrayBuffer()
    })
    .then(arrayBuffer => {
      audioContext = new AudioContext()
      return audioContext.decodeAudioData(arrayBuffer)
    })
    .then(audioBuffer => {
      const startSample = Math.floor(startSeconds.value * audioBuffer.sampleRate)
      const endSample = Math.floor(endSeconds.value * audioBuffer.sampleRate)
      const length = endSample - startSample
      if (length <= 0) {
        throw new Error('Invalid segment length')
      }
      const newBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        length,
        audioBuffer.sampleRate
      )
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel)
        const newChannelData = newBuffer.getChannelData(channel)
        newChannelData.set(channelData.subarray(startSample, endSample))
      }
      return audioBufferToWav(newBuffer)
    })
    .then(wavBlob => {
      const file = new File([wavBlob], `trimmed_${recording.value.name || 'recording'}.wav`, {
        type: 'audio/wav'
      })
      const trimmedRecording = {
        id: Date.now().toString(),
        name: `Trimmed: ${recording.value.name || 'Recording'}`,
        url: URL.createObjectURL(file),
        duration: endSeconds.value - startSeconds.value,
        size: file.size,
        timestamp: new Date().toISOString(),
        originalRecordingId: recordingId.value,
        trimRange: {
          start: startSeconds.value,
          end: endSeconds.value
        }
      }
      fileUrl = trimmedRecording.url
      return store.dispatch('dictophone/addRecording', trimmedRecording)
    })
    .then(() => {
      alert('Trimmed audio saved to your library successfully!')
      setTimeout(() => {
        router.push('/dictophone')
      }, 1500)
    })
    .catch(error => {
      errorMessage.value = error.message || 'Failed to save trimmed audio'
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl)
      }
    })
    .finally(() => {
      if (audioContext) {
        audioContext.close()
          .catch(err => console.warn('Failed to close audio context:', err))
      }
      isProcessing.value = false
    })
}

const audioBufferToWav = (buffer: AudioBuffer): Promise<Blob> => {
  return new Promise((resolve) => {
    const numberOfChannels = buffer.numberOfChannels
    const length = buffer.length
    const sampleRate = buffer.sampleRate
    const bitsPerSample = 16
    const bytesPerSample = bitsPerSample / 8
    const blockAlign = numberOfChannels * bytesPerSample
    const byteRate = sampleRate * blockAlign
    const dataSize = length * blockAlign
    const bufferSize = 44 + dataSize
    const arrayBuffer = new ArrayBuffer(bufferSize)
    const view = new DataView(arrayBuffer)
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
    let offset = 0
    writeString(offset, 'RIFF'); offset += 4
    view.setUint32(offset, bufferSize - 8, true); offset += 4
    writeString(offset, 'WAVE'); offset += 4
    writeString(offset, 'fmt '); offset += 4
    view.setUint32(offset, 16, true); offset += 4
    view.setUint16(offset, 1, true); offset += 2
    view.setUint16(offset, numberOfChannels, true); offset += 2
    view.setUint32(offset, sampleRate, true); offset += 4
    view.setUint32(offset, byteRate, true); offset += 4
    view.setUint16(offset, blockAlign, true); offset += 2
    view.setUint16(offset, bitsPerSample, true); offset += 2
    writeString(offset, 'data'); offset += 4
    view.setUint32(offset, dataSize, true); offset += 4
    const channels = []
    for (let channel = 0; channel < numberOfChannels; channel++) {
      channels.push(buffer.getChannelData(channel))
    }
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channels[channel][i]))
        const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF
        view.setInt16(offset, int16, true)
        offset += 2
      }
    }
    resolve(new Blob([arrayBuffer], { type: 'audio/wav' }))
  })
}

onMounted(() => {
  if (recording.value?.url && audioPlayer.value) {
    audioPlayer.value.load()
  }
})

onUnmounted(() => {
  detachPointerListeners()
  stopPreview()
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
</script>

<style scoped lang="scss">
.voice-recorder {
  $self: &;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  &__title {
    color: #2c3e50;
    margin: 0;
    text-align: center;
    flex: 1;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  &__section {
    border: 1px solid #e1e1e1;
    border-radius: 0.5rem;
    padding: 1.5rem;
    background-color: #ffffff;
  }

  &__subtitle {
    color: #2c3e50;
    margin-bottom: 1rem;
  }

  &__audio-player {
    width: 100%;
    margin-bottom: 1rem;
  }

  &__waveform-container {
    background: #f8f9fa;
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  &__waveform {
    position: relative;
    height: 120px;
    background: linear-gradient(to bottom, #e3f2fd, #bbdefb);
    border: 1px solid #90caf9;
    border-radius: 0.5rem;
    overflow: hidden;
    cursor: pointer;
    user-select: none;
  }

  &__unselected-area {
    position: absolute;
    top: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    pointer-events: none;

    &--left {
      left: 0;
    }

    &--right {
      right: 0;
    }
  }

  &__selection {
    position: absolute;
    top: 0;
    bottom: 0;
    background: rgba(52, 152, 219, 0.4);
    border: 2px solid #3498db;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__selection-content {
    text-align: center;
  }

  &__selection-time {
    background: rgba(255, 255, 255, 0.9);
    color: #2c3e50;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
  }

  &__handle {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 12px;
    cursor: col-resize;
    pointer-events: all;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;

    &--left {
      left: -6px;
    }

    &--right {
      right: -6px;
    }
  }

  &__handle-line {
    width: 3px;
    height: 60%;
    background: #3498db;
    border-radius: 1px;
  }

  &__timeline {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 20px;
    pointer-events: none;
  }

  &__timeline-marker {
    position: absolute;
    bottom: 0;
    transform: translateX(-50%);
  }

  &__timeline-label {
    font-size: 0.7rem;
    color: #7f8c8d;
    background: rgba(255, 255, 255, 0.9);
    padding: 0.1rem 0.3rem;
    border-radius: 0.2rem;
  }

  &__time-info {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1rem;
  }

  &__time-item {
    text-align: center;
    padding: 0.75rem;
    background: #f8f9fa;
    border-radius: 0.5rem;
    border: 1px solid #e1e1e1;
  }

  &__time-label {
    display: block;
    font-size: 0.875rem;
    color: #7f8c8d;
    margin-bottom: 0.25rem;
  }

  &__time-value {
    display: block;
    font-weight: bold;
    color: #2c3e50;
    font-size: 1rem;
  }

  &__quick-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  &__controls {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  &__button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 120px;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &--primary {
      background-color: #42b883;
      color: white;

      &:hover:not(:disabled) {
        background-color: #369870;
      }
    }

    &--secondary {
      background-color: #3498db;
      color: white;

      &:hover:not(:disabled) {
        background-color: #2980b9;
      }
    }
  }

  &__error {
    text-align: center;
    color: #e74c3c;
    margin-top: 1rem;
    padding: 0.5rem;
    background: rgba(231, 76, 60, 0.1);
    border-radius: 0.25rem;
  }

  &__empty {
    text-align: center;
    color: #7f8c8d;
    padding: 2rem;
  }
}
</style>