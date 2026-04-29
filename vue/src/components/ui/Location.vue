<template>
  <div class="text">
    <div class="text__balance">Balance: {{ getBalance < 10000 ? getBalance : '>9999' }}$</div>
    <div class="text__coords">Coordinates (X: {{ getBoat.x }}, Y: {{ getBoat.y }})</div>
    <div class="text__area">Area type: {{ getCurrentAreaType }}</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Location',
  computed: {
    ...mapGetters([
      'getBoat',
      'getBalance',
      'getCurrentAreaInfo'
    ]),
    getCurrentAreaType() {
      return !this.getCurrentAreaInfo ? 'low' : this.getCurrentAreaInfo.area.type
    }
  }
}
</script>

<style scoped lang="scss">
.text {
  position: absolute;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
  height: 42px;
  top: 20px;
  left: 50%;
  border: 4px solid black;
  border-radius: 20px;
  padding: 20px 25px;
  box-shadow:
    4px 4px rgba(0, 0, 0, 0.4),
    6px 6px rgba(0, 0, 0, 0.2);
  font-size: 18px;
  color: lightgray;
  text-shadow:
    -2px -2px 0 black,
    2px -2px 0 black,
    -2px 2px 0 black,
    2px 2px 0 black;
  transform: translateX(-50%);
  z-index: 2;

  &__balance {
    font-weight: bold;
  }

  &__coords {
    font-weight: bold;
  }

  &__area {
    font-weight: bold;
  }
}
</style>
