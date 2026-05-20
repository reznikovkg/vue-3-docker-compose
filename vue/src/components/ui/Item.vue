<template>
  <div
    class="item"
    draggable="true"
    @dragstart="onDragStart"
    @click="onClick"
    @contextmenu.prevent="onRightClick"
  >
    <img :src="image"/>
    <div v-if="item.level === 4" class="item--max">MAX</div>
  </div>
</template>
<script>
export default {
  name: "Item",
  props: {
    item: Object
  },
  computed: {
    image() {
      return `../icons/branch-${this.item.branch}-${this.item.level}.png`;
    }
  },
  emits: ['drag-start','item-click', 'item-right-click'],

  methods: {
    onDragStart() {
      this.$emit('drag-start');
    },
    onClick() {
      this.$emit('item-click');
    },
    onRightClick() {
      this.$emit('item-right-click');
    }
  }
}
</script>
<style scoped lang="scss">
.item {
  position: relative;
  width: 60px;
  height: 60px;
  cursor: grab;
  touch-action: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;


  img {
    width: 58px;
    height: 58px;
    object-fit: contain;
    pointer-events: none;
  }
  &--max {
    position: absolute;
    top: 2px;
    right: 2px;
    padding: 2px 5px;
    font-size: 10px;
    font-weight: 700;
    line-height: 1;
    color: white;
    background: rgba(239, 68, 68, 0.95);
    border-radius: 6px;
    pointer-events: none;
  }

  &:active {
    cursor: grabbing;
  }
}
</style>