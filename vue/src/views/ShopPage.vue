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
        <h2 class="shop-section__title">🍚 Прикормки</h2>
        <div class="shop-section__info">
          <p class="shop-section__description">
            🎯 Прикормки приманивают определенные виды рыбы и действуют 3 заброса.
            🎯 Забрасывайте в одно место для усиления эффекта.
            🎯 Разные прикормки заменяют друг друга на том же месте.
            🎯 Эффект: Увеличивает шанс поклевки указанных рыб в зоне действия.
          </p>
        </div>
        <div class="shop-section__items">
          <div
            v-for="item in groundbaitItems"
            :key="item.id"
            class="shop-item"
            :class="{'shop-item--affordable': money >= item.price}"
          >
            <div class="shop-item__info">
              <h3 class="shop-item__name">
                <span class="shop-item__emoji">{{ getGroundbaitEmoji(item.id) }}</span>
                {{ item.name }}
              </h3>
              <p class="shop-item__description">{{ item.description }}</p>
              <div class="shop-item__properties" v-if="item.properties">
                <div class="property-list">
                  <div class="property-item" v-for="attraction in item.properties.fishAttraction" :key="attraction.fishName">
                    <span class="property-item__fish">{{ attraction.fishName }}</span>
                    <span class="property-item__multiplier">×{{ attraction.attractionMultiplier.toFixed(1) }}</span>
                  </div>
                </div>
                <div class="shop-item__stats">
                  <span class="stat-badge">
                    Радиус: {{ item.properties.radius }}%
                  </span>
                  <span class="stat-badge">
                    Использований: {{ item.properties.uses }}
                  </span>
                  <span class="stat-badge stat-badge--level">
                    Уровень: {{ item.properties.level }}
                  </span>
                </div>
              </div>
            </div>
            <div class="shop-item__actions">
              <div class="shop-item__price">{{ item.price }} ₽</div>
              <button
                @click="handleBuyGroundbait(item.id)"
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
        <h2 class="shop-section__title">🎯 Сачки</h2>
        <div class="shop-section__info">
          <p class="shop-section__description">
            🎯 Сачок позволяет выловить рыбу раньше, когда она близко к берегу.
            🎯 Нажмите N или пробел во время борьбы для использования сачка.
            🎯 Внимание! Если рыба тяжелее максимального веса сачка, сачок ломается!
            🎯 Использования: Каждый сачок имеет ограниченное количество использований.
          </p>
        </div>
        <div class="shop-section__items">
          <div
            v-for="item in netItems"
            :key="item.id"
            class="shop-item shop-item--net"
            :class="{'shop-item--affordable': money >= item.price}"
          >
            <div class="shop-item__info">
              <h3 class="shop-item__name">
                <span class="shop-item__emoji">🎯</span>
                {{ item.name }}
              </h3>
              <p class="shop-item__description">{{ item.description }}</p>
              <div class="shop-item__properties" v-if="item.properties">
                <div class="property-grid">
                  <div class="property-grid__item">
                    <div class="property-grid__label">Макс. вес:</div>
                    <div class="property-grid__value">{{ item.properties.maxWeight }} кг</div>
                  </div>
                  <div class="property-grid__item">
                    <div class="property-grid__label">Использований:</div>
                    <div class="property-grid__value">{{ item.properties.uses }}</div>
                  </div>
                  <div class="property-grid__item">
                    <div class="property-grid__label">Прочность:</div>
                    <div class="property-grid__value">{{ item.properties.durability }}%</div>
                  </div>
                  <div class="property-grid__item">
                    <div class="property-grid__label">Уровень:</div>
                    <div class="property-grid__value">{{ item.properties.level || 1 }}</div>
                  </div>
                </div>
                <div class="shop-item__stats">
                  <span v-if="item.properties.strengthBonus" class="stat-badge stat-badge--strength">
                    +{{ item.properties.strengthBonus }} сила
                  </span>
                  <span class="stat-badge stat-badge--net">
                    🎯 Использований: {{ item.properties.uses }}
                  </span>
                </div>
              </div>
            </div>
            <div class="shop-item__actions">
              <div class="shop-item__price">{{ item.price }} ₽</div>
              <button
                @click="handleBuyNet(item.id)"
                :disabled="money < item.price"
                class="shop-item__buy-button shop-item__buy-button--net"
              >
                Купить сачок
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

