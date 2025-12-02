<template>
  <main class="voice-recorder" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:2:3">
    <div class="voice-recorder__header" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:3:5">
      <h1 class="voice-recorder__title" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:4:7">Recording Editor</h1>
      <button
        @click="() => goBack()"
        class="voice-recorder__button voice-recorder__button--secondary" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:5:7"
      >
        ← Back
      </button>
    </div>

    <div class="voice-recorder__content" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:13:5">
      <div v-if="!recording" class="voice-recorder__section" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:14:7">
        <div class="voice-recorder__empty" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:15:9">
          <p data-v-inspector="src/components/pages/DictophoneEditorPage.vue:16:11">Recording not found</p>
          <p data-v-inspector="src/components/pages/DictophoneEditorPage.vue:17:11">ID: {{ recordingId }}</p>
        </div>
      </div>

      <div v-else data-v-inspector="src/components/pages/DictophoneEditorPage.vue:21:7">
        <div class="voice-recorder__section" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:22:9">
          <h3 class="voice-recorder__subtitle" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:23:11">Original Recording</h3>
          <audio
            :src="recording.url"
            ref="audioPlayer"
            controls
            class="voice-recorder__audio-player"
            @loadedmetadata="onAudioLoaded"
            @timeupdate="onTimeUpdate" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:24:11"
          ></audio>
        </div>

        <div class="voice-recorder__section" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:34:9">
          <h3 class="voice-recorder__subtitle" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:35:11">Trim Audio</h3>

          <div class="voice-recorder__waveform-container" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:38:11">
            <div
              class="voice-recorder__waveform"
              ref="waveformContainer"
              @mousedown="onWaveformMouseDown"
              @touchstart="onWaveformTouchStart" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:39:13"
            >
              <canvas ref="waveformCanvas" class="voice-recorder__waveform-canvas" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:46:15"></canvas>
              <div
                class="voice-recorder__unselected-area voice-recorder__unselected-area--left"
                :style="{ width: `${(selectionStart / duration) * 100}%` }" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:49:15"
              ></div>
              <div
                class="voice-recorder__unselected-area voice-recorder__unselected-area--right"
                :style="{ width: `${100 - (selectionEnd / duration) * 100}%` }" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:55:15"
              ></div>
              <div
                class="voice-recorder__selection"
                :style="selectionStyle" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:61:15"
              >
                <div class="voice-recorder__selection-content" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:65:17">
                  <span class="voice-recorder__selection-time" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:66:19">
                    {{ formatTime(selectionDuration) }}
                  </span>
                </div>

                <div
                  class="voice-recorder__handle voice-recorder__handle--left"
                  @mousedown="startDrag($event, 'start')"
                  @touchstart="startDrag($event, 'start')" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:72:17"
                >
                  <div class="voice-recorder__handle-line" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:77:19"></div>
                  <div class="voice-recorder__handle-time" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:78:19">
                    {{ formatTime(selectionStart) }}
                  </div>
                </div>

                <div
                  class="voice-recorder__handle voice-recorder__handle--right"
                  @mousedown="startDrag($event, 'end')"
                  @touchstart="startDrag($event, 'end')" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:84:17"
                >
                  <div class="voice-recorder__handle-line" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:89:19"></div>
                  <div class="voice-recorder__handle-time" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:90:19">
                    {{ formatTime(selectionEnd) }}
                  </div>
                </div>
              </div>

              <div
                class="voice-recorder__progress"
                :style="progressStyle"
                v-if="duration > 0" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:97:15"
              ></div>

              <div class="voice-recorder__timeline" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:104:15">
                <div
                  v-for="time in timelineMarkers"
                  :key="time"
                  class="voice-recorder__timeline-marker"
                  :style="{ left: `${(time / duration) * 100}%` }" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:105:17"
                >
                  <span class="voice-recorder__timeline-label" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:111:19">
                    {{ formatTime(time) }}
                  </span>
                </div>
              </div>
            </div>
          </div>


          <div class="voice-recorder__time-info" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:120:11">
            <div class="voice-recorder__time-item" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:121:13">
              <span class="voice-recorder__time-label" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:122:15">Start:</span>
              <span class="voice-recorder__time-value" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:123:15">{{ formatTime(selectionStart) }}</span>
            </div>
            <div class="voice-recorder__time-item" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:125:13">
              <span class="voice-recorder__time-label" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:126:15">End:</span>
              <span class="voice-recorder__time-value" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:127:15">{{ formatTime(selectionEnd) }}</span>
            </div>
            <div class="voice-recorder__time-item" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:129:13">
              <span class="voice-recorder__time-label" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:130:15">Duration:</span>
              <span class="voice-recorder__time-value" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:131:15">{{ formatTime(selectionDuration) }}</span>
            </div>
          </div>


          <div class="voice-recorder__quick-actions" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:136:11">
            <button
              @click="() => setSelectionToStart()"
              class="voice-recorder__quick-action" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:137:13"
            >
              Set to Start
            </button>
            <button
              @click="() => setSelectionToEnd()"
              class="voice-recorder__quick-action" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:143:13"
            >
              Set to End
            </button>
            <button
              @click="() => selectAll()"
              class="voice-recorder__quick-action" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:149:13"
            >
              Select All
            </button>
            <button
              @click="() => saveTrimmedAudio()"
              :disabled="!hasSelection || isProcessing"
              class="voice-recorder__button voice-recorder__button--info"
              data-v-inspector="src/components/pages/DictophoneEditorPage.vue:182:13"
                >
              {{ isProcessing ? 'Saving...' : 'Save to Library' }}
            </button>
          </div>
        </div>

        <div class="voice-recorder__section" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:158:9">
          <h3 class="voice-recorder__subtitle" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:159:11">Controls</h3>
          <div class="voice-recorder__controls" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:160:11">
            <button
              @click="() => playSelection()"
              :disabled="!hasSelection || isPlayingSelection"
              class="voice-recorder__button voice-recorder__button--primary" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:161:13"
            >
              {{ isPlayingSelection ? 'Playing...' : 'Play Selection' }}
            </button>
            <button
              @click="() => previewTrimmed()"
              :disabled="!hasSelection || isProcessing"
              class="voice-recorder__button voice-recorder__button--secondary" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:168:13"
            >
              Preview Trimmed
            </button>
            <button
              @click="() => trimAudio()"
              :disabled="!hasSelection || isProcessing"
              class="voice-recorder__button voice-recorder__button--success" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:175:13"
            >
              {{ isProcessing ? 'Processing...' : 'Apply Trim' }}
            </button>
            <button
              @click="() => resetSelection()"
              class="voice-recorder__button voice-recorder__button--default" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:182:13"
            >
              Reset
            </button>
          </div>
        </div>

        <div v-if="previewUrl" class="voice-recorder__section" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:191:9">
          <h3 class="voice-recorder__subtitle" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:192:11">Preview</h3>
          <audio :src="previewUrl" controls class="voice-recorder__audio-player" data-v-inspector="src/components/pages/DictophoneEditorPage.vue:193:11"></audio>
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

  // Safety limits
  const maxMarkers = 1000
  const maxDuration = 24 * 60 * 60 // 24 hours maximum

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

