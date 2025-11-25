<template>
  <div class="home">
    <div class="header">
      <h1>🎣 Русская Рыбалка</h1>
      <div class="money-display">Баланс: {{ money }} ₽</div>
    </div>

    <div class="navigation">
      <router-link to="/shop" class="nav-button shop-button">
        🏪 Магазин
      </router-link>
      <router-link to="/inventory" class="nav-button inventory-button">
        🎒 Инвентарь
      </router-link>
    </div>

    <div class="home-content">
      <LocationSelector :locations="locations" />
      <div class="side-panels">
        <Inventory :caught-fish="caughtFish" />
        <QuickStats />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LocationSelector from '@/components/LocationSelector.vue'
import Inventory from '@/components/Inventory.vue'
import QuickStats from '@/components/QuickStats.vue'
import { useStore } from 'vuex'
import { computed } from 'vue'
import { locations } from '@/data/locations'

const store = useStore()
const caughtFish = computed(() => store.getters['fishing/caughtFish'])
const money = computed(() => store.getters['fishing/money'])
</script>

<style scoped lang="less">
.home {
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 20px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);

    h1 {
      color: #333;
      margin: 0;
    }

    .money-display {
      font-size: 1.3em;
      font-weight: bold;
      color: #2E7D32;
      background: #E8F5E8;
      padding: 10px 20px;
      border-radius: 25px;
    }
  }

  .navigation {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 20px;

    .nav-button {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      border-radius: 10px;
      text-decoration: none;
      font-weight: bold;
      font-size: 1.1em;
      transition: all 0.3s ease;
      text-align: center;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      }

      &.shop-button {
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
      }

      &.inventory-button {
        background: linear-gradient(135deg, #2196F3, #1976D2);
        color: white;
      }
    }
  }

  .home-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
  }

  .side-panels {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .home {
    .header {
      flex-direction: column;
      gap: 15px;
      text-align: center;
    }

    .navigation {
      grid-template-columns: 1fr;
    }

    .home-content {
      grid-template-columns: 1fr;
    }
  }
}
</style>