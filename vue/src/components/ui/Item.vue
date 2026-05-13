<template>
  <div class="item" :class="'item--' + type + (isActive ? ' item--' + type + '--active' : '')">
    <div class="item__image" :class="'item--' + type + '__image'"><slot name="image"/></div>
    <div class="item__tl" v-if="$slots.tl"><slot name="tl"/></div>
    <div class="item__br" v-if="$slots.br"><slot name="br"/></div>
    <div class="item__text" :class="'item--' + type + '__text'" v-if="$slots.text"><slot name="text"/></div>
  </div>
</template>

<script>
export default {
  name: 'Item',
  props: {
    isActive: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'bottom'
    }
  }
}
</script>

<style scoped lang="scss">
.item {
  display: flex;
  align-items: center;
  position: relative;

  &__image {
    image-rendering: pixelated;
  }

  &__tl {
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

  &__br {
    position: absolute;
    bottom: -2px;
    right: -2px;
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

  &--bottom {
    justify-content: center;
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
  }

  &--shop {
    flex-direction: column;
    gap: 4px;
    width: 180px;
    height: 180px;

    &__image {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 125px;
      height: 125px;
      border: 4px solid rgb(25, 175, 175);
      border-radius: 8px;
      background-color: rgb(111, 255, 255);
    }
  }

  &--side {
    justify-content: space-between;
    width: 110%;
    padding: 15px 35px;
    transform: translateX(-5%);
    background-color: rgba(0, 0, 0, 0.2);

    &__image {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 125px;
      height: 125px;
      border: 3px solid black;
      border-radius: 12px;
      background-color: rgba(245, 222, 179, 0.65);
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
</style>