const saveTrimmedAudio = () => {
  if (!audioBuffer.value || !hasSelection.value) return;

  isProcessing.value = true;
  if (previewUrl.value) {
    saveFromPreviewUrl();
  } else {
    trimAudio();
  }
};

const saveFromPreviewUrl = () => {
  if (!previewUrl.value) return;

  fetch(previewUrl.value)
    .then(response => response.blob())
    .then(blob => {
      createAndSaveRecording(blob);
    })
    .catch(error => {
      console.error('Error fetching preview URL:', error);
      trimAudio();
    });
};

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

const previewTrimmed = () => {
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
        if (previewUrl.value) {
          URL.revokeObjectURL(previewUrl.value)
        }
        previewUrl.value = URL.createObjectURL(wavBlob)
      })
      .catch(error => {
        console.error('Error converting to WAV:', error)
        alert('Error creating preview. Please try again.')
      })
      .finally(() => {
        isProcessing.value = false
      })

  } catch (error) {
    console.error('Error creating preview:', error)
    alert('Error creating preview. Please try again.')
    isProcessing.value = false
  }
}

const onTimeUpdate = () => {
  if (audioPlayer.value) {
    currentTime.value = audioPlayer.value.currentTime
  }
}
const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
const startDrag = (event: MouseEvent | TouchEvent, type: 'start' | 'end' | 'selection') => {
  event.preventDefault()
  event.stopPropagation()
  isDragging.value = true
  dragType.value = type

  document.body.classList.add('no-select')
  if (waveformContainer.value) {
    waveformContainer.value.classList.add('dragging', `dragging-${type}`)
  }
  if (type === 'selection') {
    if (event instanceof MouseEvent) {
      onMouseMove(event)
    } else if (event instanceof TouchEvent && event.touches[0]) {
      onMouseMove(event)
    }
  }

  window.addEventListener('mousemove', onMouseMove as any)
  window.addEventListener('mouseup', stopDrag)
}
const onWaveformMouseDown = (event: MouseEvent) => {
  if (!waveformContainer.value || duration.value <= 0) return
  const rect = waveformContainer.value.getBoundingClientRect()
  const x = event.clientX - rect.left
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
const onWaveformTouchStart = (event: TouchEvent) => {
  if (!waveformContainer.value || duration.value <= 0) return

  event.preventDefault()
  const rect = waveformContainer.value.getBoundingClientRect()
  const x = event.touches[0].clientX - rect.left
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
  const rect = waveformContainer.value.getBoundingClientRect()
  const x = event.clientX - rect.left
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
  forceUpdate()
  console.log('Dragging:', {
    type: dragType.value,
    start: selectionStart.value,
    end: selectionEnd.value,
    time
  })
}

const forceUpdate = () => {
  selectionStart.value = selectionStart.value
  selectionEnd.value = selectionEnd.value
}
const stopDrag = () => {
  if (isDragging.value) {
    console.log('Stop dragging:', dragType.value)
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
  } else {
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
    setTimeout(() => {
      if (audioPlayer.value && !audioPlayer.value.paused) {
        checkTime()
      } else {
        isPlayingSelection.value = false
      }
    }, 100)
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
      console.log('Audio loaded, duration:', newDuration);
      nextTick(() => {
        drawWaveform();
      });
    } else {
      console.error('Invalid audio duration:', newDuration);
      duration.value = 0;
    }
  }
}

