<template>
  <div class="resources">
    <div class="resources__title">
      Инвентарь
    </div>
    <div class="resources__grid">
      <div
        class="resources__item"
        v-for="element in openedElements"
        :key="element.id"
      >
        <img
          :src="element.picture"
          class="resources__image"
        />
        <div class="resources__info">
          <span class="resources__count">
             {{ getInventoryCount(element.id) }}
          </span>
          <button class="resources__button" @click="() => startMining(element.id)">
            Добыть
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'ResourcesPanel',
  computed: {
    ...mapGetters(['openedElements', 'getInventoryCount']),
  },
  methods: {
    ...mapActions(['startMining'])
  }
}
</script>

<style scoped lang="scss">
.resources {
  display: flex;
  flex-direction: column;
  height: 160px; 
  overflow: hidden;

  &__title {
    font-size: 16px;
    font-weight: bold;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 10px;
    overflow-y: auto; 
    padding-right: 4px;
  }

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    width: 60px;
  }

  &__image {
    width: 40px;
    height: 40px;
  }

  &__info {
    display: flex;
    align-items: center;
    gap: 6px; 
  }

  &__count {
    font-weight: bold;
  }

  &__button {
    font-size: 10px;
    border: 1.5px solid #b543b9;
    border-radius: 6px;
    cursor: pointer;
    padding: 2px 6px;
  }
}
</style>