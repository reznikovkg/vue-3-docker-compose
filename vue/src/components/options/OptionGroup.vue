<template>
  <div class = "option-group">
    <label class = "option-group__label">{{ label }}</label>
    <slot />
    <span v-if = "hint" class = "option-group__hint">{{ hint }}</span>
  </div>
</template>

<script>
export default {
  name: 'OptionGroup',
  props: {
    label: { type: String, required: true },
    hint: { type: String, default: '' }
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';
.option-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__label {
    color: $textPrimary;
    font-weight: 500;
    font-size: 15px;
    letter-spacing: 0.3px;
  }

  &__hint {
    font-size: 12px;
    color: $textMuted;
    font-style: italic;
    padding-left: 10px;
  }
}
</style>