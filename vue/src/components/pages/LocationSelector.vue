<template>
  <div class="location-selector">
    <select 
      class="location-selector__select" 
      @change="onChange"
    >
      <option 
        v-for="item in locations" 
        :key="item.id" 
        :value="item.id"
        :selected="item.id === selected.id"
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
      const selectedId = parseInt(event.target.value)
      const location = this.locations.find(l => l.id === selectedId)
      this.$emit('change-location', location)
    }
  }
}
</script>

<style scoped>
.location-selector {
  margin-bottom: 10px;
}

.location-selector__select {
  width: 100%;
  padding: 5px;
  border: 1px solid black;
  background: white;
}
</style>