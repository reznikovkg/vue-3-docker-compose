<template>
  <div class="shop">
    <h2 class="shop__title">🏪 Магазин снастей</h2>
    <div class="shop__money">Баланс: {{ money }} ₽</div>

    <div class="shop__sections">
      <div class="shop__section">
        <h3 class="shop__section-title">🎣 Снасти</h3>
        <div class="shop__section-items">
          <div
            v-for="item in availableItems"
            :key="item.id"
            class="shop__item"
            :class="{ 'shop__item--affordable': money >= item.price }"
          >
            <div class="shop__item-info">
              <h4 class="shop__item-name">{{ item.name }}</h4>
              <p class="shop__item-description">{{ item.description }}</p>
              <div class="shop__item-price">{{ item.price }} ₽</div>
            </div>
            <button
              @click="buyItem(item.id)"
              :disabled="money < item.price"
              class="shop__item-buy"
            >
              Купить
            </button>
          </div>
        </div>
      </div>

      <div class="shop__section">
        <h3 class="shop__section-title">💰 Продажа улова</h3>
        <div class="shop__sale">
          <div class="shop__sale-stats">
            Рыбы для продажи: {{ fishForSale.length }} шт.
          </div>
          <div class="shop__sale-total">
            Общая стоимость: {{ totalFishValue }} ₽
          </div>
        </div>

        <button
          @click="sellAllFish"
          class="shop__sale-button"
          :disabled="fishForSale.length === 0"
        >
          {{ fishForSale.length === 0 ? 'Нет рыбы для продажи' : `Продать всю рыбу за ${totalFishValue} ₽` }}
        </button>

        <div v-if="fishForSale.length === 0" class="shop__sale-empty">
          Нет рыбы для продажи
        </div>

        <div v-else class="shop__sale-list">
          <div
            v-for="fish in fishForSale"
            :key="fish.inventoryId"
            class="shop__sale-item"
          >
            <span class="shop__sale-emoji">{{ fish.emoji }}</span>
            <div class="shop__sale-details">
              <span class="shop__sale-name">{{ fish.name }}</span>
              <span class="shop__sale-location">{{ fish.location }}</span>
            </div>
            <div class="shop__sale-price">{{ Math.floor(fish.price * 0.7) }} ₽</div>
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

  &__money {
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

  &__section {
    &-title {
      margin-bottom: 15px;
      color: #333;
      border-bottom: 2px solid #4CAF50;
      padding-bottom: 8px;
    }

    &-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  }

  &__item {
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

    &-info {
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

    &-price {
      font-weight: bold;
      color: #2E7D32;
    }

    &-buy {
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

  &__sale {
    &-stats {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
      padding: 10px;
      background: #FFF3E0;
      border-radius: 6px;
    }

    &-button {
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

    &-empty {
      text-align: center;
      color: #666;
      font-style: italic;
      padding: 20px;
    }

    &-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }

  &__sale-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 15px;
    background: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #e9ecef;
  }

  &__sale-emoji {
    font-size: 1.2em;
  }

  &__sale-details {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &__sale-name {
    font-weight: bold;
    color: #333;
  }

  &__sale-location {
    font-size: 0.8em;
    color: #666;
  }

  &__sale-price {
    font-weight: bold;
    color: #FF9800;
  }
}
</style>