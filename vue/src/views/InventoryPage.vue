<template>
  <div class="inventory-page">
    <div class="inventory-page__header">
      <button class="inventory-page__back-button" @click="$router.push('/')">
        ← На главную
      </button>
      <h1 class="inventory-page__title">🎒 Мой инвентарь</h1>
      <div class="inventory-page__money-display">Баланс: {{ money }} ₽</div>
    </div>

    <div class="inventory-page__content">
      <div class="inventory-section">
        <h2 class="inventory-section__title">⚡ Экипированные снасти</h2>
        <div class="equipped-tackle">
          <div class="tackle-slot" v-for="slot in tackleSlots" :key="slot.type">
            <div class="tackle-slot__label">{{ slot.label }}</div>
            <div class="tackle-slot__content" :class="{ 'tackle-slot__content--empty': !getEquippedItem(slot.type) }">
              <div v-if="getEquippedItem(slot.type)" class="equipped-item">
                <div class="equipped-item__name">{{ getEquippedItem(slot.type)?.name }}</div>
                <div class="equipped-item__bonus" v-if="getEquippedItem(slot.type)?.strengthBonus">
                  +{{ getEquippedItem(slot.type)?.strengthBonus }} сила
                </div>
                <button
                  @click="unequipTackle(slot.type)"
                  class="equipped-item__unequip-button"
                >
                  Снять
                </button>
              </div>
              <div v-else class="empty-slot">
                {{ slot.emptyText }}
              </div>
            </div>
          </div>
        </div>
        <div class="total-bonus">
          Общий бонус силы: +{{ totalStrengthBonus }}
        </div>
      </div>

      <div class="inventory-section">
        <h2 class="inventory-section__title">🐟 Улов для продажи ({{ fishForSale.length }})</h2>
        <div class="sale-actions">
          <div class="sale-actions__info">
            <span>Общая стоимость: {{ totalFishValue }} ₽</span>
            <span class="sale-actions__sell-price">(Продажа: {{ Math.floor(totalFishValue * 0.7) }} ₽)</span>
          </div>
          <button
            @click="sellAllFish"
            :disabled="fishForSale.length === 0"
            class="sale-actions__sell-all-button"
          >
            Продать всю рыбу за {{ Math.floor(totalFishValue * 0.7) }} ₽
          </button>
        </div>

        <div class="inventory-items">
          <div
            v-for="fish in fishForSale"
            :key="fish.inventoryId"
            class="inventory-item"
          >
            <div class="inventory-item__emoji">{{ fish.emoji }}</div>
            <div class="inventory-item__details">
              <div class="inventory-item__name">{{ fish.name }}</div>
              <div class="inventory-item__info">
                {{ fish.location }} • {{ fish.timestamp }} • Сила: {{ fish.strength }}
              </div>
            </div>
            <div class="inventory-item__actions">
              <div class="inventory-item__price">{{ Math.floor(fish.price * 0.7) }} ₽</div>
              <button
                @click="sellSingleFish(fish.inventoryId)"
                class="inventory-item__sell-button"
              >
                Продать
              </button>
            </div>
          </div>
        </div>

        <div v-if="fishForSale.length === 0" class="inventory-section__empty">
          🎣 Нет рыбы для продажи
        </div>
      </div>

      <div class="inventory-section">
        <h2 class="inventory-section__title">🎣 Снасти в инвентаре</h2>
        <div class="inventory-items">
          <div
            v-for="item in tackleInventory"
            :key="item.id"
            class="inventory-item"
          >
            <div class="inventory-item__emoji">🎣</div>
            <div class="inventory-item__details">
              <div class="inventory-item__name">{{ item.name }}</div>
              <div class="inventory-item__info">
                Количество: {{ item.quantity }}
                <span v-if="item.properties?.strengthBonus" class="inventory-item__bonus-text">
                  • +{{ item.properties.strengthBonus }} сила
                </span>
                <span v-if="item.properties?.level" class="inventory-item__level-text">
                  • Уровень {{ item.properties.level }}
                </span>
              </div>
            </div>
            <div class="inventory-item__actions">
              <div class="inventory-item__price">{{ Math.floor(item.price * 0.5) }} ₽</div>
              <div class="inventory-item__action-buttons">
                <button
                  v-if="getItemType(item.id) !== 'bait'"
                  @click="equipTackle(item.id)"
                  class="inventory-item__equip-button"
                >
                  Надеть
                </button>
                <button
                  @click="sellTackle(item.id)"
                  class="inventory-item__sell-button"
                >
                  Продать
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="tackleInventory.length === 0" class="inventory-section__empty">
          🎣 Нет снастей в инвентаре
        </div>
      </div>

      <div class="inventory-section">
        <h2 class="inventory-section__title">🪱 Наживки ({{ availableBait.length }})</h2>
        <div class="inventory-items">
          <div
            v-for="item in availableBait"
            :key="item.id"
            class="inventory-item"
          >
            <div class="inventory-item__emoji">🪱</div>
            <div class="inventory-item__details">
              <div class="inventory-item__name">{{ item.name }}</div>
              <div class="inventory-item__info">
                Количество: {{ item.quantity }}
                <span v-if="item.properties?.strengthBonus" class="inventory-item__bonus-text">
                  • +{{ item.properties.strengthBonus }} сила
                </span>
              </div>
            </div>
            <div class="inventory-item__actions">
              <div class="inventory-item__price">{{ Math.floor(item.price * 0.5) }} ₽</div>
              <div class="inventory-item__action-buttons">
                <button
                  @click="equipBait(item.id)"
                  class="inventory-item__equip-button"
                  :class="{ 'inventory-item__equip-button--equipped': isBaitEquipped(item.id) }"
                >
                  {{ isBaitEquipped(item.id) ? 'Экипирована' : 'Надеть' }}
                </button>
                <button
                  @click="sellTackle(item.id)"
                  class="inventory-item__sell-button"
                >
                  Продать
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="availableBait.length === 0" class="inventory-section__empty">
          Нет наживки
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const money = computed(() => store.getters['fishing/money'])
const fishForSale = computed(() => store.getters['fishing/availableFishForSale'])
const totalFishValue = computed(() => store.getters['fishing/totalFishValue'])
const tackleInventory = computed(() => store.getters['fishing/tackleInventory'])
const availableBait = computed(() => store.getters['fishing/availableBait'])
const equippedTackle = computed(() => store.getters['fishing/equippedTackle'])
const totalStrengthBonus = computed(() => store.getters['fishing/totalStrengthBonus'])

