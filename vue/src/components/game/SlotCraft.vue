<template>
  <div class="slot-craft">
    <div class="slot-craft__grid">
      <ElementCard
        v-for="(slot, index) in slots"
        :key="index"
        :element="slot"
        @click="$emit('slot-click', index)"
      />
    </div>
    <div class="slot-craft__actions">
      <button class="btn btn--reset" :disabled="isEmpty" @click="$emit('reset')">Сбросить</button>
      <button class="btn btn--mix" :disabled="isEmpty" @click="$emit('craft')">Скрафтить</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ElementCard from './ElementCard.vue'

const props = defineProps({
  slots: { type: Array, required: true },
})
defineEmits(['slot-click', 'reset', 'craft'])

const isEmpty = computed(() => props.slots.every((slot) => !slot))
</script>

<style scoped lang="scss">
.slot-craft {
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 12px 16px;
  border-top: 2px solid #3a3a4a;
  background: #1a1a22;
  height: 230px;
  flex-shrink: 0;
  overflow: hidden;

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 64px);
    grid-auto-rows: 64px;
    gap: 8px;
    width: 208px;
    height: 208px;
    flex-shrink: 0;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 110px;
    flex-shrink: 0;
  }
}

.btn {
  border: none;
  border-radius: 8px;
  padding: 10px 4px;
  font-size: 0.75rem;
  cursor: pointer;
  color: #fff;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &--reset {
    background: #4a4a58;
  }

  &--mix {
    background: #5b7fff;
  }
}
</style>