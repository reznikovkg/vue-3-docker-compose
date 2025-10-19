<template>
  <div class="voice-recorder">
    <h2 class="title">Dictophone </h2>

    <RouterLink :to="{ name: $route.name }">To Index</RouterLink>

    <div class="controls">
      <button
        @click="() => startRecording()"
        :disabled="isRecording"
        class="button button-primary"
      >
        🎤 Start Recording
      </button>

      <button
        @click="() => stopRecording()"
        :disabled="!isRecording"
        class="button button-secondary"
      >
        ⏹️ Stop
      </button>

      <button
        @click="() => clearAllRecordings()"
        :disabled="!hasRecordings"
        class="button button-danger"
      >
        🗑️ Clear All
      </button>
    </div>

    <div class="status">
      <div v-if="isRecording" class="recording-indicator">
        <span class="pulse"></span>
        Recording...
      </div>
      <div v-else-if="currentAudioUrl" class="ready-indicator">
        ✅ Recording ready
      </div>
    </div>

    <audio
      v-if="currentAudioUrl"
      :src="currentAudioUrl"
      controls
      class="audio-player"
    ></audio>

    <div v-if="recordings" class="recordings-section">
      <h3 class="subtitle">Recordings ({{ recordingsCount }})</h3>

      <div class="recordings-list">
        <div
          v-for="recording in recordings"
          :key="recording.id"
          class="recording-item"
        >
          <div class="recording-info">
            <span class="recording-name">{{ recording.name }}</span>
            <span class="recording-date">{{ recording.date }}</span>
          </div>

          <div class="recording-controls">
            <audio :src="recording.url" controls class="recording-audio"></audio>
            <button
              @click="() => deleteRecording(recording.id)"
              class="button button-small button-danger"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div class="summary">
        Total recordings: {{ recordingsCount }}
      </div>
    </div>

    <div v-else class="empty-state">
      <p>No recordings yet. Start by clicking the record button!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import {router} from "@/router";

const store = useStore()

const isRecording = computed(() => store.getters['dictophone/getIsRecording'])
const recordings = computed(() => store.getters['dictophone/getRecordings'])
const currentAudioUrl = computed(() => store.getters['dictophone/getCurrentAudioUrl'])
const hasRecordings = computed(() => store.getters['dictophone/getHasRecordings'])
const recordingsCount = computed(() => store.getters['dictophone/getRecordingsCount'])

const startRecording = () => store.dispatch('dictophone/startRecording')
const stopRecording = () => store.dispatch('dictophone/stopRecording')
const deleteRecording = (id: string) => store.dispatch('dictophone/deleteRecording', id)
const clearAllRecordings = () => store.dispatch('dictophone/clearAllRecordings')

onUnmounted(() => {
  if (isRecording.value) {
    stopRecording()
  }
})
</script>

<style scoped>
.voice-recorder {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.title {
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
}

.subtitle {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-primary {
  background-color: #42b883;
  color: white;
}

.button-primary:hover:not(:disabled) {
  background-color: #369870;
}

.button-secondary {
  background-color: #3498db;
  color: white;
}

.button-secondary:hover:not(:disabled) {
  background-color: #2980b9;
}

.button-danger {
  background-color: #e74c3c;
  color: white;
}

.button-danger:hover:not(:disabled) {
  background-color: #c0392b;
}

.button-small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.status {
  text-align: center;
  margin-bottom: 2rem;
  min-height: 2rem;
}

.recording-indicator {
  color: #e74c3c;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.pulse {
  width: 12px;
  height: 12px;
  background-color: #e74c3c;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
}

.ready-indicator {
  color: #27ae60;
  font-weight: bold;
}

.audio-player {
  width: 100%;
  margin-bottom: 2rem;
}

.recordings-section {
  margin-top: 2rem;
}

.recordings-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.recording-item {
  border: 1px solid #e1e1e1;
  border-radius: 0.5rem;
  padding: 1rem;
  background-color: #f8f9fa;
}

.recording-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.recording-name {
  font-weight: bold;
  color: #2c3e50;
}

.recording-date {
  color: #7f8c8d;
  font-size: 0.875rem;
}

.recording-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.recording-audio {
  flex: 1;
}

.summary {
  text-align: center;
  color: #7f8c8d;
  font-size: 0.875rem;
  margin-top: 1rem;
}

.empty-state {
  text-align: center;
  color: #7f8c8d;
  padding: 2rem;
}

.error-message {
  background-color: #fee;
  border: 1px solid #e74c3c;
  color: #c0392b;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  text-align: center;
}
</style>
