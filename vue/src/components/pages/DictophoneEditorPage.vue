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
            @timeupdate="onTimeUpdate"
          ></audio>
        </div>

        <div class="voice-recorder__section">
          <h3 class="voice-recorder__subtitle">Trim Audio</h3>

          <div class="voice-recorder__waveform-container">
            <div
              class="voice-recorder__waveform"
              ref="waveformContainer"
              @mousedown="onWaveformMouseDown"
            >
              <canvas ref="waveformCanvas" class="voice-recorder__waveform-canvas"></canvas>
              <div
                class="voice-recorder__unselected-area voice-recorder__unselected-area--left"
                :style="{ width: `${(selectionStart / duration) * 100}%` }"
              ></div>
              <div
                class="voice-recorder__unselected-area voice-recorder__unselected-area--right"
                :style="{ width: `${100 - (selectionEnd / duration) * 100}%` }"
              ></div>
              <div
                class="voice-recorder__selection"
                :style="selectionStyle"
              >
                <div class="voice-recorder__selection-content">
                  <span class="voice-recorder__selection-time">
                    {{ formatTime(selectionDuration) }}
                  </span>
                </div>

                <div
                  class="voice-recorder__handle voice-recorder__handle--left"
                  @mousedown="startDrag($event, 'start')"
                >
                  <div class="voice-recorder__handle-line"></div>
                  <div class="voice-recorder__handle-time">
                    {{ formatTime(selectionStart) }}
                  </div>
                </div>

                <div
                  class="voice-recorder__handle voice-recorder__handle--right"
                  @mousedown="startDrag($event, 'end')"
                >
                  <div class="voice-recorder__handle-line"></div>
                  <div class="voice-recorder__handle-time">
                    {{ formatTime(selectionEnd) }}
                  </div>
                </div>
              </div>

              <div
                class="voice-recorder__progress"
                :style="progressStyle"
                v-if="duration > 0"
              ></div>

              <div class="voice-recorder__timeline">
                <div
                  v-for="time in timelineMarkers"
                  :key="time"
                  class="voice-recorder__timeline-marker"
                  :style="{ left: `${(time / duration) * 100}%` }"
                >
                  <span class="voice-recorder__timeline-label">
                    {{ formatTime(time) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="voice-recorder__time-info">
            <div class="voice-recorder__time-item">
              <span class="voice-recorder__time-label">Start:</span>
              <span class="voice-recorder__time-value">{{ formatTime(selectionStart) }}</span>
            </div>
            <div class="voice-recorder__time-item">
              <span class="voice-recorder__time-label">End:</span>
              <span class="voice-recorder__time-value">{{ formatTime(selectionEnd) }}</span>
            </div>
            <div class="voice-recorder__time-item">
              <span class="voice-recorder__time-label">Duration:</span>
              <span class="voice-recorder__time-value">{{ formatTime(selectionDuration) }}</span>
            </div>
          </div>

          <div class="voice-recorder__quick-actions">
            <button
              @click="() => setSelectionToStart()"
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

        <div class="voice-recorder__section">
          <h3 class="voice-recorder__subtitle">Controls</h3>
          <div class="voice-recorder__controls">
            <button
              @click="() => playSelection()"
              :disabled="!hasSelection || isPlayingSelection"
              class="voice-recorder__button voice-recorder__button--primary"
            >
              {{ isPlayingSelection ? 'Playing...' : 'Play Selection' }}
            </button>
            <button
              @click="() => previewTrimmed()"
              :disabled="!hasSelection || isProcessing"
              class="voice-recorder__button voice-recorder__button--secondary"
            >
              Preview Trimmed
            </button>
            <button
              @click="() => previewTrimmed(true)"
              :disabled="!hasSelection || isProcessing"
              class="voice-recorder__button voice-recorder__button--secondary"
            >
              {{ isProcessing ? 'Saving...' : 'Save to Library' }}
            </button>
            <button
              @click="() => resetSelection()"
              class="voice-recorder__button voice-recorder__button--secondary"
            >
              Reset
            </button>
          </div>
        </div>

        <div v-if="previewUrl" class="voice-recorder__section">
          <h3 class="voice-recorder__subtitle">Preview</h3>
          <audio :src="previewUrl" controls class="voice-recorder__audio-player"></audio>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

const route = useRoute()
const router = useRouter()
const store = useStore()

const goBack = () => {
  router.push('/dictophone')
}

const recordingId = computed(() => route.params.id as string)
const recording = computed(() => {
  const recordings = store.getters['dictophone/getRecordings']
  return recordings.find((r: any) => r.id === recordingId.value)
})
const hasSelection = computed(() => selectionStart.value > 0 || selectionEnd.value < duration.value)
const selectionDuration = computed(() => selectionEnd.value - selectionStart.value)
const selectionStyle = computed(() => {
  if (duration.value <= 0) return { left: '0%', width: '0%' }
  const left = (selectionStart.value / duration.value) * 100
  const width = ((selectionEnd.value - selectionStart.value) / duration.value) * 100
  return {
    left: `${left}%`,
    width: `${width}%`
  }
})
const progressStyle = computed(() => {
  if (duration.value <= 0) return { left: '0%' }
  return {
    left: `${(currentTime.value / duration.value) * 100}%`
  }
})
const timelineMarkers = computed(() => {
  const dur = duration.value
  if (dur <= 0 || !isFinite(dur) || isNaN(dur)) {
    return []
  }
  const markers = []
  const interval = dur >= 60 ? 10 : 5
  const maxMarkers = 1000
  const maxDuration = 24 * 60 * 60
  const safeDuration = Math.min(dur, maxDuration)
  for (let time = 0; time <= safeDuration && markers.length < maxMarkers; time += interval) {
    markers.push(time)
  }
  return markers
})

const audioPlayer = ref<HTMLAudioElement>()
const waveformCanvas = ref<HTMLCanvasElement>()
const waveformContainer = ref<HTMLDivElement>()

const duration = ref(0)
const currentTime = ref(0)
const selectionStart = ref(0)
const selectionEnd = ref(0)
const isDragging = ref(false)
const dragType = ref<'start' | 'end' | 'selection' | null>(null)
const isProcessing = ref(false)
const isPlayingSelection = ref(false)
const previewUrl = ref<string | null>(null)
const audioContext = ref<AudioContext | null>(null)
const audioBuffer = ref<AudioBuffer | null>(null)

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const drawWaveform = () => {
  if (!waveformCanvas.value || !recording.value?.url) return

  const canvas = waveformCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  const containerWidth = waveformContainer.value?.clientWidth || 800
  const containerHeight = waveformContainer.value?.clientHeight || 140

  canvas.width = containerWidth
  canvas.height = containerHeight
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  if (!audioBuffer.value) {
    loadAudioBuffer(recording.value.url)
      .then(() => {
        drawWaveformAfterBufferLoad()
      })
      .catch(error => {
        console.error('Error loading audio buffer:', error)
        drawFallbackWaveform()
      })
    return
  }

  drawWaveformAfterBufferLoad()

  function drawWaveformAfterBufferLoad() {
    if (!audioBuffer.value) {
      console.error('No audio buffer available')
      drawFallbackWaveform()
      return
    }

    try {
      const buffer = audioBuffer.value
      const data = buffer.getChannelData(0)
      const step = Math.ceil(data.length / containerWidth)
      const amp = containerHeight / 2
      ctx.fillStyle = '#3498db'
      ctx.strokeStyle = '#2980b9'
      ctx.lineWidth = 2

      ctx.beginPath()

      for (let i = 0; i < containerWidth; i++) {
        let min = 1.0
        let max = -1.0
        for (let j = 0; j < step; j++) {
          const datum = data[(i * step) + j]
          if (datum === undefined) break

          if (datum < min) min = datum
          if (datum > max) max = datum
        }

        const x = i
        const yMin = (1 + min) * amp
        const yMax = (1 + max) * amp

        ctx.moveTo(x, yMin)
        ctx.lineTo(x, yMax)
      }

      ctx.stroke()

      const gradient = ctx.createLinearGradient(0, 0, 0, containerHeight)
      gradient.addColorStop(0, 'rgba(52, 152, 219, 0.3)')
      gradient.addColorStop(0.5, 'rgba(41, 128, 185, 0.5)')
      gradient.addColorStop(1, 'rgba(52, 152, 219, 0.3)')

      ctx.strokeStyle = gradient
      ctx.stroke()

    } catch (error) {
      console.error('Error drawing waveform:', error)
      drawFallbackWaveform()
    }
  }

  function drawFallbackWaveform() {
    ctx.fillStyle = '#ecf0f1'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#bdc3c7'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '14px Arial'
    ctx.fillText('Waveform not available', canvas.width / 2, canvas.height / 2)
  }
}

const previewTrimmed = (forSave = false) => {
  if (!audioBuffer.value || !hasSelection.value) return
  isProcessing.value = true
  try {
    if (!audioContext.value) {
      audioContext.value = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    const buffer = audioBuffer.value
    const startSample = Math.floor(selectionStart.value * buffer.sampleRate)
    const endSample = Math.floor(selectionEnd.value * buffer.sampleRate)
    const length = endSample - startSample
    
    const newBuffer = audioContext.value.createBuffer(
      buffer.numberOfChannels,
      length,
      buffer.sampleRate
    )

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel)
      const newChannelData = newBuffer.getChannelData(channel)

      for (let i = 0; i < length; i++) {
        const sourceIndex = startSample + i
        if (sourceIndex < channelData.length) {
          newChannelData[i] = channelData[sourceIndex]
        }
      }
    }

    audioBufferToWav(newBuffer)
      .then(wavBlob => {
        if (forSave) {
          createAndSaveRecording(wavBlob)
        } else {
          if (previewUrl.value) {
            URL.revokeObjectURL(previewUrl.value)
          }
          previewUrl.value = URL.createObjectURL(wavBlob)
        }
      })
      .catch(error => {
        console.error('Error converting to WAV:', error)
        alert('Error creating audio. Please try again.')
      })
      .finally(() => {
        isProcessing.value = false
      })

  } catch (error) {
    console.error('Error processing audio:', error)
    alert('Error processing audio. Please try again.')
    isProcessing.value = false
  }
}

const onTimeUpdate = () => {
  if (audioPlayer.value) {
    currentTime.value = audioPlayer.value.currentTime
  }
}

const startDrag = (event: MouseEvent, type: 'start' | 'end' | 'selection') => {
  event.preventDefault()
  event.stopPropagation()
  isDragging.value = true
  dragType.value = type
  document.body.classList.add('no-select')
  if (waveformContainer.value) {
    waveformContainer.value.classList.add('dragging', `dragging-${type}`)
  }
  if (type === 'selection') {
      onMouseMove(event)
  }
  window.addEventListener('mousemove', onMouseMove as any)
  window.addEventListener('mouseup', stopDrag)
}

const onWaveformMouseDown = (event: MouseEvent) => {
  if (!waveformContainer.value || duration.value <= 0) return
  let clientX: number
  clientX = (event as MouseEvent).clientX
  const rect = waveformContainer.value.getBoundingClientRect()
  const x = clientX - rect.left
  const percent = Math.max(0, Math.min(1, x / rect.width))
  const time = percent * duration.value
  const selectionStartPercent = selectionStart.value / duration.value
  const selectionEndPercent = selectionEnd.value / duration.value
  const handleThreshold = 0.015

  if (Math.abs(percent - selectionStartPercent) < handleThreshold) {
    startDrag(event, 'start')
    return
  }

  if (Math.abs(percent - selectionEndPercent) < handleThreshold) {
    startDrag(event, 'end')
    return
  }

  if (percent >= selectionStartPercent && percent <= selectionEndPercent) {
    startDrag(event, 'selection')
    return
  }
  
  const newSelectionWidth = Math.min(5, duration.value * 0.1)
  const newStart = Math.max(0, time - newSelectionWidth / 2)
  const newEnd = Math.min(duration.value, newStart + newSelectionWidth)

  selectionStart.value = newStart
  selectionEnd.value = newEnd
  startDrag(event, 'selection')
}

const onMouseMove = (event: MouseEvent) => {
  if (!isDragging.value || !waveformContainer.value || duration.value <= 0) return
  event.preventDefault()
  let clientX: number
  clientX = (event as MouseEvent).clientX
  const rect = waveformContainer.value.getBoundingClientRect()
  const x = clientX - rect.left
  const percent = Math.max(0, Math.min(1, x / rect.width))
  const time = percent * duration.value

  if (dragType.value === 'start') {
    selectionStart.value = Math.max(0, Math.min(time, selectionEnd.value - 0.1))
  } else if (dragType.value === 'end') {
    selectionEnd.value = Math.min(duration.value, Math.max(time, selectionStart.value + 0.1))
  } else if (dragType.value === 'selection') {
    const selectionWidth = selectionEnd.value - selectionStart.value
    const newStart = Math.max(0, Math.min(duration.value - selectionWidth, time - selectionWidth / 2))
    selectionStart.value = newStart
    selectionEnd.value = newStart + selectionWidth
  }
}

const stopDrag = () => {
  if (isDragging.value) {
    isDragging.value = false
    dragType.value = null

    document.body.classList.remove('no-select')
    
    if (waveformContainer.value) {
      waveformContainer.value.classList.remove('dragging', 'dragging-start', 'dragging-end', 'dragging-selection')
    }

    window.removeEventListener('mousemove', onMouseMove as any)
    window.removeEventListener('mouseup', stopDrag)
  }
}

const playSelection = () => {
  if (!audioPlayer.value || !hasSelection.value) return
  
  isPlayingSelection.value = true
  audioPlayer.value.currentTime = selectionStart.value
  
  const playPromise = audioPlayer.value.play()
  
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        const checkTime = () => {
          if (!audioPlayer.value) {
            isPlayingSelection.value = false
            return
          }

          if (audioPlayer.value.currentTime >= selectionEnd.value) {
            audioPlayer.value.pause()
            isPlayingSelection.value = false
          } else if (isPlayingSelection.value) {
            requestAnimationFrame(checkTime)
          }
        }
        checkTime()
      })
      .catch(error => {
        isPlayingSelection.value = false
        console.error('Error playing selection:', error)
      })
  }
}

