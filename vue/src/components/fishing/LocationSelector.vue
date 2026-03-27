<template>
  <div class="location-selector">
    <BaseButton
      v-for="location in locations"
      :key="location.id"
      class="location-selector__item"
      :class="{
        'location-selector__item--active': location.id === selectedLocationId,
        'location-selector__item--boosted': location.id === boostedLocationId
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
    BaseButton
  },
  props: {
    locations: {
      type: Array,
      default: () => []
    },
    selectedLocationId: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    boostedLocationId: {
      type: String,
      default: null
    },
    boostedCastsRemaining: {
      type: Number,
      default: 0
    }
  },
  emits: ['select'],
  methods: {
    emitSelect(locationId) {
      this.$emit('select', locationId)
    }
  }
}
</script>

<style scoped lang="scss">
.location-selector {
  &__item {
    text-align: left;
    width: 100%;
  }

  &__item-label {
    align-items: center;
    display: inline-flex;
    gap: 6px;
  }

  &__boost-mark {
    align-items: center;
    background: #f39a22;
    border-radius: 999px;
    color: #1d1204;
    display: inline-flex;
    font-size: 11px;
    font-weight: 700;
    height: 16px;
    justify-content: center;
    width: 16px;
  }

  &__boost-casts {
    color: #f39a22;
    display: block;
    font-size: 12px;
    margin-top: 2px;
  }
}
</style>
