<template>
  <button class="c-button" :class="'c-button--' + type">
    <slot>Кнопка</slot>

    <template v-if="$slots.count">
      (
      <slot name="count">0</slot>
      )
    </template>
  </button>
</template>

<script>
export default {
  name: 'CustomButton',
  props: {
    type: {
      default: 'default',
      type: String
    }
  }
}
</script>

<style lang="scss">
.c-button {
  border: 1px solid #00d4;
  background: #08eaff;
  color: white;
  padding: 5px;
  margin: 5px;
  border-radius: 20px;
  width: 150px;
  height: 60px;
  font-size: 20px;

  &--red {
    border: 1px solid rgba(228, 25, 18, 0.27);
    background: #ed5252;
  }

,
& --yellow {
  border: 1px solid rgba(251, 240, 32, 0.88);
  background: #cdc307;
},
& --green {
  border: 1px solid rgba(12, 89, 6, 0.88);
  background: #3cf107;
}
}
</style>
