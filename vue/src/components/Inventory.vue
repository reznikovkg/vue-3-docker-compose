<template>
  <div class="inventory">
    <div class="inventory__title">
      Инвентарь
    </div>

    <div class="inventory__list">
      <span class="inventory__title">Улов</span>

      <div class="inventory__item" v-for="fish in inventory">
        <span class="inventory__label">{{ fishNames[fish.type] }}</span>
        <span class="inventory__value">{{ fish.weight }} кг</span>
      </div>
    </div>

    <div class="inventory__list">
      <span class="inventory__title">Снасти</span>

      <div class="inventory__item" v-for="tackle in tacklesList">
        <span class="inventory__label">{{ tackle.name }}</span>
        <span class="inventory__value">{{ tackle.data.name }} (x{{ tackle.data.power }})</span>
      </div>
    </div>

    <div class="inventory__list">
      <span class="inventory__title">Наживка</span>

      <div class="inventory__item" v-for="bait in baitsList">
        <span class="inventory__label">{{ bait.name }}</span>
        <span class="inventory__value">{{ bait.count }} шт.</span>
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
const fishNames = computed(() => store.getters['game/constants/getFishNames'])

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

const tacklesList = computed(() => [
  { name: 'Удилище', data: rod.value },
  { name: 'Катушка', data: reel.value },
  { name: 'Поплавок', data: bobber.value },
  { name: 'Крючок', data: hook.value },
  { name: 'Леска', data: line.value }
])

const baits = computed(() => store.getters['game/getBaits'])

const baitsList = computed(() => [
  { name: 'Черви', count: baits.value.worms },
  { name: 'Кукуруза', count: baits.value.corn },
  { name: 'Опарыши', count: baits.value.maggots },
  { name: 'Прикормка', count: baits.value.groundbait }
])

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

    max-height: 200px;
    overflow-y: auto;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
      
    &::-webkit-scrollbar-thumb {
      background: rgb(10, 10, 100);
    }
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
