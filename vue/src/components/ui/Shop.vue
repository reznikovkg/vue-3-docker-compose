<template>
  <div class="shop">
    <div class="shop__title">Shop</div>
    <div class="shop__content">
      <button class="shop__content__fish" @click="() => sellAllFish()" :disabled="getLengthInventoryFish === 0">sell all fish</button>
      <div class="shop__content__list">
        <Item v-for="(tackle, index) in getInventoryTackle" type="shop">
          <template #image><img :src="tackle.image" width="70" :alt="tackle.name"></template>
          <template #text><Buttons :button-rows="getTackleButtons(tackle, index)"/></template>
        </Item>
      </div>
      <div class="shop__content__list">
        <Item v-for="(bait, index) in getInventoryBait" type="shop">
          <template #image><img :src="bait.image" width="70" :alt="bait.name"></template>
          <template #text><Buttons :button-rows="getBaitButtons(bait, index)"/></template>
        </Item>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Buttons from './../ui/Buttons.vue'
import Item from './../ui/Item.vue'

export default {
  name: 'Shop',
  components: {
    Buttons,
    Item
  },
  data() {
    return {
      countArray: [-10, -1, 1, 10]
    }
  },
  computed: {
    ...mapGetters([
      'getLengthInventoryFish',
      'getInventoryTackle',
      'getInventoryBait',
      'getBalance'
    ])
  },
  methods: {
    ...mapActions([
      'sellAllFish',
      'equipTackle',
      'tradeTackle',
      'tradeBait'
    ]),
    isDisabled(object, count) {
      return (count === 0 || (count > 0 ? this.getBalance < object.price * count : object.count < -count))
    },
    getTackleButtons(tackle, index) {
      const rows = []
      if(!tackle.isOwned) {
        rows.push([{
          text: 'buy',
          action: () => this.tradeTackle({index: index, buy: true}),
          disabled: this.isDisabled(tackle, 1)
        }])
      }
      else {
        rows.push([{
          text: tackle.isActive ? 'equipped' : 'equip',
          action: () => this.equipTackle(index),
          disabled: tackle.isActive
        }])
      }
      if(tackle.isOwned) {
        rows.push([{
          text: 'sell',
          action: () => this.tradeTackle({index: index, buy: false}),
          disabled: false
        }])
      }
      return rows
    },
    getBaitButtons(bait, index) {
      const rows = []
      rows.push(this.countArray.map(count => ({
        text: count <= 0 ? count : '+' + count,
        action: () => this.tradeBait({index: index, count: count}),
        disabled: this.isDisabled(bait, count)
      })))
      rows.push([{
        text: 'min',
        action: () => this.tradeBait({index: index, count: -bait.count}),
        disabled: this.isDisabled(bait, -1)
      }, {
        text: 'max',
        action: () => this.tradeBait({index: index, count: Math.floor(this.getBalance / bait.price)}),
        disabled: this.isDisabled(bait, 1)
      }])
      return rows
    }
  }
}
</script>

<style scoped lang="scss">
.shop {
  position: absolute;
  overflow: hidden;
  width: 1250px;
  height: 600px;
  top: 50%;
  left: 50%;
  border: 4px solid black;
  border-radius: 20px;
  padding: 5px;
  transform: translate(-50%, -50%);
  background-color: rgba(111, 255, 255, 0.5);
  z-index: 3;

  &__title {
    font-size: 30px;
    font-weight: bold;
    color: black;
    margin-bottom: 15px;
    text-align: center;
    text-shadow:
      -1px -1px 0 rgba(255, 255, 255, 0.5),
      1px -1px 0 rgba(255, 255, 255, 0.5),
      -1px 1px 0 rgba(255, 255, 255, 0.5),
      1px 1px 0 rgba(255, 255, 255, 0.5);
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;

    &__fish {
      width: 85%;
      height: 60px;
      border: 4px solid rgb(25, 175, 175);
      border-radius: 20px;
      font-size: 18px;
      font-weight: bold;
      color: rgb(111, 255, 255);
      text-shadow:
        -1px -1px 0 black,
        1px -1px 0 black,
        -1px 1px 0 black,
        1px 1px 0 black;
      background-color: rgb(111, 255, 255);

      &:active {
        border: 4px solid rgb(111, 255, 255);
      }

      &:disabled {
        border: 4px solid rgb(100, 175, 175);
        color: rgb(100, 175, 175);
        background-color: rgb(100, 175, 175);
      }
    }

    &__list {
      display: flex;
      justify-content: center;
      width: 95%;
    }
  }
}
</style>
