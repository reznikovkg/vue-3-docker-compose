<template>
  <div class="craft-table">
    <div class="craft-table__items">
      <ElementCard
        v-for="item in items"
        :key="item.id"
        :element="item"
        :count="item.count"
        @click="$emit('remove', item.id)"
      />
      <p v-if="!items.length" class="craft-table__hint">
        Выберите элементы сверху
      </p>
    </div>
    <div class="craft-table__actions">
      <button class="btn btn--reset" :disabled="!items.length" @click="$emit('reset')">Сбросить</button>
      <button class="btn btn--mix" :disabled="!items.length" @click="$emit('mix')">Смешать</button>
    </div>
  </div>
</template>

<script setup>
import ElementCard from './ElementCard.vue'

defineProps({
  items: { type: Array, required: true },
})
defineEmits(['reset', 'mix', 'remove'])
</script>

<style scoped lang="scss">
.craft-table {
  display: flex;
  align-items: stretch;
  gap: 28px;
  padding: 12px 16px;
  border-top: 2px solid #3a3a4a;
  background: #1a1a22;
  height: 230px;
  flex-shrink: 0;
  overflow: hidden;

  &__items {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: 8px;
    height: 100%;
    overflow-y: auto;

    :deep(.element-card) {
      width: 64px;
      height: 64px;
      flex-shrink: 0;
    }
  }

  &__hint {
    color: #777;
    font-size: 0.8rem;
    margin: 0;
    align-self: center;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 110px;
    flex-shrink: 0;
    justify-content: center;
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