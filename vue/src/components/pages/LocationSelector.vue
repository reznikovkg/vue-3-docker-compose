<template>
  <div class="location-selector">
    <select
      class="location-selector__select"
      :value="selected.id"
      @change="(event) => onChange(event)"
    >
      <option
        v-for="item in locations"
        :key="item.id"
        :value="item.id"
      >
        {{ item.name }}
      </option>
    </select>
  </div>
</template>
<script>
export default {
  name: 'LocationSelector',
  props: {
    locations: {
      type: Array,
      required: true
    },
    selected: {
      type: Object,
      required: true
    }
  },
  methods: {
    onChange(event) {
      const selectedId = Number(event.target.value)
      const currentLocation = this.locations.find((item) => item.id === selectedId)

      this.$emit('change-location', currentLocation)
    }
  }
}
</script>
<style scoped lang="scss">
.location-selector {
  margin-bottom: 10px;

  &__select {
    width: 100%;
    padding: 8px;
    border: 1px solid #000000;
    background: #ffffff;
  }
}
</style>