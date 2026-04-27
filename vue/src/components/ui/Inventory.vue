<template>
  <div class="inventory">
    <div class="inventory__title">{{isSwitched ? 'Tackle' : 'Fish'}}</div>
    <div class="inventory__list" v-if="!isSwitched">
      <div class="inventory__list__item" v-for="fish in getVisibleFish">
        <div class="inventory__list__item__cell">
          <img class="inventory__list__item__cell__image" :src="fish.image" width="75px" :alt="fish.name">
        </div>
        <div class="inventory__list__item__text">{{ fish.weight }} kg</div>
      </div>
    </div>
    <div class="inventory__list" v-else>
      <div class="inventory__list__item" v-for="tackle in getActiveTacklesInfo.activeTackles">
        <div class="inventory__list__item__cell">
          <img class="inventory__list__item__cell__image" :src="tackle.image" width="75px" :alt="tackle.name">
        </div>
        <div class="inventory__list__item__text">{{ tackle.level }} lvl</div>
      </div>
    </div>
  </div>
  <div class="bait-inventory">
    <div class="bait-inventory__list">
      <div class="bait-inventory__list__item" v-for="(bait, index) in getInventoryBait" :class="{ 'bait-inventory__list__item--active': bait.isActive }">
        <div class="bait-inventory__list__item__cell">
          <img class="bait-inventory__list__item__cell__image" :src="bait.image" width="50px" :alt="bait.name">
        </div>
        <div class="bait-inventory__list__item__key">{{ ['Z', 'X', 'C', 'V'][index] }}</div>
        <div class="bait-inventory__list__item__count">{{ bait.count <= 99 ? bait.count : '99+' }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Inventory',
  data() {
    return {
      isSwitched: false
    }
  },
  mounted() {
    window.addEventListener('keydown', this.inventoryKeyDown)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.inventoryKeyDown)
  },
  computed: {
    ...mapGetters([
      'getFishSkipped',
      'getInventoryFish',
      'getVisibleFish',
      'getActiveTacklesInfo',
      'getInventoryBait'
    ])
  },
  methods: {
    ...mapActions([
      'changeFishSkipped'
    ]),
    inventoryKeyDown(event) {
      if(event.code === 'KeyW' && this.getFishSkipped > 0)
        this.changeFishSkipped(-1)
      else if(event.code === 'KeyS' && this.getFishSkipped + 3 < this.getInventoryFish.length)
        this.changeFishSkipped(1)
      else if(event.code === 'KeyA' || event.code === 'KeyD')
        this.isSwitched = !this.isSwitched
    }
  }
}
</script>

<style scoped lang="scss">
.inventory {
  position: absolute;
  overflow: hidden;
  width: 400px;
  height: 700px;
  top: 50%;
  right: 15px;
  border: 4px solid black;
  border-radius: 20px;
  padding: 10px;
  box-shadow:
    4px 4px rgba(0, 0, 0, 0.4),
    6px 6px rgba(0, 0, 0, 0.2);
  transform: translateY(-50%);
  z-index: 2;

  &__title {
    font-size: 25px;
    font-weight: bold;
    color: lightgray;
    margin-bottom: 40px;
    text-align: center;
    text-shadow:
      -2.5px -2.5px 0 black,
      2.5px -2.5px 0 black,
      -2.5px 2.5px 0 black,
      2.5px 2.5px 0 black;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 40px;
    width: 110%;
    transform: translateX(-5%);

    &__item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px 35px;
      background-color: rgba(25, 100, 100, 0.5);

      &__cell {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 125px;
        height: 125px;
        border: 3px solid black;
        border-radius: 12px;
        background-color: rgba(245, 222, 179, 0.65);

        &__image {
          image-rendering: pixelated;
        }
      }

      &__text {
        font-size: 24px;
        font-weight: bold;
        color: lightgray;
        text-shadow:
          -2px -2px 0 black,
          2px -2px 0 black,
          -2px 2px 0 black,
          2px 2px 0 black;
      }
    }
  }
}

.bait-inventory {
  position: absolute;
  width: 500px;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;

  &__list {
    display: flex;
    justify-content: space-between;

    &__item {
      position: relative;
      width: 75px;
      height: 75px;
      border: 4px solid black;
      box-shadow:
        2px 2px rgba(0, 0, 0, 0.4),
        4px 4px rgba(0, 0, 0, 0.2);
      transition: background-color 0.25s ease;
      background-color: rgba(245, 222, 179, 0.65);

      &--active {
        background-color: rgba(245, 222, 179, 1);
      }

      &__cell {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;

        &__image {
          image-rendering: pixelated;
        }
      }

      &__key {
        position: absolute;
        top: -2px;
        left: -2px;
        border-radius: 4px;
        padding: 1px 8px;
        font-size: 16px;
        font-weight: bold;
        color: lightgray;
        transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 0.65);
      }

      &__count {
        position: absolute;
        right: -2px;
        bottom: -2px;
        font-size: 18px;
        font-weight: bold;
        color: lightgray;
        text-shadow:
          -1px -1px 0 black,
          1px -1px 0 black,
          -1px 1px 0 black,
          1px 1px 0 black;
        transform: translate(50%, 50%);
      }
    }
  }
}
</style>
