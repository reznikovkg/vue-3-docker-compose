<template>
  <div class="inventory">
    <div
        v-for="(item, index) in inventory"
        :key="item.id"
        class="item"
        :class="{ item__selected: index === selectedId }"
        @click="() => select(index)"
    >
      <img v-if="item.id.length > 0" class="slot-icon" :src="`/src/assets/items/${item.id}.png`" alt="" />
      <span v-if="item.count > 1" class="slot-count">{{ item.count }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from "vuex"
const store = useStore()
const inventory = computed(() => store.getters['inventory/getInventory'])
const selectedId = computed(() => store.getters['inventory/getInventorySelectedIndex'])

const select = (index) => {
  store.dispatch("inventory/selectInventoryItem", index)
}
</script>

<style scoped lang="less">
.inventory {
  display: flex;
  padding-top: 20px;
  z-index: 100;
}
.item {
  position: relative;
  padding: 5px 10px;
  cursor: pointer;
  background-image: url("@/assets/inventory-item.png");
  background-size: cover;
  width: 50px;
  height: 50px;
  &__selected {
    border: yellow 1px solid;
  }
}
.slot-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.slot-count {
  margin: 2px 2px 0 0;
  position: absolute;
  top: 0;
  right: 0;
  width: 18px;
  height: 18px;
  background: rgba(0,0,0,0.8);
  color: white;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  pointer-events: none;
}
</style>
