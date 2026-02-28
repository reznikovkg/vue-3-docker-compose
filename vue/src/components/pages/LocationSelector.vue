<template>
  <div class="location-selector">
    <select class="location-selector__select" v-model="selected" @change="onChange">
      <option v-for="item in items" :key="item.id" :value="item">
        {{ item.name }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'LocationSelector',
  props: {
    items: {
      type: Array,
      required: true
    },
    value: {
      type: Object,
      required: true
    }
  },
  computed: {
    selected: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    }
  },
  methods: {
    onChange() {
      this.$emit('change-location', this.selected)
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