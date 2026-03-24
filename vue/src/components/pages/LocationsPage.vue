<template>
  <button class="locations__back" @click.stop="() => back()">Назад</button>
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
    },

    back() {
      this.$router.push({ name: this.$routes.INDEX })
    },
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
  &__back {
    position: absolute;
    top: 20px;
    left: 20px;
    font-size: 20px;
    padding: 10px 20px;
    border-radius: 12px;
    background: rgba(0,0,0,0.5);
    color: white;
    cursor: pointer;
    font-weight: bold;
    border: none;
    &:hover {
      background: rgba(0,0,0,0.7);
    }
  }
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