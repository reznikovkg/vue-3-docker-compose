<template>
  <div class="container" @click="() => onSwitch()">
    <div class="container__ball" :style="switchStyle"><p class="container__text">{{ textState }}</p></div>
  </div>
</template>

<script>
export default {
  name: 'Tumbler',
  data() {
    return {
      isOn: false,
      textState: "OFF",
    }
  },
  emits: ['onSwitch'],
  computed: {
    switchStyle() {
      if (this.isOn) {
        return {
          transform: 'translateX(calc(2vh - 2px))',
        }
      } else {
        return {
          transform: 'translateX(0)',
        }
      }
    }
  },
  methods: {
    onSwitch() {
      this.$emit("onSwitch", !this.isOn)
      this.isOn = !this.isOn
      if (this.isOn) {
        this.textState = "ON"
      } else {
        this.textState = "OFF"
      }
    }
  }
}
</script>

<style scoped lang="scss">
.container {
  display: flex;
  width: 4vh;
  height: calc(2vh + 2px);
  background: linear-gradient(to right, #abdaf4, #82aaef);
  border-radius: 2vh;
  border-width: 1px;
  border-style: solid;
  border-color: #2c3e50;
  align-self: center;
  margin: auto;
  box-shadow: 0 3px 6px 0 #194d6c;
  position: relative;
  align-items: center;
  place-items: center;

  &:hover {
    cursor: pointer;
  }

  &__ball {
    height: 2vh;
    width: 2vh;
    background: #23689f;
    border-radius: 2vh;
    position: absolute;
    top: 0px;
    left: 0px;
    text-align: center;
    align-items: center;
    place-items: center;
    font-weight: bold;
    color: #ffffff;
    box-shadow: 0 6px 9px 0 #194d6c;
  }

  &__text {
    user-select: none;
    font-size: 0.8vh;
    font-weight: bold;
    color: white;
    line-height: 2.53;
  }
}
</style>