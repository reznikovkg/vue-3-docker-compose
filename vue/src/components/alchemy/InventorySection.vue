<template>
  <div class="inventory-section">
    <h3 class="inventory-section__title">Инвентарь</h3>
    <div class="inventory-section__grid">
      <div 
        v-for="item in inventoryItems" 
        :key="item.id" 
        class="inventory-item"
      >
        <span class="inventory-item__icon">{{ item.icon }}</span>
        <span class="inventory-item__name">{{ item.name }}</span>
        <span class="inventory-item__count">x{{ item.count }}</span>
        <button 
          v-if="item.isBase"
          class="inventory-item__mine-btn" 
          @click="() => assignWorker(item.id)"
          :disabled="workers.free === 0"
          :title="item.miningTime"
        >
          ⛏️
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { ELEMENTS } from '../../config/elements'

export default {
  name: 'InventorySection',
  computed: {
    ...mapGetters(['inventory', 'workers']),
    elements: () => ELEMENTS,
    inventoryItems() {
      return Object.entries(this.inventory).map(([id, count]) => {
        const element = this.elements[id]
        return {
          id: Number(id),
          count,
          name: element.name,
          icon: element.icon,
          isBase: [1, 2, 3, 4].includes(Number(id)),
          miningTime: `Время добычи: ${element.baseTime} сек`
        }
      })
    }
  },
  methods: {
    ...mapActions(['assignWorker'])
  }
}
</script>

<style scoped lang="scss">
.inventory-section {
  flex: 1;
  min-width: 400px;
  background: rgba(0,0,0,0.1);
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  overflow: hidden;

  @media (max-width: 600px) {
    min-width: auto;
    width: 100%;
    height: auto;
    max-height: 400px;
  }

  &__title {
    margin: 0 0 10px;
    font-size: 16px;
    border-bottom: 1px solid rgba(255,255,255,0.2);
    padding-bottom: 5px;
    flex-shrink: 0;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
    overflow-y: auto; 
    overflow-x: hidden; 
    padding: 5px;
    flex: 1;
    min-height: 0; 
    
    max-height: calc(100vh - 200px);

    @media (max-width: 600px) {
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      max-height: 300px;
    }
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(255,255,255,0.1);
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.3);
      border-radius: 3px;
      
      &:hover {
        background: rgba(255,255,255,0.4);
      }
    }
  }
}

.inventory-item {
  position: relative;
  background: rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 80px;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    background: rgba(255,255,255,0.15);
  }

  &__icon {
    font-size: 24px;
    margin-bottom: 4px;
  }

  &__name {
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 2px;
  }

  &__count {
    font-size: 11px;
    color: #bdc3c7;
  }

  &__mine-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 22px;
    height: 22px;
    border: none;
    border-radius: 4px;
    background: #f39c12;
    color: white;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    
    &:disabled { 
      opacity: 0.3; 
      cursor: not-allowed;
      &:hover { transform: none; }
    }
    
    &:hover:not(:disabled) { 
      background: #e67e22;
      transform: scale(1.1);
    }
  }
}
</style>