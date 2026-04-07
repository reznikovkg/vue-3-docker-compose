<template>
  <div class="inventory">
    <div class="inventory__title">
      Инвентарь
    </div>

    <div class="inventory__list">
      <span class="inventory__title">Улов</span>

      <div class="inventory__item">
        <span class="inventory__label">Окунь</span>
        <span class="inventory__value">{{ inventory.common }} шт.</span>
      </div>

      <div class="inventory__item">
        <span class="inventory__label">Карп</span>
        <span class="inventory__value">{{ inventory.rare }} шт.</span>
      </div>

      <div class="inventory__item">
        <span class="inventory__label">Язь <br>(здоровенный)</span>
        <span class="inventory__value">{{ inventory.legendary }} шт.</span>
      </div>
    </div>

    <div class="inventory__list">
      <span class="inventory__title">Снасти</span>

      <div class="inventory__item">
        <span class="inventory__label">Удилище</span>
        <span class="inventory__value"></span>
      </div>

      <div class="inventory__item">
        <span class="inventory__label">Катушка</span>
        <span class="inventory__value"></span>
      </div>

      <div class="inventory__item">
        <span class="inventory__label">Поплавок</span>
        <span class="inventory__value"></span>
      </div>

      <div class="inventory__item">
        <span class="inventory__label">Крючок</span>
        <span class="inventory__value"></span>
      </div>

      <div class="inventory__item">
        <span class="inventory__label">Леска</span>
        <span class="inventory__value"></span>
      </div>
    </div>

    <div class="inventory__list">
      <span class="inventory__title">Наживка</span>

      <div class="inventory__item">
        <span class="inventory__label">Черви</span>
        <span class="inventory__value"> шт.</span>
      </div>

      <div class="inventory__item">
        <span class="inventory__label">Кукуруза</span>
        <span class="inventory__value"> шт.</span>
      </div>

      <div class="inventory__item">
        <span class="inventory__label">Опарыши</span>
        <span class="inventory__value"> шт.</span>
      </div>
    </div>

    <div class="inventory__list">
      <span class="inventory__title">Прикормка</span>

      <div class="inventory__item">
        <span class="inventory__label">0 шт.</span>
        <span class="inventory__value"></span>
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

  padding: 8px;
  background-color: rgb(200, 200, 200);
  border: 8px dashed rgb(10, 10, 100);
  box-shadow: 0 4px 10px rgb(0, 0, 0);
  right: 20px;

  &__title {
    color: rgb(10, 10, 100);
    font-size: 24px;
    font-style: bold;
    text-align: center;
  }

  &__list {
    display: flex;
    flex-direction: column;
    background-color: rgb(200, 200, 200);
    border: 4px dashed rgb(10, 10, 100);
    padding: 4px;
    margin: 4px;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
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
