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

          <div class="tackle-slot" v-if="equippedNet">
            <div class="tackle-slot__label">Сачок</div>
            <div class="tackle-slot__content">
              <div class="equipped-item">
                <div class="equipped-item__name">{{ equippedNet.name }}</div>
                <div class="equipped-item__bonus">
                  Макс. вес: {{ equippedNet.maxWeight }} кг
                  • Использований: {{ equippedNet.usesLeft }} из {{ equippedNet.maxUses || 10 }}
                  <span v-if="isNetBroken(equippedNet)" class="equipped-item__broken-indicator">🚫 СЛОМАН</span>
                </div>
                <button
                  @click="unequipNet"
                  class="equipped-item__unequip-button"
                >
                  Снять
                </button>
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

      <div class="inventory-section" v-if="netInventory.length > 0">
        <h2 class="inventory-section__title">🎯 Сачки ({{ netInventory.length }})</h2>

        <div v-if="brokenNets.length > 0" class="broken-nets-actions">
          <button @click="removeAllBrokenNets" class="broken-nets-button">
            🗑️ Удалить все сломанные сачки ({{ brokenNets.length }})
          </button>
        </div>

        <div class="inventory-items">
          <div
            v-for="item in netInventory"
            :key="item.id"
            class="inventory-item"
            :class="{
              'inventory-item--broken': isNetBroken(item),
              'inventory-item--equipped': isNetEquipped(item.id)
            }"
          >
            <div class="inventory-item__emoji">🎯</div>
            <div class="inventory-item__details">
              <div class="inventory-item__name">
                {{ item.name }}
                <span v-if="isNetEquipped(item.id)" class="equipped-badge">✓</span>
              </div>
              <div class="inventory-item__info">
                Макс. вес: {{ item.properties?.maxWeight || 3 }} кг
                • Использований: {{ getNetUsesLeft(item) }} из {{ item.properties?.uses || 10 }}
                <span v-if="item.properties?.strengthBonus" class="inventory-item__bonus-text">
                  • +{{ item.properties.strengthBonus }} сила
                </span>
                <span class="inventory-item__level-text">
                  • Уровень {{ item.properties?.level || 1 }}
                </span>
                <span v-if="isNetBroken(item)" class="inventory-item__broken-text">
                  • 🚫 СЛОМАН
                </span>
              </div>
            </div>
            <div class="inventory-item__actions">
              <div class="inventory-item__price">{{ Math.floor(item.price * 0.6) }} ₽</div>
              <div class="inventory-item__action-buttons">
                <button
                  @click="equipNet(item.id)"
                  class="inventory-item__equip-button"
                  :class="{
                    'inventory-item__equip-button--equipped': isNetEquipped(item.id),
                    'inventory-item__equip-button--broken': isNetBroken(item)
                  }"
                  :disabled="isNetBroken(item)"
                >
                  {{ isNetEquipped(item.id) ? 'Экипирован' :
                     isNetBroken(item) ? 'Сломан' : 'Экипировать' }}
                </button>

                <button
                  v-if="!isNetBroken(item)"
                  @click="sellNet(item.id)"
                  class="inventory-item__sell-button"
                  :disabled="isNetEquipped(item.id)"
                >
                  Продать
                </button>

                <button
                  v-if="isNetBroken(item)"
                  @click="removeBrokenNet(item.id)"
                  class="inventory-item__remove-button"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
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
const equippedNet = computed(() => store.getters['fishing/equippedNet'])

const netInventory = computed(() => {
  return store.getters['fishing/netInventory'] || []
})

const brokenNets = computed(() => {
  return store.getters['fishing/getBrokenNets'] || []
})

const tackleSlots = [
  { type: 'rod', label: 'Удочка', emptyText: 'Не экипирована' },
  { type: 'reel', label: 'Катушка', emptyText: 'Не экипирована' },
  { type: 'line', label: 'Леска', emptyText: 'Не экипирована' },
  { type: 'bait', label: 'Наживка', emptyText: 'Не экипирована' }
]

const getEquippedItem = (slotType) => {
  return equippedTackle.value[slotType]
}

