<template>
  <main class="voice-recorder">
    <h1 class="voice-recorder__title">Dictophone</h1>

    <div class="voice-recorder__controls">
      <button
        @click="() => handleStartRecording()"
        :disabled="isRecording"
        class="voice-recorder__button voice-recorder__button--primary"
      >
        Start Recording
      </button>

      <button
        @click="() => handleStopRecording()"
        :disabled="!isRecording"
        class="voice-recorder__button voice-recorder__button--secondary"
      >
        Stop
      </button>

      <button
        @click="() => handleClearAllRecordings()"
        :disabled="!hasRecordings"
        class="voice-recorder__button voice-recorder__button--secondary"
      >
        Clear All
      </button>

      <button
        @click="() => handleSaveRecord()"
        :disabled="isRecording"
        class="voice-recorder__button voice-recorder__button--secondary"
      >
        Save
      </button>

      <button
        @click="() => handleDiscardRecording()"
        :disabled="isRecording"
        class="voice-recorder__button voice-recorder__button--secondary"
      >
        Discard
      </button>
    </div>

    <div class="voice-recorder__status">
      <div
        v-if="isRecording"
        class="voice-recorder__indicator voice-recorder__indicator--recording"
      >
        <span class="recorder"></span>
        Recording
      </div>
      <div
        v-else-if="currentAudioUrl"
        class="voice-recorder__indicator voice-recorder__indicator--ready"
      >
        ✅ Recording ready
      </div>
    </div>

    <audio
      v-if="currentAudioUrl"
      :src="currentAudioUrl"
      controls
      class="voice-recorder__audio-player"
    ></audio>

    <div
      v-if="recordings"
      class="voice-recorder__recordings"
    >
    >
      <h3 class="voice-recorder__subtitle">
        Recordings ({{ recordingsCount }})
      </h3>

      <div class="voice-recorder__list">
        <div
          v-for="recording in recordings"
          :key="recording.id"
          class="voice-recorder__item"
        >
          <div class="voice-recorder__item-info">
            <span class="voice-recorder__item-name">{{ recording.name }}</span>
            <span class="voice-recorder__item-date">{{ recording.date }}</span>
          </div>

          <div class="voice-recorder__item-controls">
            <audio
              :src="recording.url"
              controls
              class="voice-recorder__item-audio"
            ></audio>
              <button
              @click="() => handleEditRecording(recording.id)"
              class="voice-recorder__button voice-recorder__button--small voice-recorder__button--secondary"
              >
              Edit
            </button>
            <button
              @click="() => handleDeleteRecording(recording.id)"
              class="voice-recorder__button voice-recorder__button--small voice-recorder__button--danger"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div class="voice-recorder__summary">
        Total recordings: {{ recordingsCount }}
      </div>
    </div>

    <div
      v-else
      class="voice-recorder__empty"
    >
      <p>No recordings yet. Start by clicking the record button!</p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { router } from "@/router"

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
const saveRecord = () => store.dispatch('dictophone/saveRecording')
const discardRecording = () => store.dispatch('dictophone/discardRecording')
const handleEditRecording = (id: string) => {
  router.push({
    name: 'DICTOPHONE_EDITOR',
    params: { id: id }
  })
}

const handleStartRecording = () => startRecording()
const handleStopRecording = () => stopRecording()
const handleDeleteRecording = (id: string) => deleteRecording(id)
const handleClearAllRecordings = () => clearAllRecordings()
const handleSaveRecord = () => saveRecord()
const handleDiscardRecording = () => discardRecording()

onUnmounted(() => {
  if (isRecording.value) {
    stopRecording()
  }
})
</script>

<style scoped lang="scss">
.voice-recorder {
  $self: &;
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;

  &__title {
    color: #2c3e50;
    margin-bottom: 2rem;
    text-align: center;
  }

  &__subtitle {
    color: #2c3e50;
    margin-bottom: 1rem;
  }

  &__controls {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 2rem;
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

    &--danger {
      background-color: #e74c3c;
      color: white;

      &:hover:not(:disabled) {
        background-color: #c0392b;
      }
    }

    &--small {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }
  }

  &__status {
    text-align: center;
    margin-bottom: 2rem;
    min-height: 2rem;
  }

  &__indicator {
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &--recording {
      color: #e74c3c;
    }

    &--ready {
      color: #27ae60;
    }
  }


  &__audio-player {
    width: 100%;
    margin-bottom: 2rem;
  }

  &__recordings {
    margin-top: 2rem;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  &__item {
    border: 1px solid #e1e1e1;
    border-radius: 0.5rem;
    padding: 1rem;
    background-color: #f8f9fa;

    &-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    &-name {
      font-weight: bold;
      color: #2c3e50;
    }

    &-date {
      color: #7f8c8d;
      font-size: 0.875rem;
    }

    &-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    &-audio {
      flex: 1;
    }
  }

  &__summary {
    text-align: center;
    color: #7f8c8d;
    font-size: 0.875rem;
    margin-top: 1rem;
  }

  &__empty {
    text-align: center;
    color: #7f8c8d;
    padding: 2rem;
  }
}
</style>
