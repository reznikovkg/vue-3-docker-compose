<template>
  <div class = "color-palette">
    <div
        v-for = "color in colors"
        :key = "color.value"
        class = "color-palette__swatch"
        :class = "{ 'color-palette__swatch--active': color.value === modelValue }"
        @click = "() => $emit('update:modelValue', color.value)"
    >
      <img :src = "color.image" :alt = "color.name" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ColorPalette',
  props: {
    modelValue: { type: String, required: true },
    colors: { type: Array, required: true }
  },
  emits: ['update:modelValue']
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';
.color-palette {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-top: 5px;

  &__swatch {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 3px solid transparent;
    cursor: pointer;
    transition: all 0.2s ease;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &:hover {
      transform: scale(1.1);
      border-color: $accentSoft;
    }

    &--active {
      border-color: $accentSoft;
      box-shadow: 0 0 0 3px rgba($accentSoft, 0.3);
    }
  }
}
</style>