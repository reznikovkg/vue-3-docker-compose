<template>
  <div
    class="item"
    draggable="true"
    @dragstart="onDragStart"
  >
    <img :src="image"/>
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
      return `/icons/image-${this.item.level}.png`
    }
  },
  emits: ["drag-start"],
  data() {
    return {
      isTouching: false,
      touchStartPos: null
    }
  },
  methods: {
    onDragStart() {
      this.$emit("drag-start")
    }
  }
}
</script>
<style scoped lang="scss">
.item {
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

  &:active {
    cursor: grabbing;
  }
}
</style>