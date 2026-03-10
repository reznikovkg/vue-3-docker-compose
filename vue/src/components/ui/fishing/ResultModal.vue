<template>
  <div v-if="isOpen" class="result-modal">
    <div class="result-modal__overlay" @click="() => onClose()"></div>

    <div class="result-modal__content">
      <div class="result-modal__title">
        {{ message }}
      </div>

      <button class="result-modal__button" @click="() => onClose()">
        Закрыть
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps(['isOpen', 'message', 'onClose'])
</script>

<style scoped lang="scss">
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
    min-width: 320px;
    background: rgb(45, 45, 45);
    padding: 32px;
    border-radius: 16px;
    text-align: center;
    z-index: 10;
  }

  &__title {
    margin-bottom: 24px;
  }

  &__button {
    padding: 8px 24px;
    border-radius: 8px;
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
