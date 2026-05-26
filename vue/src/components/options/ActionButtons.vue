<template>
  <div class = "action-buttons">
    <button class = "action-buttons__save" @click = "() => $emit('apply')">
      Применить
    </button>
    <button class = "action-buttons__reset" @click = "() => $emit('reset')">
      Сброс
    </button>
  </div>
</template>

<script>
export default {
  name: 'ActionButtons',
  emits: ['apply', 'reset']
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';
.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 35px;

  button {
    padding: 12px 35px;
    font-size: 16px;
    font-weight: 600;
    border: none;
    border-radius: 40px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba($accentSoft, 0.3);
    }
  }

  &__save {
    background: $accentSoft;
    color: white;
  }

  &__reset {
    background: $bgSoft;
    color: $textPrimary;

    &:hover {
      background: $bgHover;
    }
  }
}
</style>