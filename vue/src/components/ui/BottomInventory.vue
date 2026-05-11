<template>
  <div class="bottom-inventory">
    <div class="bottom-inventory__item" v-for="(bait, index) in getInventoryBait" :class="{ 'bottom-inventory__item--active': bait.isActive }">
      <div class="bottom-inventory__item__cell">
        <img class="bottom-inventory__item__cell__image" :src="bait.image" width="50px" :alt="bait.name">
      </div>
      <div class="bottom-inventory__item__key">{{ ['Z', 'X', 'C', 'V'][index] }}</div>
      <div class="bottom-inventory__item__count">{{ bait.count <= 99 ? bait.count : '99+' }}</div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'BottomInventory',
  computed: {
    ...mapGetters([
      'getInventoryBait'
    ])
  }
}
</script>

<style scoped lang="scss">
.bottom-inventory {
  display: flex;
  justify-content: space-between;
  position: absolute;
  width: 500px;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;

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
      border: 4px solid rgb(120, 120, 0);
      background-color: rgb(245, 222, 179);
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
</style>
