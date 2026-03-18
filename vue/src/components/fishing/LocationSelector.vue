<template>
  <div class="location-selector">
    <BaseButton
      v-for="location in locations"
      :key="location.id"
      class="location-selector__item"
      :class="{
        'location-selector__item--active': location.id === selectedLocationId,
        'location-selector__item--boosted': location.id === boostedLocationId,
      }"
      :disabled="disabled"
      @click="() => emitSelect(location.id)"
    >
      <span class="location-selector__item-label">
        <span
          v-if="location.id === boostedLocationId"
          class="location-selector__boost-mark"
        >
          !
        </span>
        <span>{{ location.name }}</span>
      </span>
      <span
        v-if="location.id === boostedLocationId"
        class="location-selector__boost-casts"
      >
        {{ boostedCastsRemaining }} casts left
      </span>
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
    boostedLocationId: {
      type: String,
      default: null,
    },
    boostedCastsRemaining: {
      type: Number,
      default: 0,
    },
  },
  emits: ['select'],
  methods: {
    emitSelect(locationId) {
      this.$emit('select', locationId)
    },
  },
}
</script>

<style scoped lang="scss">
@use '@/styles/tokens' as tokens;

.location-selector {
  display: grid;
  gap: tokens.$fishing-location-selector-gap;

  &__item {
    align-items: flex-start;
    display: grid;
    gap: 2px;
    text-align: left;
    width: 100%;

    &--active {
      border-color: tokens.$fishing-location-selector-active;
      box-shadow: inset 0 0 0 1px tokens.$fishing-location-selector-active;
    }

    &--boosted {
      border-color: #f39a22;
      box-shadow:
        inset 0 0 0 1px #f39a22,
        0 0 16px rgba(243, 154, 34, 0.62);
    }
  }

  &__item-label {
    align-items: center;
    display: inline-flex;
    gap: 8px;
  }

  &__boost-mark {
    align-items: center;
    color: #8a4500;
    display: inline-flex;
    font-weight: 700;
    justify-content: center;
    min-width: 12px;
  }

  &__boost-casts {
    background: rgba(138, 69, 0, 0.12);
    border-radius: 6px;
    color: #6e3400;
    font-size: 11px;
    font-weight: 700;
    padding: 1px 6px;
  }
}
</style>
