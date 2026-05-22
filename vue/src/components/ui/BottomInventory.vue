<template>
  <div class="bottom-inventory">
    <Item v-for="(bait, index) in getInventoryBait" type="bottom" :is-active="bait.isActive">
      <template #image><img :src="bait.image" width="50" :alt="bait.name"></template>
      <template #tl>{{ ['Z', 'X', 'C', 'V'][index] || '' }}</template>
      <template #br>{{ bait.count <= 99 ? bait.count : '99+' }}</template>
    </Item>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Item from './../ui/Item.vue'

export default {
  name: 'BottomInventory',
  components: {
    Item
  },
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
  z-index: 3;
}
</style>
