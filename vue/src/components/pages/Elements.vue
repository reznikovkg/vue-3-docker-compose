<template>
  <div class="elements">
    <div 
      class="elements__item" 
      v-for="elem in openedElements" 
      :key="elem.id" 
      draggable="true"
      @click="() => addToTable(elem.id)"
      @dragstart="(e) => dragStart(e, elem.id)"
    >
    <div class="elements__picture">
      <img :src="elem.picture" class="elements__image"/>
      </div>
      <div class="elements__name">{{ elem.name }}</div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'ElementsGrid',

  computed: {
    ...mapGetters(['openedElements'])
  },

  methods: {
    ...mapActions(['addToTable']),
    dragStart:(e,id)=>{
      e.dataTransfer.setData('elementId',id)
    }
  }
  
}
</script>

<style lang="scss">
.elements {
  flex: 8;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  padding: 12px;
  align-content: start;

  &__item {
    aspect-ratio: 1;
    background: #ffffff;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgb(181, 67, 185);
    cursor: pointer;
    user-select: none;

    &:hover {
      transform: scale(1.05);
      transition: 0.2s;
    }
  }

  &__picture {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__image {
    width: 64px;
    height: 64px;
    object-fit: contain;
  }

  &__name {
    margin-top: 6px;
    font-size: 14px;
    color: #000;
  }
}
</style>