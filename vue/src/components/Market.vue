<template>
<div class="market" v-if="isIslandsNearly && opened">
  <div class="market__title">
    Рынок
  </div>

  <div class="market__list">
    <span class="market__title">Продать рыбу</span>

    <div class="market__item" v-if="inventory.common != 0">
      <span class="market__label">Окунь</span>
      <button 
        class="market__btn" 
        @click="() => sellFish('common')">
        Продать за {{ fishPrices['common'] }}₽
      </button>
    </div>

    <div class="market__item" v-if="inventory.rare != 0">
      <span class="market__label">Карп</span>
      <button 
        class="market__btn" 
        @click="() => sellFish('rare')">
        Продать за {{ fishPrices['rare'] }}₽
      </button>
    </div>

    <div class="market__item" v-if="inventory.legendary != 0">
      <span class="market__label">Язь <br>(здоровенный)</span>
      <button 
        class="market__btn" 
        @click="() => sellFish('legendary')">
        Продать за {{ fishPrices['legendary'] }}₽
      </button>
    </div>
  </div>

  <div class="market__list">
    <span class="market__title">Купить/Продать снасти</span>

    <span class="market__title">Удилища</span>
    <div class="market__item" v-for="rod in rods">
      <span class="market__label">Удилище {{ rod.name }} ({{ rod.power }})</span>

      <button 
        class="market__btn"
        v-if="!tacklesOwned.rods.includes(rod.id)" 
        @click="() => buyTackle('rods', rod)">
        Купить за {{ rod.price }}₽ 
      </button>
      <button 
        class="market__btn"
        v-else-if="tacklesOwned.rods.includes(rod.id) && rod.id !== 0" 
        @click="() => sellTackle('rods', rod)">
        Продать за {{ rod.price / 2 }}₽ 
      </button>

      <button 
        class="market__btn"
        v-if="tacklesOwned.rods.includes(rod.id)" 
        @click="() => useTackle('rods', rod)">
        Надеть
      </button>
    </div>

    <span class="market__title">Катушки</span>
    <div class="market__item" v-for="reel in reels">
      <span class="market__label">Катушка {{ reel.name }} ({{ reel.power }})</span>

      <button 
        class="market__btn"
        v-if="!tacklesOwned.reels.includes(reel.id)" 
        @click="() => buyTackle('reels', reel)">
        Купить за {{ reel.price }}₽ 
      </button>
      <button 
        class="market__btn"
        v-else-if="tacklesOwned.reels.includes(reel.id) && reel.id !== 0" 
        @click="() => sellTackle('reels', reel)">
        Продать за {{ reel.price / 2 }}₽ 
      </button>

      <button 
        class="market__btn"
        v-if="tacklesOwned.reels.includes(reel.id)" 
        @click="() => useTackle('reels', reel)">
        Надеть
      </button>
    </div>

    <span class="market__title">Поплавки</span>
    <div class="market__item" v-for="bobber in bobbers">
      <span class="market__label">Поплавок {{ bobber.name }} ({{ bobber.power }})</span>

      <button 
        class="market__btn"
        v-if="!tacklesOwned.bobbers.includes(bobber.id)" 
        @click="() => buyTackle('bobbers', bobber)">
        Купить за {{ bobber.price }}₽ 
      </button>
      <button 
        class="market__btn"
        v-else-if="tacklesOwned.bobbers.includes(bobber.id) && bobber.id !== 0" 
        @click="() => sellTackle('bobbers', bobber)">
        Продать за {{ bobber.price / 2 }}₽ 
      </button>

      <button 
        class="market__btn"
        v-if="tacklesOwned.bobbers.includes(bobber.id)" 
        @click="() => useTackle('bobbers', bobber)">
        Надеть
      </button>
    </div>

    <span class="market__title">Крючки</span>
    <div class="market__item" v-for="hook in hooks">
      <span class="market__label">Крючок {{ hook.name }} ({{ hook.power }})</span>

      <button 
        class="market__btn"
        v-if="!tacklesOwned.hooks.includes(hook.id)" 
        @click="() => buyTackle('hooks', hook)">
        Купить за {{ hook.price }}₽ 
      </button>
      <button 
        class="market__btn"
        v-if="tacklesOwned.hooks.includes(hook.id) && hook.id !== 0" 
        @click="() => sellTackle('hooks', hook)">
        Продать за {{ hook.price / 2 }}₽ 
      </button>

      <button 
        class="market__btn"
        v-if="tacklesOwned.hooks.includes(hook.id)" 
        @click="() => useTackle('hooks', hook)">
        Надеть
      </button>
    </div>

    <span class="market__title">Лески</span>
    <div class="market__item" v-for="line in lines">
      <span class="market__label">Леска {{ line.name }} ({{ line.power }})</span>

      <button 
        class="market__btn"
        v-if="!tacklesOwned.lines.includes(line.id)" 
        @click="() => buyTackle('lines', line)">
        Купить за {{ line.price }}₽ 
      </button>
      <button 
        class="market__btn"
        v-else-if="tacklesOwned.lines.includes(line.id) && line.id !== 0" 
        @click="() => sellTackle('lines', line)">
        Продать за {{ line.price / 2 }}₽ 
      </button>

      <button 
        class="market__btn"
        v-if="tacklesOwned.lines.includes(line.id)" 
        @click="() => useTackle('lines', line)">
        Надеть
      </button>
    </div>
  </div>

  <div class="market__list">
    <span class="market__title">Купить наживку</span>

    <div class="market__item">
      <span class="market__label">Черви</span>
      <button 
        class="market__btn" 
        @click="() => buyBait('worms')">
        Купить за {{ baitsPrices['worms'] }}₽
      </button>
    </div>

    <div class="market__item">
      <span class="market__label">Кукуруза</span>
      <button 
        class="market__btn" 
        @click="() => buyBait('corn')">
        Купить за {{ baitsPrices['corn'] }}₽
      </button>
    </div>

    <div class="market__item">
      <span class="market__label">Опарыши</span>
      <button 
        class="market__btn" 
        @click="() => buyBait('maggots')">
        Купить за {{ baitsPrices['maggots'] }}₽
      </button>
    </div>
  </div>

  <div class="market__list">
    <span class="market__title">Купить прикормку</span>

    <div class="market__item">
      <span class="market__label">Прикормка</span>
      <button 
        class="market__btn" 
        @click="() => buyBait('groundbait')">
        Купить за {{ baitsPrices['groundbait'] }}₽
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