const trimAudio = () => {
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
    if (length <= 0 || startSample < 0 || endSample > buffer.length) {
      throw new Error('Invalid selection range')
    }
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
        const downloadLink = document.createElement('a')
        const blobUrl = URL.createObjectURL(wavBlob)
        downloadLink.href = blobUrl
        downloadLink.download = `trimmed-${recording.value?.name || 'recording'}-${new Date().getTime()}.wav`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)

        setTimeout(() => {
          URL.revokeObjectURL(blobUrl)
        }, 1000)

        alert('Audio trimmed successfully! The file has been downloaded.')
      })
      .catch(error => {
        console.error('Error converting to WAV:', error)
        alert('Error trimming audio. Please try again.')
      })
      .finally(() => {
        isProcessing.value = false
      })

  } catch (error) {
    console.error('Error trimming audio:', error)
    alert('Error trimming audio. Please try again.')
    isProcessing.value = false
  }
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
    view.setUint32(offset, 16, true); offset += 4 // chunk size
    view.setUint16(offset, 1, true); offset += 2 // PCM format
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
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('resize', handleResize)

  nextTick(() => {
    if (recording.value?.url) {
      drawWaveform()
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', stopDrag)
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
    border-radius: 0.75rem;
    padding: 1.5rem;
    background-color: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &__subtitle {
    color: #2c3e50;
    margin-bottom: 1.5rem;
    font-size: 1.2rem;
    font-weight: 600;
  }

  &__audio-player {
    width: 100%;
    margin-bottom: 1rem;
    border-radius: 0.5rem;
  }

  &__waveform-container {
    background: #f8f9fa;
    border-radius: 0.75rem;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  &__waveform {
    position: relative;
    height: 140px;
    background: linear-gradient(180deg, #e3f2fd 0%, #bbdefb 100%);
    border: 2px solid #90caf9;
    border-radius: 0.5rem;
    overflow: hidden;
    cursor: pointer;
    user-select: none;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);

    &.dragging {
      cursor: grabbing;

      &.dragging-start .voice-recorder__handle--left,
      &.dragging-end .voice-recorder__handle--right,
      &.dragging-selection .voice-recorder__selection {
        filter: brightness(0.9);
        transform: scale(1.05);
      }
    }
  }

  &__waveform-canvas {
    width: 100%;
    height: 100%;
    display: block;
    opacity: 0.7;
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
    background: linear-gradient(180deg, rgba(52, 152, 219, 0.4) 0%, rgba(41, 128, 185, 0.4) 100%);
    border: 2px solid #3498db;
    border-radius: 4px;
    pointer-events: none;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);

    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__selection-content {
    text-align: center;
    pointer-events: none;
  }

  &__selection-time {
    background: rgba(255, 255, 255, 0.9);
    color: #2c3e50;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  &__handle {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 16px;
    cursor: col-resize;
    pointer-events: all;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.1);
    }

    &--left {
      left: -8px;
    }

    &--right {
      right: -8px;
    }
  }

  &__handle-line {
    width: 4px;
    height: 60%;
    background: #3498db;
    border-radius: 2px;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: -8px;
      bottom: -8px;
      left: -6px;
      right: -6px;
    }
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
    opacity: 0;
    transform: translateY(-5px);
    transition: all 0.2s ease;
    pointer-events: none;
  }

  &__handle:hover &__handle-time {
    opacity: 1;
    transform: translateY(0);
  }

  &__progress {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 3px;
    background: #e74c3c;
    pointer-events: none;
    z-index: 5;
    box-shadow: 0 0 4px rgba(231, 76, 60, 0.8);
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
    white-space: nowrap;
  }

  &__time-info {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  &__time-item {
    text-align: center;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 0.5rem;
    border: 1px solid #e1e1e1;
  }

  &__time-label {
    display: block;
    font-size: 0.875rem;
    color: #7f8c8d;
    margin-bottom: 0.5rem;
  }

  &__time-value {
    display: block;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    color: #2c3e50;
    font-size: 1.2rem;
  }

  &__quick-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  &__quick-action {
    padding: 0.5rem 1rem;
    background: #95a5a6;
    color: white;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s ease;

    &:hover {
      background: #7f8c8d;
      transform: translateY(-1px);
    }
  }

  &__controls {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  &__button {
    padding: 0.875rem 1.75rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 140px;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &--primary {
      background: linear-gradient(135deg, #42b883, #369870);
      color: white;

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #369870, #2d8059);
      }
    }

    &--secondary {
      background: linear-gradient(135deg, #3498db, #2980b9);
      color: white;

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #2980b9, #21618c);
      }
    }

    &--success {
      background: linear-gradient(135deg, #27ae60, #229954);
      color: white;

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #229954, #1e8449);
      }
    }

    &--default {
      background: linear-gradient(135deg, #95a5a6, #7f8c8d);
      color: white;

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #7f8c8d, #6c7b7d);
      }
    }
  }

  &__empty {
    text-align: center;
    color: #7f8c8d;
    padding: 3rem;
    font-size: 1.1rem;
  }
}

/* Глобальные стили */
:global(.no-select) {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  cursor: grabbing !important;
}


:global(.fade-enter-active, .fade-leave-active) {
  transition: opacity 0.3s ease;
}

:global(.fade-enter-from, .fade-leave-to) {
  opacity: 0;
}
</style>