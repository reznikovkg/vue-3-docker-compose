<template>
  <div class="location-selector">
    <BaseButton
      v-for="location in locations"
      :key="location.id"
      class="location-selector__item"
      :class="{
        'location-selector__item--active': location.id === selectedLocationId,
      }"
      :disabled="disabled"
      @click="$emit('select', location.id)"
    >
      {{ location.name }}
    </BaseButton>
  </div>
</template>

<script>
import BaseButton from '@/components/ui/BaseButton.vue'

export default {
  name: 'LocationSelector',
  components: {
    BaseButton,
  },
  props: {
    locations: {
      type: Array,
      default: () => [],
    },
    selectedLocationId: {
      type: String,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['select'],
}
</script>

<style scoped lang="scss">
@use '@/styles/tokens' as tokens;

.location-selector {
  display: grid;
  gap: tokens.$fishing-location-selector-gap;

  &__item {
    text-align: left;
    width: 100%;

    &--active {
      border-color: tokens.$fishing-location-selector-active;
      box-shadow: inset 0 0 0 1px tokens.$fishing-location-selector-active;
    }
  }
}
</style>
