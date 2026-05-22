<template>
  <div class="side-inventory" :style="inventoryStyle">
    <div class="side-inventory__title">{{isSwitched ? 'Tackle' : 'Fish'}}</div>
    <Item v-for="item in currentItems" type="side">
      <template #image><img :src="item.image" width="75" :alt="item.name"></template>
      <template #text>{{ item.text }}</template>
    </Item>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Item from './../ui/Item.vue'

export default {
  name: 'SideInventory',
  components: {
    Item
  },
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
      'getIsShopping',
      'getFishSkipped',
      'getLengthInventoryFish',
      'getVisibleFish',
      'getActiveTacklesInfo'
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
      if(event.code === 'KeyW' && this.getFishSkipped > 0) {
        this.changeFishSkipped(-1)
      }
      else if(event.code === 'KeyS' && this.getFishSkipped + 3 < this.getLengthInventoryFish) {
        this.changeFishSkipped(1)
      }
      else if(event.code === 'KeyA' || event.code === 'KeyD') {
        this.isSwitched = !this.isSwitched
      }
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
  z-index: 3;

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
}
</style>
