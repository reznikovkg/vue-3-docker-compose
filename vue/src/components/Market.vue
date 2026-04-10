<template>
<div class="market" v-if="isIslandsNearly && opened">
  <div class="market__title">
    Рынок
  </div>

  <div class="market__list">
    <span class="market__title">Продать рыбу</span>

    <div class="market__item" v-if="inventory.common != 0">
      <span class="market__label">Окунь</span>
      <button class="market__btn" @click="() => sellFish('common', commonFishPrice)">Продать за {{ commonFishPrice }}₽</button>
    </div>

    <div class="market__item" v-if="inventory.rare != 0">
      <span class="market__label">Карп</span>
      <button class="market__btn" @click="() => sellFish('rare', rareFishPrice)">Продать за {{ rareFishPrice }}₽</button>
    </div>

    <div class="market__item" v-if="inventory.legendary != 0">
      <span class="market__label">Язь <br>(здоровенный)</span>
      <button class="market__btn" @click="() => sellFish('legendary', legendaryFishPrice)">Продать за {{ legendaryFishPrice }}₽</button>
    </div>
  </div>

  <div class="market__list">
    <span class="market__title">Купить/Продать снасти</span>

    <div class="market__item">
      <span class="market__label">Удилище</span>
      <span class="market__value"></span>
    </div>

    <div class="market__item">
      <span class="market__label">Катушка</span>
      <span class="market__value"></span>
    </div>

    <div class="market__item">
      <span class="market__label">Поплавок</span>
      <span class="market__value"></span>
    </div>

    <div class="market__item">
      <span class="market__label">Крючок</span>
      <span class="market__value"></span>
    </div>

    <div class="market__item">
      <span class="market__label">Леска</span>
      <span class="market__value"></span>
    </div>
  </div>

  <div class="market__list">
    <span class="market__title">Купить наживку</span>

    <div class="market__item">
      <span class="market__label">Черви</span>
      <button class="market__btn" @click="() => buyBait('worms', wormsPrice)">Купить за {{ wormsPrice }}₽</button>
    </div>

    <div class="market__item">
      <span class="market__label">Кукуруза</span>
      <button class="market__btn" @click="() => buyBait('corn', cornPrice)">Купить за {{ cornPrice }}₽</button>
    </div>

    <div class="market__item">
      <span class="market__label">Опарыши</span>
      <button class="market__btn" @click="() => buyBait('maggots', maggotsPrice)">Купить за {{ maggotsPrice }}₽</button>
    </div>
  </div>

  <div class="market__list">
    <span class="market__title">Купить прикормку</span>

    <div class="market__item">
      <span class="market__label">Прикормка</span>
      <button class="market__btn" @click="() => buyBait('groundbait', groundbaitPrice)">Купить за {{ groundbaitPrice }}₽</button>
    </div>
  </div>
</div>
<div class="market-invite" v-if="isIslandsNearly">
  <div class="market__title" v-if="!opened">Нажмите Е чтобы открыть</div>
  <div class="market__title" v-else>Нажмите Е чтобы закрыть</div>
</div>
</template>

<script setup>
import { onMounted, onUnmounted, computed, ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const commonFishPrice = 5
const rareFishPrice = 20
const legendaryFishPrice = 50

const wormsPrice = 3
const cornPrice = 10
const maggotsPrice = 25
const groundbaitPrice = 30

const opened = ref(false)

const inventory = computed(() => store.getters['game/getInventory'])

const balance = computed(() => store.getters['game/getBalance'])

const islands = computed(() => store.getters['game/getIslands'])

const boat = computed(() => store.getters['game/getBoat'])

const sellFish = (type, price) => {
  if (inventory.value[type] > 0) {
    store.dispatch('game/sellFish', {type: type, price: price})
  }
}

const buyBait = (type, price) => {
  if (balance.value - price >= 0) {
    store.dispatch('game/buyBait', {type: type, price: price})
  }
}

const isIslandsNearly = computed(() => {
  return islands.value.some(island => {
    const dx = boat.value.x - island.x
    const dy = boat.value.y - island.y
    return Math.max(Math.abs(dx), Math.abs(dy)) < 100
  })
})

const handleE = (e) => {
  if (e.code === 'KeyE' && isIslandsNearly) opened.value = !opened.value
}

onMounted(() => {
  window.addEventListener('keydown', handleE)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleE)
})

</script>

<style scoped lang="scss">
.market {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;

  width: 600px;

  padding: 8px;
  background-color: rgb(200, 200, 200);
  border: 8px dashed rgb(10, 10, 100);
  box-shadow: 0 4px 10px rgb(0, 0, 0);

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

  &__btn {
    width: 156px;
    font-family: 'Tiny5';
    font-size: 18px;

    color: rgb(10, 10, 100);
    background-color: rgb(200, 200, 200);
    border: 4px dashed rgb(10, 10, 100);
  }

  &__btn:hover {
    background-color: rgb(190, 190, 190);
  }
}

.market-invite {
  position: absolute;
  top: 90%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 4;

  width: 400px;

  padding: 8px;
  background-color: rgb(200, 200, 200);
  border: 8px dashed rgb(10, 10, 100);
  box-shadow: 0 4px 10px rgb(0, 0, 0);
}
</style>