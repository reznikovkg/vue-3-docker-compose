<template>
  <div class="location-selector">
    <button
      v-for="location in locations"
      :key="location.id"
      type="button"
      class="btn-soft location-selector__item"
      :class="{
        'location-selector__item--active': location.id === selectedLocationId,
      }"
      :aria-pressed="location.id === selectedLocationId ? 'true' : 'false'"
      @click="() => $emit('select', location.id)"
    >
      {{ location.name }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'LocationSelector',
  props: {
    locations: {
      type: Array,
      default: () => [],
    },
    selectedLocationId: {
      type: String,
      default: null,
    },
  },
  emits: ['select'],
};
</script>

<style scoped lang="scss">
.location-selector {
  display: grid;
  gap: 8px;
}

.location-selector__item {
  width: 100%;
  text-align: left;
}

.location-selector__item--active {
  border-color: #1d8f4e;
  box-shadow: inset 0 0 0 1px #1d8f4e;
}
</style>
