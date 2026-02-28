<template>
  <div class="fishing-container">
    <div v-if="showProgressBar" class="progress-bar">
      <div class="progress-bar__fill" :style="progressBarStyle"></div>
    </div>

    <button
      :class="buttonClass"
      :disabled="buttonIsDisabled"
      class="fishing-button"
      @click="() => onClick()"
      @mousedown="() => toggleHold(true)"
      @mouseup="() => toggleHold(false)"
      @mouseleave="() => toggleHold(false)"
    >
      {{ buttonText }}
    </button>

    <Teleport to="body">
      <div v-if="showResultModal" class="result-modal">
        <div
          class="result-modal__overlay"
          @click="() => closeResultModal()"
        ></div>
        <div class="result-modal__content">
          <div class="result-modal__title">{{ resultMessage }}</div>
          <button
            class="result-modal__button"
            @click="() => closeResultModal()"
          >
            Закрыть
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const state = ref("ready");
const isHolding = ref(false);
const progress = ref(0);
const showResultModal = ref(false);
const resultMessage = ref("");

const showProgressBar = computed(() => state.value === "hold");
const buttonIsDisabled = computed(() => state.value === "processing");

let holdInterval = null;
let processingTimeout = null;

const closeResultModal = () => {
  showResultModal.value = false;
};

const buttonText = computed(() => {
  if (state.value === "ready") {
    return "Закинуть удочку";
  }

  if (state.value === "processing") {
    return "В процессе...";
  }

  return "Удерживайте";
});

const buttonClass = computed(() => {
  if (state.value === "ready") {
    return "fishing-button--ready";
  }

  if (state.value === "processing") {
    return "fishing-button--processing";
  }

  if (isHolding.value) {
    return "fishing-button--hold-active";
  }

  return "fishing-button--hold";
});

const progressBarStyle = computed(() => ({
  width: `${progress.value}%`,
}));

const finishFishing = () => {
  clearInterval(holdInterval);
  state.value = "ready";
  isHolding.value = false;
  progress.value = 0;
  showResultModal.value = true;
};

const toggleHold = (value) => {
  if (state.value === "hold") {
    isHolding.value = value;
  }
};

const startFishing = () => {
  clearInterval(holdInterval);
  state.value = "hold";

  holdInterval = setInterval(() => {
    if (state.value !== "hold") {
      return;
    }

    if (isHolding.value) {
      progress.value = Math.min(progress.value + 1, 100);
    } else {
      progress.value = Math.max(progress.value - 1, 0);
    }

    if (progress.value >= 100) {
      resultMessage.value = "Рыба поймана!";
      finishFishing();
    } else if (progress.value <= 0) {
      resultMessage.value = "Рыба сорвалась!";
      finishFishing();
    }
  }, 30);
};

const throwRod = () => {
  if (state.value !== "ready") {
    return;
  }

  state.value = "processing";

  const minDelay = 5000;
  const maxDelay = 10000;
  const delay = minDelay + Math.random() * (maxDelay - minDelay);

  const minProgress = 10;
  const maxProgress = 40;
  progress.value = minProgress + Math.random() * (maxProgress - minProgress);

  processingTimeout = setTimeout(() => {
    startFishing();
  }, delay);
};

const onClick = () => {
  if (state.value === "ready") {
    throwRod();
  }
};
</script>

<style scoped lang="scss">
.fishing-container {
  margin-bottom: 3rem;
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);

  .progress-bar {
    width: 100%;
    height: 1rem;
    margin-bottom: 1rem;
    background-color: #a6a6a6;
    border-radius: 1rem;
    overflow: hidden;
    transition: width 0.1s linear;

    &__fill {
      width: 0%;
      height: 100%;
      background-color: #00d000;
    }
  }

  .fishing-button {
    padding: 0.5rem 1rem;
    font-size: 1.5rem;
    border-radius: 0.5rem;
    background: #008bd1;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s ease;

    &--ready {
      &:hover {
        background: #0097e2;
      }
    }

    &:disabled {
      background: #00b8c2;
      cursor: default;
    }

    &--hold {
      background: #a20000;
      cursor: grab;
    }

    &--hold-active {
      background: #00b400;
      cursor: grabbing;
    }
  }
}

.result-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  &__overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
  }

  &__content {
    min-width: 20rem;
    background: rgb(45, 45, 45);
    padding: 2rem;
    border-radius: 1rem;
    text-align: center;
    z-index: 10;
  }

  &__title {
    margin-bottom: 1.5rem;
  }

  &__button {
    padding: 0.5rem 1.5rem;
    border-radius: 0.5rem;
    background: #008bd1;
    font-size: inherit;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background: #00a2f0;
    }
  }
}
</style>
