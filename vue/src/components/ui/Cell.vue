<template>
  <div
    class="cell"
    @dragover.prevent
    @drop="onDrop"

  >
    <Item v-if="item" :item="item" @drag-start="onDragStart" @item-click="onItemClick" @item-right-click="onItemRightClick"/>
  </div>
</template>
<script>
import Item from './Item.vue'
export default {
  name: 'Cell',
  components: {Item},
  props: {
    item: Object,
    x: Number,
    y: Number
  },
  emits: ['drag-start', 'drop', 'cell-click', 'cell-right-click'],
  methods: {
    onDrop(){
      this.$emit('drop',{x: this.x, y: this.y});
    },
    onDragStart(){
      this.$emit('drag-start',{x: this.x, y: this.y});
    },
    onItemRightClick(){
      this.$emit('cell-right-click',{x: this.x, y: this.y});
    },
    onItemClick(){
      this.$emit('cell-click',{x: this.x, y: this.y, item: this.item});
    }
  }
}
</script>
<style scoped lang="scss">
.cell {
  width: 64px;
  height: 64px;
  background: #1e293b;
  border-radius: 8px;
  touch-action: none;
}
</style>