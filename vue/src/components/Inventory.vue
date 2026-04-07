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
        <span class="inventory__value">{{ rod.name }} (x{{ rod.power }})</span>
      </div>

      <div class="inventory__item">
        <span class="inventory__label">Катушка</span>
        <span class="inventory__value">{{ reel.name }} (x{{ reel.power }})</span>
      </div>

      <div class="inventory__item">
        <span class="inventory__label">Поплавок</span>
        <span class="inventory__value">{{ bobber.name }} (x{{ bobber.power }})</span>
      </div>

      <div class="inventory__item">
        <span class="inventory__label">Крючок</span>
        <span class="inventory__value">{{ hook.name }} (x{{ hook.power }})</span>
      </div>

      <div class="inventory__item">
        <span class="inventory__label">Леска</span>
        <span class="inventory__value">{{ line.name }} (x{{ line.power }})</span>
      </div>
    </div>

    <div class="inventory__list">
      <span class="inventory__title">Наживка</span>

      <div class="inventory__item">
        <span class="inventory__label">Черви</span>
        <span class="inventory__value">{{ baits.worms }} шт.</span>
      </div>

      <div class="inventory__item">
        <span class="inventory__label">Кукуруза</span>
        <span class="inventory__value">{{ baits.corn }} шт.</span>
      </div>

      <div class="inventory__item">
        <span class="inventory__label">Опарыши</span>
        <span class="inventory__value">{{ baits.maggots }} шт.</span>
      </div>
    </div>

    <div class="inventory__list">
      <span class="inventory__title">Прикормка</span>

      <div class="inventory__item">
        <span class="inventory__label">Прикормка</span>
        <span class="inventory__value">{{ baits.groundbait }} шт.</span>
      </div>
    </div>

    <span class="inventory__label">Мощность удочки: {{ power }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const inventory = computed(() => store.getters['game/getInventory'])

const tackles = computed(() => store.getters['game/getTackles'])

const rod = computed(() => {
  const list = store.getters['game/tacklesList/getRodsList']
  return list[tackles.value.rod]
})

const reel = computed(() => {
  const list = store.getters['game/tacklesList/getReelsList']
  return list[tackles.value.reel]
})

const bobber = computed(() => {
  const list = store.getters['game/tacklesList/getBobbersList']
  return list[tackles.value.bobber]
})

const hook = computed(() => {
  const list = store.getters['game/tacklesList/getHooksList']
  return list[tackles.value.hook]
})

const line = computed(() => {
  const list = store.getters['game/tacklesList/getLinesList']
  return list[tackles.value.line]
})

const baits = computed(() => store.getters['game/getBaits'])

const power = computed(() => store.getters['game/getPower'])
</script>

<style scoped lang="scss">
.inventory {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;

  width: 400px;

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
