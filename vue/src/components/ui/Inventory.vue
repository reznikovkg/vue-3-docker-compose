<template>
  <div class="inventory">
    <div class="inventory__title">Inventory</div>
    <div class="inventory__grid">
      <div v-for="(fish, index) in ownedFish" :key="index" class="inventory__item" :title="fish.name"
        @click="() => trySellFish(index)">
        <img :src="fish.icon" :alt="fish.name" class="inventory__item-icon" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
export default {
  name: 'Inventory',
  computed: {
    ...mapState(['ownedFish'])
  },
  methods: {
    ...mapActions(['trySellFish'])
  }
}
</script>

<style scoped lang="scss">
.inventory {
  position: absolute;
  top: 35%;
  right: 10px;
  transform: translateY(-50%);
  width: 200px;
  background: rgba(0, 0, 0, 0.6);
  padding: 10px;
  border-radius: 8px;
  color: white;
  user-select: none;

  &__title {
    text-align: center;
    font-weight: bold;
    margin-bottom: 8px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-gap: 6px;
  }

  &__item {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    cursor: pointer;
    transition: transform 0.1s ease;

    &:hover {
      transform: scale(1.1);
    }

    &-icon {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
  }
}
</style>