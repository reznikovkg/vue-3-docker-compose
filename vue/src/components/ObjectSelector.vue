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

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['select-object']);

const availableObjects = ref([
  {
    id: 1,
    name: 'Object1',
    color: 'red',
    shape: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    height: 2,
    timer: 5,
    visitors: 5,
    cost: 100,
    price_for_visitor: 10
  },
  {
    id: 2,
    name: 'Oblect2',
    color: 'orange',
    shape: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }],
     height: 2,
    timer: 4,
    visitors: 6,
    cost: 150,
    price_for_visitor: 8
  },
  {
    id: 3,
    name: 'Object3',
    color: 'yellow',
    shape: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
    height: 1,
    timer: 3,
    visitors: 4,
    cost: 80, 
    price_for_visitor: 6
  },
  {
    id: 4,
    name: 'Object4',
    color: 'cyan',
    shape: [{ x: 0, y: 0 }],
    height: 1,
    timer: 5,
    visitors: 2,
    cost: 50,
    price_for_visitor: 5
  },
  {
    id: 5,
    name: 'Road',
    color: 'grey',
    shape: [{ x: 0, y: 0 }],
    height: 1,
    cost: 10
  },
]);

const selectObject = (obj) => {
  emit('select-object', obj);
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