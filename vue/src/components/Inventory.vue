<template>
  <div class="inventory">
    <div class="inventory__title">
      Инвентарь
    </div>

    <div class="inventory__list">
      <div class="inventory__item">
        <span class="inventory__label">Окунь</span>
        <span class="inventory__value">{{ inventory.common }}</span>
      </div>

      <div class="inventory__item">
        <span class="inventory__label">Карп</span>
        <span class="inventory__value">{{ inventory.rare }}</span>
      </div>

      <div class="inventory__item">
        <span class="inventory__label">Язь (здоровенный)</span>
        <span class="inventory__value">{{ inventory.legendary }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const inventory = computed(() => store.getters['game/getInventory'])
</script>

<style scoped lang="scss">
.inventory {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;

  width: 300px;

  padding: 18px;
  background-color: rgb(200, 200, 200);
  border: 8px dashed rgb(10, 10, 100);
  box-shadow: 0 4px 10px rgb(0, 0, 0);
  right: 20px;

  &__title {
    color: rgb(10, 10, 100);
    font-size: 24px;
    font-style: bold;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  &__label {
    color: rgb(10, 10, 100);
    font-size: 20px;
    font-style: italic;
  }

  &__value {
    color: rgb(10, 10, 100);
    font-size: 20px;
    font-style: bold;
    text-align: center;
  }
}
</style>
