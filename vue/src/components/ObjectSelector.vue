<template>
  <div class="object-selector">
    <h3 class="object-selector__title">Выберите объект:</h3>
    <div class="object-selector__list">
      <div
        v-for="obj in availableObjects"  
        :key="obj.id"                    
        :style="{ backgroundColor: obj.color }" 
        class="object-preview"           
        @click="() => selectObject(obj)" 
      >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ObjectSelector',
  emits: ['select-object'],
  data() {
    return {
      availableObjects: [
        {
          id: 1,
          name: 'Объект 1',
          color: 'red',
          shape: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }], 
        },
        {
          id: 2,
          name: 'Объект 2',
          color: 'orange',
          shape: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }], 
        },
        {
          id: 3,
          name: 'Объект 3',
          color: 'yellow',
          shape: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }], 
        },
        {
          id: 4,
          name: 'Объект 4',
          color: 'cyan',
          shape: [{ x: 0, y: 0 }] 
        },
      ],
    };
  },
  methods: {
    selectObject(obj) {
      this.$emit('select-object', obj);
    },
  },
};
</script>

<style scoped lang="less">

.object-selector {
  margin-bottom: 20px;

  &__title {
    font-size: 25px;
    color: #000000; 
    margin-bottom: 30px;
  }
  &__list {
    display: flex;
    gap: 15px;
  }
}
.object-preview {
  width: 60px;
  height: 60px;
  border: 2px solid #000000;
  border-radius: 5px;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
}
</style>