<template>
  <div class="shop-page">
    <div class="page-header">
      <button class="back-button" @click="$router.push('/')">
        ← На главную
      </button>
      <h1>🏪 Магазин снастей</h1>
      <div class="money-display">Баланс: {{ money }} ₽</div>
    </div>

    <div class="shop-content">
      <div class="shop-section">
        <h2>🎣 Снасти для рыбалки</h2>
        <div class="shop-items">
          <div
            v-for="item in availableItems"
            :key="item.id"
            class="shop-item"
            :class="{ affordable: money >= item.price }"
          >
            <div class="item-info">
              <h3>{{ item.name }}</h3>
              <p class="item-description">{{ item.description }}</p>
              <div class="item-properties" v-if="item.properties">
                <span v-if="item.properties.strengthBonus" class="property-badge">
                  +{{ item.properties.strengthBonus }} сила
                </span>
                <span v-if="item.properties.level" class="property-badge">
                  Уровень {{ item.properties.level }}
                </span>
              </div>
            </div>
            <div class="item-actions">
              <div class="item-price">{{ item.price }} ₽</div>
              <button
                @click="buyItem(item.id)"
                :disabled="money < item.price"
                class="buy-button"
              >
                Купить
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="shop-section">
        <h2>🪱 Наживки</h2>
        <div class="shop-items">
          <div
            v-for="item in baitItems"
            :key="item.id"
            class="shop-item"
            :class="{ affordable: money >= item.price }"
          >
            <div class="item-info">
              <h3>{{ item.name }}</h3>
              <p class="item-description">{{ item.description }}</p>
              <div class="item-properties" v-if="item.properties">
                <span v-if="item.properties.strengthBonus" class="property-badge">
                  +{{ item.properties.strengthBonus }} сила
                </span>
              </div>
            </div>
            <div class="item-actions">
              <div class="item-price">{{ item.price }} ₽</div>
              <button
                @click="buyItem(item.id)"
                :disabled="money < item.price"
                class="buy-button"
              >
                Купить
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="shop-section">
        <h2>⚡ Улучшения снастей</h2>
        <div class="upgrade-info">
          <p>Улучшайте свои снасти для повышения шансов на успешную рыбалку!</p>
        </div>
        <div class="shop-items">
          <div
            v-for="upgrade in tackleUpgrades"
            :key="upgrade.id"
            class="shop-item"
            :class="{ affordable: money >= upgrade.price }"
          >
            <div class="item-info">
              <h3>{{ upgrade.name }}</h3>
              <p class="item-description">{{ upgrade.description }}</p>
              <div class="item-properties">
                <span class="property-badge">
                  +{{ upgrade.properties.strengthBonus }} сила
                </span>
                <span class="property-badge">
                  Уровень {{ upgrade.properties.level }}
                </span>
              </div>
            </div>
            <div class="item-actions">
              <div class="item-price">{{ upgrade.price }} ₽</div>
              <button
                @click="buyItem(upgrade.id)"
                :disabled="money < upgrade.price"
                class="buy-button"
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

const buyItem = async (itemId: string) => {
  await store.dispatch('shop/buyItem', { itemId, quantity: 1 })
}
</script>

<style scoped lang="less">
.shop-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);

  .back-button {
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

.shop-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.shop-section {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);

  h2 {
    color: #333;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #4CAF50;
  }
}

.shop-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.shop-item {
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  padding: 20px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &.affordable {
    border-color: #4CAF50;
    background: #f8fff8;
  }

  .item-info {
    h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 1.2em;
    }

    .item-description {
      color: #666;
      margin: 0 0 15px 0;
      line-height: 1.4;
    }
  }

  .item-properties {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 15px;
  }

  .property-badge {
    background: #E3F2FD;
    color: #1976D2;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8em;
    font-weight: bold;
  }

  .item-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
  }

  .item-price {
    font-weight: bold;
    color: #2E7D32;
    font-size: 1.1em;
  }

  .buy-button {
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

.upgrade-info {
  background: #FFF3E0;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #FF9800;

  p {
    margin: 0;
    color: #E65100;
    font-weight: 500;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .shop-items {
    grid-template-columns: 1fr;
  }

  .item-actions {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .buy-button {
    width: 100%;
  }
}
</style>