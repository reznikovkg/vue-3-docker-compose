<template>
  <div class="buttons">
    <div class="buttons__row" v-for="row in buttonRows">
      <button class="buttons__row__button" v-for="button in row" @click="button.action" :disabled="button.disabled">{{ button.text }}</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Buttons',
  props: {
    buttonRows: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped lang="scss">
.buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  &__row {
    display: flex;
    gap: 4px;

    &__button {
      border: 2px solid rgb(25, 175, 175);
      border-radius: 4px;
      font-size: 14px;
      font-weight: bold;
      background-color: rgb(111, 255, 255);

      &:active {
        border: 2px solid rgb(111, 255, 255);
      }

      &:disabled {
        border: 2px solid rgb(100, 175, 175);
        background-color: rgb(100, 175, 175);
      }
    }
  }
}
</style>
