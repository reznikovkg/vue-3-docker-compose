<template>
  <div class="shop-page">
    <div class="shop-page__header">
      <button class="shop-page__back-button" @click="$router.push('/')">
        ← На главную
      </button>
      <h1 class="shop-page__title">🏪 Магазин снастей</h1>
      <div class="shop-page__money-display">Баланс: {{ money }} ₽</div>
    </div>

    <div class="shop-page__content">
      <div class="shop-section">
        <h2 class="shop-section__title">🎣 Снасти для рыбалки</h2>
        <div class="shop-section__items">
          <div
            v-for="item in availableItems"
            :key="item.id"
            class="shop-item"
            :class="{'shop-item--affordable': money >= item.price}"
          >
            <div class="shop-item__info">
              <h3 class="shop-item__name">{{ item.name }}</h3>
              <p class="shop-item__description">{{ item.description }}</p>
              <div class="shop-item__properties" v-if="item.properties">
                <span v-if="item.properties.strengthBonus" class="property-badge property-badge--strength">
                  +{{ item.properties.strengthBonus }} сила
                </span>
                <span v-if="item.properties.level" class="property-badge property-badge--level">
                  Уровень {{ item.properties.level }}
                </span>
              </div>
            </div>
            <div class="shop-item__actions">
              <div class="shop-item__price">{{ item.price }} ₽</div>
              <button
                @click="handleBuyItem(item.id)"
                :disabled="money < item.price"
                class="shop-item__buy-button"
              >
                Купить
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="shop-section">
        <h2 class="shop-section__title">🪱 Наживки</h2>
        <div class="shop-section__items">
          <div
            v-for="item in baitItems"
            :key="item.id"
            class="shop-item"
            :class="{'shop-item--affordable': money >= item.price}"
          >
            <div class="shop-item__info">
              <h3 class="shop-item__name">{{ item.name }}</h3>
              <p class="shop-item__description">{{ item.description }}</p>
              <div class="shop-item__properties" v-if="item.properties">
                <span v-if="item.properties.strengthBonus" class="property-badge property-badge--strength">
                  +{{ item.properties.strengthBonus }} сила
                </span>
              </div>
            </div>
            <div class="shop-item__actions">
              <div class="shop-item__price">{{ item.price }} ₽</div>
              <button
                @click="handleBuyItem(item.id)"
                :disabled="money < item.price"
                class="shop-item__buy-button"
              >
                Купить
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="shop-section">
        <h2 class="shop-section__title">⚡ Улучшения снастей</h2>
        <div class="upgrade-info">
          <p class="upgrade-info__text">Улучшайте свои снасти для повышения шансов на успешную рыбалку!</p>
        </div>
        <div class="shop-section__items">
          <div
            v-for="upgrade in tackleUpgrades"
            :key="upgrade.id"
            class="shop-item"
            :class="{'shop-item--affordable': money >= upgrade.price}"
          >
            <div class="shop-item__info">
              <h3 class="shop-item__name">{{ upgrade.name }}</h3>
              <p class="shop-item__description">{{ upgrade.description }}</p>
              <div class="shop-item__properties">
                <span class="property-badge property-badge--strength">
                  +{{ upgrade.properties.strengthBonus }} сила
                </span>
                <span class="property-badge property-badge--level">
                  Уровень {{ upgrade.properties.level }}
                </span>
              </div>
            </div>
            <div class="shop-item__actions">
              <div class="shop-item__price">{{ upgrade.price }} ₽</div>
              <button
                @click="handleBuyItem(upgrade.id)"
                :disabled="money < upgrade.price"
                class="shop-item__buy-button"
              >
                Улучшить
              </button>
            </div>
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
const baitItems = computed(() => store.getters['shop/baitItems'])
const tackleUpgrades = computed(() => store.getters['shop/tackleUpgrades'])
const money = computed(() => store.getters['fishing/money'])

const handleBuyItem = (itemId: string) => {
  store.dispatch('shop/buyItem', { itemId, quantity: 1 })
    .then((result: any) => {
      if (result.success) {
        console.log('✅ Товар куплен:', result.message)
      } else {
        console.log('❌ Ошибка покупки:', result.message)
      }
    })
    .catch((error: any) => {
      console.log('❌ Ошибка покупки:', error.message)
    })
}
</script>

<style scoped lang="less">
.shop-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding: 20px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }

  &__back-button {
    background: #6c757d;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
      background: #5a6268;
    }
  }

  &__title {
    color: #333;
    margin: 0;
  }

  &__money-display {
    font-size: 1.3em;
    font-weight: bold;
    color: #2E7D32;
    background: #E8F5E8;
    padding: 10px 20px;
    border-radius: 25px;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }
}

.shop-section {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);

  &__title {
    color: #333;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #4CAF50;
  }

  &__items {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }
}

.shop-item {
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  padding: 20px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &--affordable {
    border-color: #4CAF50;
    background: #f8fff8;
  }

  &__info {
    h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 1.2em;
    }
  }

  &__name {
    margin: 0 0 10px 0;
    color: #333;
    font-size: 1.2em;
  }

  &__description {
    color: #666;
    margin: 0 0 15px 0;
    line-height: 1.4;
  }

  &__properties {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 15px;
  }

  &__actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
  }

  &__price {
    font-weight: bold;
    color: #2E7D32;
    font-size: 1.1em;
  }

  &__buy-button {
    background: #4CAF50;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.3s ease;

    &:hover:not(:disabled) {
      background: #45a049;
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }
}

.property-badge {
  background: #E3F2FD;
  color: #1976D2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: bold;

  &--strength {
    background: #E8F5E8;
    color: #2E7D32;
  }

  &--level {
    background: #FFF3E0;
    color: #EF6C00;
  }
}

.upgrade-info {
  background: #FFF3E0;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #FF9800;

  &__text {
    margin: 0;
    color: #E65100;
    font-weight: 500;
  }
}

@media (max-width: 768px) {
  .shop-page {
    &__header {
      flex-direction: column;
      gap: 15px;
      text-align: center;
    }
  }

  .shop-section {
    &__items {
      grid-template-columns: 1fr;
    }
  }

  .shop-item {
    &__actions {
      flex-direction: column;
      gap: 10px;
      align-items: stretch;
    }

    &__buy-button {
      width: 100%;
    }
  }
}
</style>