<template>
  <div class="side-inventory" :style="inventoryStyle">
    <div class="side-inventory__title">{{isSwitched ? 'Tackle' : 'Fish'}}</div>
    <div class="side-inventory__item" v-for="item in currentItems">
      <div class="side-inventory__item__cell">
        <img class="side-inventory__item__cell__image" :src="item.image" width="75px" :alt="item.name">
      </div>
      <div class="side-inventory__item__text">{{ item.text }}</div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'SideInventory',
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
      'getLengthInventoryFish',
      'getVisibleFish',
      'getActiveTacklesInfo',
      'getIsShopping'
    ]),
    inventoryStyle() {
      return {
        width: this.getIsShopping ? '285px' : '400px'
      }
    },
    currentItems() {
      if(this.isSwitched) {
        return this.getActiveTacklesInfo.activeTackles.map(tackle => ({
          image: tackle.image,
          name: tackle.name,
          text: tackle.level + ' lvl'
        }))
      }
      else {
        return this.getVisibleFish.map(fish => ({
          image: fish.image,
          name: fish.name,
          text: fish.weight + ' kg'
        }))
      }
    }
  },
  methods: {
    ...mapActions([
      'changeFishSkipped'
    ]),
    inventoryKeyDown(event) {
      if(event.code === 'KeyW' && this.getFishSkipped > 0)
        this.changeFishSkipped(-1)
      else if(event.code === 'KeyS' && this.getFishSkipped + 3 < this.getLengthInventoryFish)
        this.changeFishSkipped(1)
      else if(event.code === 'KeyA' || event.code === 'KeyD')
        this.isSwitched = !this.isSwitched
    }
  }
}
</script>

<style scoped lang="scss">
.side-inventory {
  display: flex;
  flex-direction: column;
  gap: 40px;
  position: absolute;
  overflow: hidden;
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
    text-align: center;
    text-shadow:
      -2.5px -2.5px 0 black,
      2.5px -2.5px 0 black,
      -2.5px 2.5px 0 black,
      2.5px 2.5px 0 black;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 110%;
    padding: 15px 35px;
    transform: translateX(-5%);
    background-color: rgba(0, 0, 0, 0.2);

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
      text-shadow: -2px -2px 0 black,
      2px -2px 0 black,
      -2px 2px 0 black,
      2px 2px 0 black;
    }
  }
}
</style>
