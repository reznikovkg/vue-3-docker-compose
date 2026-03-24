<template>
  <div class="location-card" @click="() => choose()">
    <img
      class="location-card__image"
      :src="location.image"
      :alt="location.name"
    >
    <div class="location-card__name">
      {{ location.name }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'LocationCard',
  props: {
    location: Object
  },
  methods: {
    choose() { this.$emit('select', this.location) }
  }
}
</script>

<style scoped lang="scss">
.location-card {
  width: 400px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  &__image {
    width: 100%;
    height: 160px;
    object-fit: cover;
    border-radius: 12px;
  }
  &__name {
    text-align: center;
    font-size: 18px;
    font-weight: bold;
  }
}
</style>