const tackleSlots = [
  { type: 'rod', label: 'Удочка', emptyText: 'Не экипирована' },
  { type: 'reel', label: 'Катушка', emptyText: 'Не экипирована' },
  { type: 'line', label: 'Леска', emptyText: 'Не экипирована' },
  { type: 'bait', label: 'Наживка', emptyText: 'Не экипирована' }
]

const getEquippedItem = (slotType: string) => {
  return equippedTackle.value[slotType as keyof typeof equippedTackle.value]
}

const getItemType = (itemId: string) => {
  const item = tackleInventory.value.find((item: any) => item.id === itemId) ||
               availableBait.value.find((item: any) => item.id === itemId)
  if (!item) return null
  if (item.id.includes('rod')) return 'rod'
  if (item.id.includes('reel')) return 'reel'
  if (item.id.includes('line')) return 'line'
  if (item.type === 'bait') return 'bait'
  return item.type
}

const isBaitEquipped = (itemId: string) => {
  return equippedTackle.value.bait?.id === itemId
}

const equipTackle = (itemId: string) => {
  const itemType = getItemType(itemId)
  if (itemType) {
    store.dispatch('fishing/equipTackle', {
      type: itemType,
      itemId
    })
  }
}

const equipBait = (itemId: string) => {
  store.dispatch('fishing/equipTackle', {
    type: 'bait',
    itemId
  })
}

const unequipTackle = (slotType: string) => {
  store.dispatch('fishing/unequipTackle', slotType)
}

const sellAllFish = () => {
  store.dispatch('fishing/sellAllFish')
}

const sellSingleFish = (inventoryId: string) => {
  store.dispatch('shop/sellFish', { fishId: inventoryId, quantity: 1 })
}

const sellTackle = (itemId: string) => {
  store.dispatch('shop/sellTackle', { itemId, quantity: 1 })
}
</script>

<style scoped lang="less">
.inventory-page {
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

.inventory-section {
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

  &__empty {
    text-align: center;
    color: #666;
    font-style: italic;
    padding: 40px 20px;
    background: #f8f9fa;
    border-radius: 8px;
  }
}

.equipped-tackle {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.tackle-slot {
  &__label {
    font-weight: bold;
    color: #666;
    margin-bottom: 8px;
    font-size: 0.9em;
  }

  &__content {
    border: 2px solid #4CAF50;
    border-radius: 8px;
    padding: 15px;
    background: #F8FFF8;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;

    &--empty {
      border-color: #e0e0e0;
      background: #f8f9fa;
      color: #999;
    }
  }
}

.equipped-item {
  text-align: center;
  width: 100%;

  &__name {
    font-weight: bold;
    color: #333;
    margin-bottom: 5px;
  }

  &__bonus {
    color: #2E7D32;
    font-size: 0.8em;
    margin-bottom: 10px;
  }

  &__unequip-button {
    background: #ff6b6b;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8em;

    &:hover {
      background: #ff5252;
    }
  }
}

.total-bonus {
  text-align: center;
  font-weight: bold;
  color: #2E7D32;
  background: #E8F5E8;
  padding: 10px;
  border-radius: 8px;
  font-size: 1.1em;
}

.sale-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #FFF3E0;
  border-radius: 8px;

  &__info {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  &__sell-price {
    color: #666;
    font-size: 0.9em;
  }

  &__sell-all-button {
    background: #FF9800;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;

    &:hover:not(:disabled) {
      background: #F57C00;
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }
}

.inventory-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inventory-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: #f8f9fa;
    transform: translateX(5px);
  }

  &__emoji {
    font-size: 1.5em;
  }

  &__details {
    flex: 1;

    .inventory-item__name {
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }

    .inventory-item__info {
      color: #666;
      font-size: 0.9em;

      .inventory-item__bonus-text {
        color: #2E7D32;
        font-weight: bold;
      }

      .inventory-item__level-text {
        color: #1976D2;
        font-weight: bold;
      }
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 15px;

    .inventory-item__price {
      font-weight: bold;
      color: #FF9800;
      min-width: 60px;
      text-align: right;
    }
  }

  &__action-buttons {
    display: flex;
    gap: 8px;
  }

  &__equip-button {
    background: #4CAF50;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8em;

    &:hover {
      background: #45a049;
    }

    &--equipped {
      background: #666;
      cursor: default;
    }
  }

  &__sell-button {
    background: #ff6b6b;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8em;

    &:hover {
      background: #ff5252;
    }
  }
}

@media (max-width: 768px) {
  .inventory-page {
    &__header {
      flex-direction: column;
      gap: 15px;
      text-align: center;
    }
  }

  .sale-actions {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .inventory-item {
    flex-wrap: wrap;

    &__actions {
      width: 100%;
      justify-content: space-between;
    }
  }

  .equipped-tackle {
    grid-template-columns: 1fr;
  }
}
</style>