const resetSelection = () => {
  selectionStart.value = 0
  selectionEnd.value = duration.value
  previewUrl.value = null
}

const setSelectionToStart = () => {
  selectionStart.value = 0
}

const setSelectionToEnd = () => {
  selectionEnd.value = duration.value
}

const selectAll = () => {
  selectionStart.value = 0
  selectionEnd.value = duration.value
}

const handleResize = () => {
  if (waveformCanvas.value && audioBuffer.value) {
    drawWaveform()
  }
}

const loadAudioBuffer = (url: string): Promise<AudioBuffer> => {
  return new Promise((resolve, reject) => {
    try {
      if (!audioContext.value) {
        audioContext.value = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to load audio: ${response.status} ${response.statusText}`)
          }
          return response.arrayBuffer()
        })
        .then(arrayBuffer => {
          if (!audioContext.value) {
            throw new Error('AudioContext not available')
          }

          return audioContext.value.decodeAudioData(arrayBuffer)
        })
        .then(buffer => {
          audioBuffer.value = buffer
          if (audioPlayer.value && buffer) {
            duration.value = buffer.duration
            selectionStart.value = 0
            selectionEnd.value = buffer.duration
          }

          resolve(buffer)
        })
        .catch(error => {
          console.error('Error loading audio buffer:', error)
          reject(error)
        })
    } catch (error) {
      console.error('Error in loadAudioBuffer:', error)
      reject(error)
    }
  })
}

const onAudioLoaded = () => {
  if (audioPlayer.value) {
    const newDuration = audioPlayer.value.duration;

    if (isFinite(newDuration) && !isNaN(newDuration) && newDuration > 0) {
      duration.value = newDuration;
      selectionStart.value = 0;
      selectionEnd.value = newDuration;
      
      nextTick(() => {
        drawWaveform();
      });
    } else {
      console.error('Invalid audio duration:', newDuration);
      duration.value = 0;
    }
  }
}

const createAndSaveRecording = (blob: Blob) => {
  const file = new File([blob], `trimmed_${recording.value?.name || 'recording'}.wav`, {
    type: 'audio/wav'
  });

  const trimmedRecording = {
    id: Date.now().toString(),
    name: `Edited: ${recording.value?.name || 'Recording'}`,
    url: URL.createObjectURL(file),
    duration: selectionDuration.value,
    size: file.size,
    timestamp: new Date().toISOString(),
    originalRecordingId: recordingId.value,
    trimRange: {
      start: selectionStart.value,
      end: selectionEnd.value
    }
  };

  store.dispatch('dictophone/addRecording', trimmedRecording)
    .then(() => {
      alert('Trimmed audio saved to your library successfully!');
      setTimeout(() => {
        router.push('/dictophone');
      }, 1500);
    })
    .catch(error => {
      console.error('Error saving to store:', error);
      alert('Error saving trimmed audio. Please try again.');
    })
    .finally(() => {
      isProcessing.value = false;
    });
};

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
    
    const wavBlob = new Blob([arrayBuffer], { type: 'audio/wav' })
    resolve(wavBlob)
  })
}

onMounted(() => {
  window.addEventListener('resize', handleResize)

  nextTick(() => {
    if (recording.value?.url) {
      drawWaveform()
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)

  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  
  if (audioContext.value) {
    audioContext.value.close()
  }
})

watch(() => recording.value?.url, () => {
  if (audioPlayer.value && recording.value?.url) {
    audioPlayer.value.load()
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
    height: 140px;
    background: #e3f2fd;
    border: 1px solid #90caf9;
    border-radius: 0.5rem;
    overflow: hidden;
    cursor: pointer;
    user-select: none;

    &.dragging {
      cursor: grabbing;
    }
  }

  &__waveform-canvas {
    width: 100%;
    height: 100%;
    display: block;
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

  &__handle-time {
    position: absolute;
    top: -25px;
    background: #2c3e50;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    white-space: nowrap;
  }

  &__progress {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #e74c3c;
    pointer-events: none;
    z-index: 5;
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

  &__empty {
    text-align: center;
    color: #7f8c8d;
    padding: 2rem;
  }
}

.no-select {
  user-select: none;
}
</style>
