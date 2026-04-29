<template>
  <div class="shop">
    <div class="shop__title">Shop</div>
    <div class="shop__content">
      <button class="shop__content__fish" @click="() => sellAllFish()" :disabled="getLengthInventoryFish === 0">sell all fish</button>
      <div class="shop__content__list">
        <div class="shop__content__list__item" v-for="(tackle, index) in getInventoryTackle">
          <div class="shop__content__list__item__cell">
            <img class="shop__content__list__item__cell__image" :src="tackle.image" width="70px" :alt="tackle.name">
          </div>
          <div class="shop__content__list__item__buttons">
            <button class="shop__content__list__item__buttons__button" v-if="!tackle.isOwned" @click="() => tradeTackle({index: index, buy: true})" :disabled="isDisabled(tackle, 1)">buy</button>
            <button class="shop__content__list__item__buttons__button" v-else @click="() => equipTackle(index)" :disabled="tackle.isActive">{{ tackle.isActive ? 'equipped' : 'equip' }}</button>
          </div>
          <div class="shop__content__list__item__buttons">
            <button class="shop__content__list__item__buttons__button" v-if="tackle.isOwned" @click="() => tradeTackle({index: index, buy: false})">sell</button>
          </div>
        </div>
      </div>
      <div class="shop__content__list">
        <div class="shop__content__list__item" v-for="(bait, index) in getInventoryBait">
          <div class="shop__content__list__item__cell">
            <img class="shop__content__list__item__cell__image" :src="bait.image" width="70px" :alt="bait.name">
          </div>
          <div class="shop__content__list__item__buttons">
            <button class="shop__content__list__item__buttons__button" v-for="count in countArray" @click="() => tradeBait({index: index, count: count})" :disabled="isDisabled(bait, count)">{{ count <= 0 ? count : '+' + count }}</button>
          </div>
          <div class="shop__content__list__item__buttons">
            <button class="shop__content__list__item__buttons__button" @click="() => tradeBait({index: index, count: -bait.count})" :disabled="isDisabled(bait, -1)">min</button>
            <button class="shop__content__list__item__buttons__button" @click="() => tradeBait({index: index, count: Math.floor(getBalance / bait.price)})" :disabled="isDisabled(bait, 1)">max</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Shop',
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
  z-index: 2;

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

      &__item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        width: 180px;
        height: 180px;

        &__cell {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 125px;
          height: 125px;
          border: 4px solid rgb(25, 175, 175);
          border-radius: 8px;
          background-color: rgb(111, 255, 255);

          &__image {
            image-rendering: pixelated;
          }
        }

        &__buttons {
          display: flex;
          gap: 4px;

          &__button {
            border: 2px solid rgb(25, 175, 175);
            border-radius: 4px;
            font-size: 14px;
            font-weight: bold;
            background-color: rgb(111, 255, 255);

            &:active {
              border: 2px solid rgb(111, 255, 255);
            }

            &:disabled {
              border: 2px solid rgb(100, 175, 175);
              background-color: rgb(100, 175, 175);
            }
          }
        }
      }
    }
  }
}
</style>
