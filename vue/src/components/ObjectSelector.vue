<template>
  <div class="object-selector">
    <h3 class="object-selector__title">Выберите объект:</h3>
    <div class="object-selector__grid">
      <div
        v-for="obj in availableObjects"
        :key="obj.id"
        class="object-preview-container"
        @click="() => selectObject(obj)"
      >
        <div
          class="object-preview"
          :style="{ backgroundColor: obj.color }"
        >
        </div>
        <div class="object-label">{{ obj.name }}</div>
        <div class="object-price" :class="{ 'free': obj.price_for_visitor === 0 }">
          {{ obj.cost }} ₽
        </div>
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
    name: 'Аттракцион 1',
    type: 'attraction',
    color: '#FFCCCC',
    colors: {
      1: '#FFCCCC', 
      2: '#FF6666', 
      3: '#FF3333'  
    },
    shape: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    height: 2,
    timer: 5,
    visitors: 5,
    cost: 100,
    price_for_visitor: 10,
    statBonusByLevel: {
      1: { boredom: 2 },
      2: { boredom: 4 },
      3: { boredom: 6 }
    }
  },
  {
    id: 2,
    name: 'Аттракцион 2',
    type: 'attraction',
    color: '#FFE0B3',
    colors: {
      1: '#FFE0B3', 
      2: '#FFA366',
      3: '#FF8000'  
    },
    shape: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }],
    height: 2,
    timer: 4,
    visitors: 6,
    cost: 150,
    price_for_visitor: 8,
    statBonusByLevel: {
      1: { boredom: 3 },
      2: { boredom: 5 },
      3: { boredom: 7 }
    }
  },
  {
    id: 3,
    name: 'Киоск с едой',
    type: 'food',
    colors: {
      1: '#FFFFCC', 
      2: '#FFFF66', 
      3: '#FFFF00'  
    },
    color: '#FFFFCC',
    shape: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
    height: 1,
    timer: 3,
    visitors: 4,
    cost: 80, 
    price_for_visitor: 6,
    statBonusByLevel: {
      1: { hunger: 4 },
      2: { hunger: 6 },
      3: { hunger: 8 }
    }
  },
  {
    id: 4,
    name: 'Лавочка',
    type: 'bench',
    color: 'green',
    shape: [{ x: 0, y: 0 }],
    height: 1,
    timer: 5,
    visitors: 2,
    cost: 50,
    price_for_visitor: 0,
    statBonus: { fatigue: 3 }
  },
  {
    id: 5,
    name: 'Туалет',
    type: 'toilet',
    color: 'blue',
    shape: [{ x: 0, y: 0 }],
    height: 1,
    timer: 2,
    visitors: 3,
    cost: 60,
    price_for_visitor: 0,
    statBonus: { need: 5 }
  },
  {
    id: 6,
    name: 'Road',
    type: 'road',
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
  margin-bottom: 15px;

  &__title {
    font-size: 18px;
    color: #000000;
    margin-bottom: 15px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr); 
    grid-template-rows: repeat(2, auto);   
    gap: 12px; 
    max-width: 240px; 
  }
}

.object-preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease;
  padding: 5px;
  
  &:hover {
    transform: scale(1.05);
    
    .object-preview {
      box-shadow: 0 0 8px rgba(0,0,0,0.3);
    }
  }
}

.object-preview {
  width: 45px;
  height: 45px;
  border: 2px solid #000000;
  border-radius: 4px;
  margin-bottom: 4px;
  transition: transform 0.2s ease;
  position: relative;
}

.building-level-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background-color: #4CAF50;
  color: white;
  font-size: 7px;
  font-weight: bold;
  padding: 1px 3px;
  border-radius: 3px;
  border: 1px solid #388E3C;
  min-width: 16px;
  text-align: center;
  z-index: 1;
}

.object-label {
  font-size: 10px; 
  font-weight: bold;
  text-align: center;
  color: #333;
  margin-bottom: 2px;
  line-height: 1.2;
  height: 24px; 
  display: flex;
  align-items: center;
  justify-content: center;
}

.object-price {
  font-size: 9px; 
  font-weight: bold;
  text-align: center;
  color: #4CAF50;
  padding: 2px 4px;
  border-radius: 3px;
  background-color: #f1f8e9;
  
  &.free {
    color: #2196F3;
    background-color: #e3f2fd;
  }
}
</style>