const shopItems = computed(() => store.state.shop.shopItems)

const groundbaitItems = computed(() => {
  return shopItems.value.filter((item) => item.type === 'groundbait')
})

const netItems = computed(() => {
  return shopItems.value.filter((item) => item.type === 'net')
})

const getGroundbaitEmoji = (groundbaitId) => {
  const emojis = {
    'groundbait_basic': '🍚',
    'groundbait_advanced': '🥣',
    'groundbait_pro': '🎯',
    'groundbait_special': '🌊'
  }
  return emojis[groundbaitId] || '🍚'
}

const handleBuyItem = (itemId) => {
  store.dispatch('shop/buyItem', { itemId, quantity: 1 })
    .then((result) => {
      if (result.success) {
        const inventory = store.getters['fishing/inventory']
        const groundbait = store.getters['fishing/groundbaitInventory']
        const nets = store.getters['fishing/netInventory']
      }
    })
}

const handleBuyGroundbait = (itemId) => {
  handleBuyItem(itemId)
}

const handleBuyNet = (itemId) => {
  handleBuyItem(itemId)
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

  &__info {
    background: #FFF3E0;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    border-left: 4px solid #FF9800;
  }

  &__description {
    margin: 0;
    color: #E65100;
    font-size: 0.9em;
    line-height: 1.5;
  }

  &__items {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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

  &--net {
    border-color: #9C27B0;
    background: #f8f4ff;

    &.shop-item--affordable {
      border-color: #7B1FA2;
      background: #F3E5F5;
    }
  }

  &__info {
    h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 1.2em;
    }
  }

  &__emoji {
    margin-right: 8px;
    font-size: 1.2em;
  }

  &__name {
    margin: 0 0 10px 0;
    color: #333;
    font-size: 1.2em;
    display: flex;
    align-items: center;
  }

  &__description {
    color: #666;
    margin: 0 0 15px 0;
    line-height: 1.4;
    font-size: 0.95em;
  }

  &__properties {
    margin-bottom: 15px;
  }

  &__stats {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
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
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
      background: #45a049;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    &--net {
      background: #9C27B0;

      &:hover:not(:disabled) {
        background: #7B1FA2;
      }
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
  display: inline-block;
  margin-right: 8px;
  margin-bottom: 8px;

  &--strength {
    background: #E8F5E8;
    color: #2E7D32;
  }

  &--level {
    background: #FFF3E0;
    color: #EF6C00;
  }
}

.property-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 10px 0;
}

.property-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: #FFF3E0;
  border-radius: 12px;
  font-size: 0.8em;
  white-space: nowrap;

  &__fish {
    color: #EF6C00;
    font-weight: 500;
  }

  &__multiplier {
    color: #2E7D32;
    font-weight: bold;
    background: #E8F5E8;
    padding: 1px 4px;
    border-radius: 4px;
    font-size: 0.9em;
  }
}

.property-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin: 15px 0;

  &__item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__label {
    color: #666;
    font-size: 0.8em;
    font-weight: 500;
  }

  &__value {
    color: #333;
    font-weight: bold;
    font-size: 0.9em;
  }
}

.stat-badge {
  background: #E3F2FD;
  color: #1976D2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 500;

  &--strength {
    background: #E8F5E8;
    color: #2E7D32;
  }

  &--level {
    background: #FFF3E0;
    color: #EF6C00;
  }

  &--net {
    background: #F3E5F5;
    color: #7B1FA2;
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

  .property-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .shop-page {
    padding: 10px;

    &__header {
      padding: 15px;
    }
  }

  .shop-section {
    padding: 15px;
  }

  .shop-item {
    padding: 15px;
  }
}
</style>