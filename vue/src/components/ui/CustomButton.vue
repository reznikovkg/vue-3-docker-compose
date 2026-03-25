<template>
  <button class="custom-button">
    <slot>Кнопка</slot>
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

<style scoped lang="scss">
@import "@/styles/styles";

.custom-button {
  background: $purplePrimary;
  border-radius: 60px;
  padding: 18px 40px;
  font-size: 40px;
  font-weight: 700;
  color: $textColor;
  cursor: pointer;
  transition: 0.15s;
  border: 2px solid $purpleBorder;
  box-shadow: 0 6px 0 $purpleShadow, 0 12px 24px $purpleGlow;
  width: fit-content;
  margin: 20px auto 0;
  letter-spacing: 2px;
}
</style>
