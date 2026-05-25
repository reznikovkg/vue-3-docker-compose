<template>
  <div
    class="cell"
    @dragover.prevent
    @drop="(e) => onDrop(e)"

  >
    <Item v-if="item"
          :item="item"
          @drag-start="(e) => onDragStart(e)"
          @item-click="(e) => onItemClick(e)"
          @item-right-click="(e) => onItemRightClick(e)"
    />
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: #1e293b;
  border-radius: 8px;
  touch-action: none;
}
</style>