const fishPrices = {
  common: 5,
  rare: 20,
  legendary: 50
}

const baitsPrices = {
  worms: 1,
  corn: 10,
  maggots: 25,
  groundbait: 5
}

const opened = ref(false)

const inventory = computed(() => store.getters['game/getInventory'])

const balance = computed(() => store.getters['game/getBalance'])

const islands = computed(() => store.getters['game/getIslands'])

const boat = computed(() => store.getters['game/getBoat'])

const tacklesOwned = computed(() => store.getters['game/getTacklesOwned'])

const rods = computed(() => store.getters['game/tacklesList/getRodsList'])
const reels = computed(() => store.getters['game/tacklesList/getReelsList'])
const bobbers = computed(() => store.getters['game/tacklesList/getBobbersList'])
const hooks = computed(() => store.getters['game/tacklesList/getHooksList'])
const lines = computed(() => store.getters['game/tacklesList/getLinesList'])


const sellFish = (type) => {
  if (inventory.value[type] > 0) {
    store.dispatch('game/sellFish', {type: type, price: fishPrices[type]})
  }
}

const buyBait = (type) => {
  const price = baitsPrices[type]
  if (balance.value - price >= 0) {
    store.dispatch('game/buyBait', {type: type, price: price})
  }
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
  }

  &__btn:hover {
    background-color: rgb(190, 190, 190);
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