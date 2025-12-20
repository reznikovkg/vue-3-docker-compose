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
.merge-game {
  $self: &;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;

  &__title {
    color: #2c3e50;
    margin-bottom: 2rem;
    text-align: center;
    font-size: 2rem;
  }

  &__stats {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  &__stat {
    background-color: #f8f9fa;
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    text-align: center;
    min-width: 100px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    &-label {
      display: block;
      color: #7f8c8d;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
      text-transform: uppercase;
    }

    &-value {
      display: block;
      color: #2c3e50;
      font-size: 1.5rem;
      font-weight: bold;
    }
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
    min-width: 140px;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &--primary {
      background-color: #42b883;
      color: white;

      &:hover:not(:disabled) {
        background-color: #369870;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }
    }

    &--secondary {
      background-color: #3498db;
      color: white;

      &:hover:not(:disabled) {
        background-color: #2980b9;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }
    }
  }

  &__board {
    background-color: #f8f9fa;
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    &-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    &-footer {
      text-align: center;
      margin-top: 1.5rem;
      color: #7f8c8d;
    }
  }

  &__moves {
    color: #7f8c8d;

    &-count {
      font-weight: bold;
      color: #2c3e50;
    }
  }

  &__empty-cells {
    &-count {
      font-weight: bold;
      color: #2c3e50;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    grid-template-rows: repeat(8, 1fr);
    gap: 6px;
    aspect-ratio: 1 / 1;
    background-color: #95a5a6;
    padding: 10px;
    border-radius: 0.5rem;
    touch-action: none;
    max-width: 500px;
    margin: 0 auto;
  }

  &__cell {
    background-color: #bdc3c7;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s ease;

    &--empty {
      background-color: rgba(189, 195, 199, 0.4);

      &::after {
        content: '';
        position: absolute;
        width: 20%;
        height: 20%;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 50%;
      }
    }

    &--hovered {
      transform: scale(1.05);
      z-index: 1;
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }
  }

  &__item {
    width: 90%;
    height: 90%;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    user-select: none;
    cursor: grab;
    position: relative;
    overflow: hidden;

    &:active {
      cursor: grabbing;
    }

    &--dragging {
      opacity: 0.7;
      transform: scale(1.1) rotate(3deg);
      z-index: 1000;
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
    }

    &--level-1 { background-color: #8B4513; }
    &--level-2 { background-color: #228B22; }
    &--level-3 { background-color: #006400; }
    &--level-4 { background-color: #004d00; }
    &--level-5 { background-color: #003300; }
    &--level-6 { background-color: #001a00; }
    &--level-7 { background-color: #000000; }
    &--level-8 { background-color: #4B0082; }

    &-level {
      position: absolute;
      top: 4px;
      right: 4px;
      background: rgba(0, 0, 0, 0.3);
      color: white;
      font-size: 0.6em;
      padding: 2px 4px;
      border-radius: 8px;
    }

    &-emoji {
      font-size: 1.2em;
      margin-bottom: 2px;
    }

    &-name {
      font-size: 0.6em;
      opacity: 0.9;
      text-align: center;
    }
  }

  &__progress {
    background-color: #f8f9fa;
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &__goal {
    &-text {
      margin-bottom: 0.75rem;
      color: #2c3e50;
    }
  }

  &__progress-bar {
    height: 8px;
    background-color: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
  }

  &__progress-fill {
    height: 100%;
    background-color: #42b883;
    transition: width 0.5s ease;
  }

  &__game-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  &__info-card {
    background-color: #f8f9fa;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &__stats-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__stats-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #dee2e6;

    &:last-child {
      border-bottom: none;
    }
  }

  &__stats-label {
    color: #7f8c8d;
  }

  &__stats-value {
    font-weight: bold;
    color: #2c3e50;
  }

  &__items-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
  }

  &__guide-item {
    background-color: #2c3e50;
    color: white;
    border-radius: 0.5rem;
    padding: 0.75rem;
    text-align: center;
    font-size: 0.875rem;
    transition: transform 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    &:hover {
      transform: translateY(-2px);
    }
  }

  &__guide-emoji {
    font-size: 1.5em;
    margin-bottom: 0.25rem;
  }

  &__guide-name {
    font-weight: bold;
    margin-bottom: 0.25rem;
  }

  &__guide-level {
    font-size: 0.75em;
    opacity: 0.9;
    margin-bottom: 0.125rem;
  }

  &__guide-points {
    font-size: 0.75em;
    opacity: 0.8;
  }

  &__instructions {
    background-color: #f8f9fa;
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &__instructions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  &__instruction {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &__instruction-icon {
    font-size: 1.5em;
  }

  &__instruction-text {
    color: #2c3e50;
    font-size: 0.9rem;

    strong {
      color: #2c3e50;
    }
  }

  &__modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  &__modal {
    background-color: white;
    border-radius: 0.5rem;
    padding: 2rem;
    max-width: 400px;
    width: 90%;
    text-align: center;
    animation: modalAppear 0.3s ease;
  }

  @keyframes modalAppear {
    from {
      opacity: 0;
      transform: translateY(-50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &__modal-title {
    color: #2c3e50;
    margin-bottom: 1rem;
  }

  &__modal-text {
    color: #7f8c8d;
    margin-bottom: 1.5rem;
  }

  &__modal-stats {
    background-color: #f8f9fa;
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  &__modal-stat {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #dee2e6;

    &:last-child {
      border-bottom: none;
    }

    &-label {
      color: #7f8c8d;
    }

    &-value {
      font-weight: bold;
      color: #2c3e50;
    }
  }

  &__notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    color: white;
    font-weight: bold;
    z-index: 1000;
    animation: slideIn 0.3s ease;

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    &--info {
      background-color: #42b883;
    }

    &--warning {
      background-color: #e74c3c;
    }
  }

  @media (max-width: 768px) {
    &__grid {
      max-width: 400px;
    }

    &__item-name {
      display: none;
    }

    &__instruction {
      flex-direction: column;
      text-align: center;
    }
  }

  @media (max-width: 480px) {
    padding: 1rem;

    &__grid {
      max-width: 300px;
    }

    &__controls {
      flex-direction: column;
      align-items: center;
    }

    &__button {
      width: 100%;
      max-width: 200px;
    }

    &__items-list {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}
</style>