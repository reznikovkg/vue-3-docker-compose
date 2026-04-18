<template>
  <div class="inventory">
    <div class="inventory__title">Inventory</div>
    <div class="inventory__list">
      <div v-for="item in getInventory" class="inventory__list__item">
        <div class="inventory__list__item__cell">
          <img class="inventory__list__item__cell__image" :src="item.image" width="75px" :alt="item.name">
        </div>
        <div class="inventory__list__item__text">{{ item.count }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapGetters} from 'vuex'

export default {
  name: 'Inventory',
  computed: {
    ...mapGetters([
      'getInventory'
    ])
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
    margin-bottom: 20px;
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
    gap: 13px;
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
</style>
