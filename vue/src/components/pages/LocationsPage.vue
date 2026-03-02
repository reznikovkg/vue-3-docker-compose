<template>
  <div class="locations">
    <h1 class="locations__title">Выберите локацию</h1>

    <div class="locations__grid">
      <LocationCard
        v-for="loc in list"
        :key="loc.id"
        :location="loc"
        @select="select"
      />
    </div>
  </div>
</template>

<script>
import LocationCard from '../fishing/LocationCard.vue'
import { locations } from '@/config/locations'

export default {
  name: 'LocationsPage',
  components: { LocationCard },
  computed: {
    list() { return locations }
  },
  methods: {
    select(location) {
      this.$router.push({
        name: this.$routes.FISHING,
        params: { locationId: location.id }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.locations {
  grid-column: 1 / -1;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 30px;

  &__title {
    text-align: center;
    font-size: 28px;
    font-weight: bold;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
    justify-items: center;
    width: 100%;
  }
}
</style>