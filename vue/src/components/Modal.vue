<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-overlay__content">
      <div class="modal-overlay__title">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface ModalProps {
  isOpen: boolean;
}

defineProps<ModalProps>();
</script>

<style scoped lang="scss">
.modal-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-modal;

  &__content {
    padding: 24px 32px;
    background: rgba(10, 10, 20, 0.9);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    text-align: center;
  }

  &__title {
    font-size: 24px;
    color: #fff;
    text-shadow: 0 0 6px rgba(255, 255, 255, 0.6);
  }
}
</style>
