<template>
  <div class="elements">
    <div 
      class="element" 
      v-for="elem in openedElements" 
      :key="elem.id" 
      @click="add(elem.id)"
    >
      <div class="picture">
        <img :src="elem.picture" class="element-picture"/>
      </div>
      <div class="name">{{ elem.name }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ElementsGrid',

  props: {
    openedElements: {
      type: Array,
      required: true
    }
  },

  emits: ['add'],

  methods: {
    add(id) {
      this.$emit('add', id)
    }
  }
}
</script>

<style lang="scss">
.elements {
  flex: 8;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 12px;
  align-content: start;
}

.element {
  aspect-ratio: 1 / 1;
  background: #ffffff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgb(181, 67, 185);
  cursor: pointer;
}

.picture {
  display: flex;
  align-items: center;
  justify-content: center;
}

.element-picture {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.name {
  margin-top: 6px;
  font-size: 14px;
  color: #000;
}
</style>