const getItemType = (itemId) => {
  const item = tackleInventory.value.find((item) => item.id === itemId) ||
               availableBait.value.find((item) => item.id === itemId) ||
               netInventory.value.find((item) => item.id === itemId)
  if (!item) return null
  if (item.id.includes('rod')) return 'rod'
  if (item.id.includes('reel')) return 'reel'
  if (item.id.includes('line')) return 'line'
  if (item.type === 'bait') return 'bait'
  if (item.type === 'net') return 'net'
  return item.type
}

const isBaitEquipped = (itemId) => {
  return equippedTackle.value.bait?.id === itemId
}

const isNetEquipped = (itemId) => {
  return equippedNet.value?.id === itemId
}

const getNetUsesLeft = (item) => {
  return item.properties?.usesLeft || item.properties?.uses || 0
}

const isNetBroken = (item) => {
  if (!item || !item.properties) return false
  const usesLeft = getNetUsesLeft(item)
  const durability = item.properties?.durability || 100
  return usesLeft <= 0 || durability <= 0 || item.properties?.isBroken
}

const equipTackle = (itemId) => {
  const itemType = getItemType(itemId)
  if (itemType) {
    store.dispatch('fishing/equipTackle', {
      type: itemType,
      itemId
    })
  }
}

const equipBait = (itemId) => {
  store.dispatch('fishing/equipTackle', {
    type: 'bait',
    itemId
  })
}

const equipNet = (itemId) => {
  store.dispatch('fishing/equipNet', itemId)
}

const unequipTackle = (slotType) => {
  store.dispatch('fishing/unequipTackle', slotType)
}

const unequipNet = () => {
  store.dispatch('fishing/unequipNet')
}

const sellAllFish = () => {
  store.dispatch('fishing/sellAllFish')
}

const sellSingleFish = (inventoryId) => {
  store.dispatch('shop/sellFish', { fishId: inventoryId, quantity: 1 })
}

const sellTackle = (itemId) => {
  store.dispatch('shop/sellTackle', { itemId, quantity: 1 })
}

const sellNet = (itemId) => {
  store.dispatch('shop/sellTackle', { itemId, quantity: 1 })
}

const removeBrokenNet = (netId) => {
  if (confirm('Удалить сломанный сачок из инвентаря?')) {
    store.dispatch('fishing/removeBrokenNetFromInventory', netId)
      .then((result) => {
        if (result.success) {
          alert('Сломанный сачок удален!')
        }
      })
  }
}

const removeAllBrokenNets = () => {
  if (brokenNets.value.length === 0) return

  if (confirm(`Удалить все сломанные сачки (${brokenNets.value.length} шт.)?`)) {
    brokenNets.value.forEach((net) => {
      store.dispatch('fishing/removeBrokenNetFromInventory', net.id)
    })
    alert('Все сломанные сачки удалены!')
  }
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

  &__broken-indicator {
    color: #f44336;
    font-weight: bold;
    margin-left: 5px;
  }

  &__unequip-button {
    background: #ff6b6b;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8em;

    &:hover:not(:disabled) {
      background: #ff5252;
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
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

  &--broken {
    opacity: 0.7;
    background: #ffebee;
    border-color: #ffcdd2;
  }

  &--equipped {
    border: 2px solid #4CAF50;
    background: #f8fff8;
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
      display: flex;
      align-items: center;
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

      .inventory-item__broken-text {
        color: #f44336;
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
    min-width: 90px;

    &:hover:not(:disabled) {
      background: #45a049;
    }

    &--equipped {
      background: #666;
      cursor: default;
    }

    &--broken {
      background: #9e9e9e;
      cursor: not-allowed;

      &:hover {
        background: #9e9e9e;
      }
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
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

    &:hover:not(:disabled) {
      background: #ff5252;
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }

  &__remove-button {
    background: #dc3545;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8em;

    &:hover {
      background: #c82333;
    }
  }
}

.broken-nets-actions {
  margin-bottom: 15px;
  padding: 10px;
  background: #ffebee;
  border-radius: 8px;
  text-align: center;
}

.broken-nets-button {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background: #c82333;
  }
}

.equipped-badge {
  display: inline-block;
  background: #4CAF50;
  color: white;
  font-size: 0.7em;
  padding: 2px 6px;
  border-radius: 50%;
  margin-left: 5px;
}

.empty-slot {
  color: #999;
  font-style: italic;
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