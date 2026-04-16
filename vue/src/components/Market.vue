<template>
<div class="market" v-if="isIslandsNearly && opened">
  <div class="market__title">
    Рынок
  </div>
  
  <div class="market__list">
    <span class="market__title">Продать рыбу</span>

    <div class="market__item" v-for="fish in inventory">
      <span class="market__label">{{ fishNames[fish.type] }} ({{ fish.weight }} кг)</span>

      <button 
        class="market__btn" 
        @click="() => sellFish(fish)">
        Продать за {{  Math.round(fishPrices[fish.type] * fish.weight * 100) / 100 }}₽
      </button>
    </div>
  </div>

  <div class="market__list">
    <span class="market__title">Купить/Продать снасти</span>

    <div v-for="tackle in tacklesList">
      <span class="market__title">{{ tackle.name }}</span>
      <div class="market__item" v-for="item in tackle.items">
        <span class="market__label">{{ item.label }} {{ item.name }} ({{ item.power }})</span>

        <button 
          class="market__btn"
          v-if="!tacklesOwned[tackle.id].includes(item.id)" 
          @click="() => buyTackle(tackle.id, item)">
          Купить за {{ item.price }}₽ 
        </button>
        <button 
          class="market__btn"
          v-else-if="tacklesOwned[tackle.id].includes(item.id) && item.id !== 0" 
          @click="() => sellTackle(tackle.id, item)">
          Продать за {{ item.price / 2 }}₽ 
        </button>

        <button 
          class="market__btn"
          v-if="tacklesOwned[tackle.id].includes(item.id)" 
          @click="() => useTackle(tackle.id, item)">
          Надеть
        </button>
      </div>
    </div>
  </div>

  <div class="market__list">
    <span class="market__title">Купить наживку</span>

    <div class="market__item" v-for="bait in baitsList">
      <span class="market__label">{{ bait.name }}</span>
      <button 
        class="market__btn" 
        @click="() => buyBait(bait.id)">
        Купить за {{ baitsPrices[bait.id] }}₽
      </button>
    </div>
  </div>
</div>
<div class="market-invite" v-if="isIslandsNearly">
  <div class="market__title" v-if="!opened">Нажмите [Е] чтобы открыть</div>
  <div class="market__title" v-else>Нажмите [Е] чтобы закрыть</div>
</div>
</template>

<script setup>
import { onMounted, onUnmounted, computed, ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const fishNames = computed(() => store.getters['game/constants/getFishNames'])
const fishPrices = computed(() => store.getters['game/constants/getFishPrices'])
const baitsPrices = computed(() => store.getters['game/constants/getBaitsPrices'])

const opened = ref(false)

const inventory = computed(() => store.getters['game/getInventory'])

const islands = computed(() => store.getters['game/getIslands'])

const boat = computed(() => store.getters['game/getBoat'])

const tacklesOwned = computed(() => store.getters['game/getTacklesOwned'])

const rods = computed(() => store.getters['game/tacklesList/getRodsList'])
const reels = computed(() => store.getters['game/tacklesList/getReelsList'])
const bobbers = computed(() => store.getters['game/tacklesList/getBobbersList'])
const hooks = computed(() => store.getters['game/tacklesList/getHooksList'])
const lines = computed(() => store.getters['game/tacklesList/getLinesList'])

const tacklesList = computed(() => [
  { id: 'rods', name: 'Удилища', items: rods.value},
  { id: 'reels', name: 'Катушки', items: reels.value},
  { id: 'bobbers', name: 'Поплавки', items: bobbers.value},
  { id: 'hooks', name: 'Крючки', items: hooks.value},
  { id: 'lines', name: 'Лески', items: lines.value}
])

const baitsList = computed(() => [
  { id: 'worms', name: 'Черви' },
  { id: 'corn', name: 'Кукуруза' },
  { id: 'maggots', name: 'Опарыши' },
  { id: 'groundbait', name: 'Прикормка' }
])

const sellFish = (fish) => {
  store.dispatch('game/sellFish', {item: fish, price: Math.round(fishPrices[fish.type] * fish.weight * 100) / 100})
}

const buyBait = (type) => {
  const price = baitsPrices.value[type]
  store.dispatch('game/buyBait', {type: type, price: price})
}

const buyTackle = (type, item) => {
  store.dispatch('game/buyTackle', {type: type, item: item})
}

const sellTackle = (type, item) => {
  store.dispatch('game/sellTackle', {type: type, item: item})
}

const useTackle = (type, item) => {
  store.dispatch('game/useTackle', {type: type, item: item})
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

  width: 800px;
  max-height: 800px;

  padding: 8px;
  background-color: rgb(200, 200, 200);
  border: 8px dashed rgb(10, 10, 100);
  box-shadow: 0 4px 10px rgb(0, 0, 0);

  overflow-y: auto;

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

    max-height: 300px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 12px;
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

  &__btn {
    font-family: 'Tiny5';
    font-size: 18px;

    width: 180px;

    color: rgb(10, 10, 100);
    background-color: rgb(200, 200, 200);
    border: 4px dashed rgb(10, 10, 100);

    &:hover {
      background-color: rgb(190, 190, 190);
    }
  }

  &::-webkit-scrollbar {
    width: 12px;
  }
    
  &::-webkit-scrollbar-thumb {
    background: rgb(10, 10, 100);
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