<template>
  <button
    class="element-card"
    :class="{ 'element-card--empty': !element }"
    @click="$emit('click')"
  >
    <template v-if="element">
      <span class="element-card__icon">{{ element.icon }}</span>
      <span class="element-card__name">{{ element.name }}</span>
      <span v-if="count > 1" class="element-card__count">×{{ count }}</span>
    </template>
    <span v-else class="element-card__placeholder">+</span>
  </button>
</template>

<script setup>
defineProps({
  element: { type: Object, default: null },
  count: { type: Number, default: 1 },
})
defineEmits(['click'])
</script>

<style scoped lang="scss">
.element-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 100%;
  aspect-ratio: 1;
  border: 1px solid #3a3a4a;
  border-radius: 10px;
  background: #23232e;
  color: #eee;
  cursor: pointer;
  padding: 4px;
  transition: transform .1s ease, background .15s ease;

  &:active {
    transform: scale(0.94);
  }

  &--empty {
    background: transparent;
    border-style: dashed;
    color: #555;
  }

  &__icon {
    font-size: 1.4rem;
    line-height: 1;
  }

  &__name {
    font-size: 0.6rem;
    text-align: center;
    line-height: 1.1;
  }

  &__count {
    position: absolute;
    top: 2px;
    right: 4px;
    font-size: 0.6rem;
    background: #ff6b6b;
    color: #fff;
    border-radius: 8px;
    padding: 0 4px;
  }

  &__placeholder {
    font-size: 1.2rem;
    color: #555;
  }
}
</style>
