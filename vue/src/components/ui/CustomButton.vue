<template>
  <button class="c-button" :class="`c-button--` + type">
    <slot>Кнопка</slot>
  </button>
</template>

<script>
export default {
  name: "CustomButton",
  props: {
    type: {
      default: "default",
      type: String,
    },
  },
};
</script>

<style lang="scss" scoped>
.c-button {
  color: white;
  background-color: #949090;
  font-size: 14px;
  padding: 5px;

  &--red {
    background-color: red;
  }

  &--blue {
    background-color: blue;
  }
}
</style>
