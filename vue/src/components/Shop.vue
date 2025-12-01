<template>
  <div class="shop">
    <h2 class="shop__title">🏪 Магазин снастей</h2>
    <div class="shop__money-display">Баланс: {{ money }} ₽</div>

    <div class="shop__sections">
      <div class="shop-section">
        <h3 class="shop-section__title">🎣 Снасти</h3>
        <div class="shop-section__items">
          <div
            v-for="item in availableItems"
            :key="item.id"
            class="shop-item"
            :class="{ 'shop-item--affordable': money >= item.price }"
          >
            <div class="shop-item__info">
              <h4 class="shop-item__name">{{ item.name }}</h4>
              <p class="shop-item__description">{{ item.description }}</p>
              <div class="shop-item__price">{{ item.price }} ₽</div>
            </div>
            <button
              @click="buyItem(item.id)"
              :disabled="money < item.price"
              class="shop-item__buy-button"
            >
              Купить
            </button>
          </div>
        </div>
      </div>

      <div class="shop-section">
        <h3 class="shop-section__title">💰 Продажа улова</h3>
        <div class="sale-info">
          <div class="sale-info__stats">
            Рыбы для продажи: {{ fishForSale.length }} шт.
          </div>
          <div class="sale-info__total-value">
            Общая стоимость: {{ totalFishValue }} ₽
          </div>
        </div>

        <button
          @click="sellAllFish"
          class="sale-info__sell-all-button"
          :disabled="fishForSale.length === 0"
        >
          {{ fishForSale.length === 0 ? 'Нет рыбы для продажи' : `Продать всю рыбу за ${totalFishValue} ₽` }}
        </button>

        <div v-if="fishForSale.length === 0" class="sale-info__no-fish-message">
          Нет рыбы для продажи
        </div>

        <div v-else class="sale-info__fish-list">
          <div
            v-for="fish in fishForSale"
            :key="fish.inventoryId"
            class="sale-item"
          >
            <span class="sale-item__emoji">{{ fish.emoji }}</span>
            <div class="sale-item__details">
              <span class="sale-item__name">{{ fish.name }}</span>
              <span class="sale-item__location">{{ fish.location }}</span>
            </div>
            <div class="sale-item__price">{{ Math.floor(fish.price * 0.7) }} ₽</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const availableItems = computed(() => store.getters['shop/availableItems'])
const money = computed(() => store.getters['fishing/money'])
const fishForSale = computed(() => store.getters['fishing/availableFishForSale'])
const totalFishValue = computed(() => store.getters['fishing/totalFishValue'])

const buyItem = (itemId: string) => {
  store.dispatch('shop/buyItem', { itemId, quantity: 1 })
}

const sellAllFish = () => {
  store.dispatch('fishing/sellAllFish')
}
</script>

<style scoped lang="less">
.shop {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #ddd;

  &__title {
    margin-bottom: 20px;
    color: #333;
    text-align: center;
  }

  &__money-display {
    font-size: 1.2em;
    font-weight: bold;
    color: #2E7D32;
    margin-bottom: 20px;
    text-align: center;
    background: #E8F5E8;
    padding: 10px;
    border-radius: 6px;
  }

  &__sections {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }
}

.shop-section {
  &__title {
    margin-bottom: 15px;
    color: #333;
    border-bottom: 2px solid #4CAF50;
    padding-bottom: 8px;
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

.shop-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s ease;

  &--affordable {
    border-color: #4CAF50;
  }

  &__info {
    flex: 1;

    h4 {
      margin: 0 0 5px 0;
      color: #333;
    }

    p {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 0.9em;
    }
  }

  &__price {
    font-weight: bold;
    color: #2E7D32;
  }

  &__buy-button {
    background: #4CAF50;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;

    &:hover:not(:disabled) {
      background: #45a049;
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }
}

.sale-info {
  &__stats {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    padding: 10px;
    background: #FFF3E0;
    border-radius: 6px;
  }

  &__sell-all-button {
    background: #FF9800;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 1em;
    cursor: pointer;
    width: 100%;
    font-weight: bold;
    margin-bottom: 15px;

    &:hover:not(:disabled) {
      background: #F57C00;
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }

  &__no-fish-message {
    text-align: center;
    color: #666;
    font-style: italic;
    padding: 20px;
  }

  &__fish-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}

.sale-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;

  &__emoji {
    font-size: 1.2em;
  }

  &__details {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &__name {
    font-weight: bold;
    color: #333;
  }

  &__location {
    font-size: 0.8em;
    color: #666;
  }

  &__price {
    font-weight: bold;
    color: #FF9800;
  }
}
</style>