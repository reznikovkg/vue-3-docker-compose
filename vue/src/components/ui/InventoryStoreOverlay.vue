<template>
  <div
    v-if="isOpen"
    class="inventory-overlay"
    @click="(event) => onBackdropClick(event)"
  >
    <section class="inventory-overlay__panel">
      <header class="inventory-overlay__header">
        <div class="inventory-overlay__title-wrap">
          <h2 class="inventory-overlay__title">
            {{ modeTitle }}
          </h2>
          <p class="inventory-overlay__money">Money: {{ moneyLabel }}</p>
        </div>
        <button
          class="inventory-overlay__close"
          type="button"
          @click="() => emitClose()"
        >
          x
        </button>
      </header>

      <div class="inventory-overlay__mode-switch">
        <button
          v-for="modeOption in modeOptions"
          :key="modeOption.id"
          class="inventory-overlay__switch-button"
          :class="{
            'inventory-overlay__switch-button--active': modeOption.id === mode
          }"
          type="button"
          @click="() => emitModeChange(modeOption.id)"
        >
          {{ modeOption.label }}
        </button>
      </div>

      <div class="inventory-overlay__tabs">
        <button
          v-for="tabOption in visibleTabs"
          :key="tabOption.id"
          class="inventory-overlay__tab"
          :class="{
            'inventory-overlay__tab--active': tabOption.id === activeTab
          }"
          type="button"
          @click="() => emitTabChange(tabOption.id)"
        >
          {{ tabOption.label }}
        </button>
      </div>

      <div class="inventory-overlay__items">
        <article
          v-for="item in itemsForActiveTab"
          :key="item.id"
          class="inventory-overlay__item"
        >
          <div v-if="item.imageSrc" class="inventory-overlay__item-media">
            <img
              class="inventory-overlay__item-image"
              :src="item.imageSrc"
              :alt="`${item.name} thumbnail`"
              draggable="false"
              loading="lazy"
              width="96"
              height="64"
              @dragstart.prevent
            />
          </div>
          <div class="inventory-overlay__item-info">
            <h3 class="inventory-overlay__item-title">{{ item.name }}</h3>
            <p class="inventory-overlay__item-meta">{{ item.meta }}</p>
            <p
              v-if="isInventoryMode && !isFishTab"
              class="inventory-overlay__item-meta"
            >
              Owned: {{ item.ownedLabel }}
            </p>
            <p
              v-if="isInventoryMode && item.isEquipped"
              class="inventory-overlay__item-meta"
            >
              Equipped
            </p>
            <p v-if="!isInventoryMode" class="inventory-overlay__item-meta">
              Price: {{ item.price }}
            </p>
            <p
              v-if="isInventoryMode && isFishTab"
              class="inventory-overlay__item-meta"
            >
              Sell price: {{ item.price }}
            </p>
          </div>
          <div class="inventory-overlay__item-actions">
            <button
              v-if="isInventoryMode && isFishTab"
              class="inventory-overlay__action inventory-overlay__action--sell"
              type="button"
              @click="() => emitSellItem(item)"
            >
              Sell
            </button>
            <button
              v-else-if="isInventoryMode && activeTab !== 'groundbait'"
              class="inventory-overlay__action inventory-overlay__action--equip"
              :class="{
                'inventory-overlay__action--equipped': item.isEquipped
              }"
              :disabled="item.isEquipped || !item.canEquip"
              type="button"
              @click="() => emitEquipItem(item)"
            >
              {{ item.isEquipped ? 'Equipped' : 'Equip' }}
            </button>
            <button
              v-else-if="!isInventoryMode"
              class="inventory-overlay__action inventory-overlay__action--buy"
              :disabled="!item.canBuy"
              type="button"
              @click="() => emitBuyItem(item)"
            >
              Buy
            </button>
            <button
              v-else
              class="inventory-overlay__action inventory-overlay__action--muted"
              disabled
              type="button"
            >
              No action
            </button>
          </div>
        </article>
      </div>

      <footer class="inventory-overlay__footer">
        <button
          v-if="showBulkSell"
          class="inventory-overlay__bulk-sell"
          type="button"
          @click="() => emitSellAllFish()"
        >
          Sell all fish
        </button>
      </footer>
    </section>
  </div>
</template>

<script>
const INVENTORY_TABS = [
  { id: 'fish', label: 'Fish' },
  { id: 'rods', label: 'Rods' },
  { id: 'lines', label: 'Lines' },
  { id: 'bait', label: 'Bait' },
  { id: 'landingNets', label: 'Landing Nets' },
  { id: 'groundbait', label: 'Groundbait' }
]

const STORE_TABS = INVENTORY_TABS.filter((tab) => tab.id !== 'fish')

const MODE_OPTIONS = [
  { id: 'inventory', label: 'Inventory' },
  { id: 'store', label: 'Store' }
]

export default {
  name: 'InventoryStoreOverlay',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'inventory'
    },
    activeTab: {
      type: String,
      default: 'fish'
    },
    money: {
      type: Number,
      default: 0
    },
    inventoryFish: {
      type: Array,
      default: () => []
    },
    inventoryGearItems: {
      type: Object,
      default: () => ({
        rods: [],
        lines: [],
        bait: [],
        landingNets: [],
        groundbait: []
      })
    },
    storeGearItems: {
      type: Object,
      default: () => ({
        rods: [],
        lines: [],
        bait: [],
        landingNets: [],
        groundbait: []
      })
    }
  },
  emits: [
    'close',
    'mode-change',
    'tab-change',
    'sell-item',
    'sell-all-fish',
    'buy-item',
    'equip-item'
  ],
  computed: {
    inventoryTabs() {
      return INVENTORY_TABS
    },
    storeTabs() {
      return STORE_TABS
    },
    visibleTabs() {
      if (this.isInventoryMode) {
        return this.inventoryTabs
      }

      return this.storeTabs
    },
    modeOptions() {
      return MODE_OPTIONS
    },
    isInventoryMode() {
      return this.mode === 'inventory'
    },
    isFishTab() {
      return this.activeTab === 'fish'
    },
    modeTitle() {
      if (this.isInventoryMode) {
        return 'Inventory'
      }

      return 'Store'
    },
    moneyLabel() {
      return Number(this.money || 0).toLocaleString()
    },
    normalizedInventoryFish() {
      return this.inventoryFish.map((fish) => ({
        id: fish.id,
        fishId: fish.fishId,
        name: fish.fishName,
        meta: `Tier ${fish.tier} | ${Number(fish.size || 0).toFixed(2)} kg | Q${Number(fish.quality || 0).toFixed(1)}`,
        owned: null,
        price: Number(fish.sellPrice || 0),
        imageSrc: `/images/fish/${fish.fishId}.webp`
      }))
    },
    itemsForActiveTab() {
      if (this.isInventoryMode && this.activeTab === 'fish') {
        return this.normalizedInventoryFish
      }

      if (!this.isInventoryMode && this.activeTab === 'fish') {
        return []
      }

      if (this.isInventoryMode) {
        return this.inventoryGearItems[this.activeTab] || []
      }

      return this.storeGearItems[this.activeTab] || []
    },
    showBulkSell() {
      return (
        this.isInventoryMode &&
        this.activeTab === 'fish' &&
        this.normalizedInventoryFish.length > 0
      )
    }
  },
  mounted() {
    window.addEventListener('keydown', this.onWindowKeyDown)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onWindowKeyDown)
  },
  methods: {
    emitClose() {
      this.$emit('close')
    },
    emitModeChange(modeId) {
      this.$emit('mode-change', modeId)
    },
    emitTabChange(tabId) {
      this.$emit('tab-change', tabId)
    },
    emitSellItem(item) {
      this.$emit('sell-item', item)
    },
    emitEquipItem(item) {
      this.$emit('equip-item', item)
    },
    emitBuyItem(item) {
      this.$emit('buy-item', item)
    },
    emitSellAllFish() {
      this.$emit('sell-all-fish')
    },
    onWindowKeyDown(event) {
      if (!this.isOpen) {
        return
      }

      if (event.key !== 'Escape') {
        return
      }

      event.preventDefault()
      this.emitClose()
    },
    onBackdropClick(event) {
      if (event.target !== event.currentTarget) {
        return
      }

      this.emitClose()
    }
  }
}
</script>

<style scoped lang="scss">
.inventory-overlay {
  align-items: center;
  background: rgba(4, 10, 17, 0.72);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 12px;
  position: fixed;
  z-index: 40;

  &__panel {
    background: rgba(6, 13, 22, 0.94);
    border: 1px solid rgba(217, 228, 240, 0.24);
    border-radius: 12px;
    color: #f2f7fb;
    display: grid;
    gap: 10px;
    grid-template-rows: auto auto auto minmax(0, 1fr) auto;
    height: min(92dvh, 960px);
    overflow: hidden;
    padding: 12px;
    width: min(96vw, 1100px);
  }

  &__header,
  &__mode-switch,
  &__tabs,
  &__footer {
    align-items: center;
    display: flex;
    gap: 8px;
  }

  &__header {
    justify-content: space-between;
  }

  &__items {
    align-content: start;
    display: grid;
    gap: 8px;
    overflow: auto;
  }

  &__item {
    align-items: center;
    background: rgba(13, 27, 40, 0.82);
    border: 1px solid rgba(203, 219, 236, 0.2);
    border-radius: 10px;
    display: grid;
    gap: 10px;
    grid-template-columns: 84px 1fr auto;
    padding: 10px;
    width: 100%;
  }

  &__item-media {
    align-self: start;
    border: 1px solid rgba(203, 219, 236, 0.28);
    border-radius: 8px;
    line-height: 0;
    overflow: hidden;
    width: 84px;
  }

  &__item-image {
    display: block;
    width: 100%;
  }

  &__item-actions {
    display: flex;
    justify-content: flex-end;
  }

  &__close,
  &__switch-button,
  &__tab,
  &__action,
  &__bulk-sell {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(205, 220, 235, 0.3);
    border-radius: 8px;
    color: #f2f7fb;
    cursor: pointer;
    font-size: 12px;
    padding: 8px 10px;
  }

  &__action:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  &__action--equip {
    background: #1a4f8f;
    border-color: #3b78bc;
  }

  &__action--equip:disabled {
    opacity: 0.7;
  }

  &__action--equipped {
    background: #66a6e0;
    border-color: #8fc1eb;
    color: #eef7ff;
  }

  &__action--equipped:disabled {
    opacity: 1;
  }

  &__action--buy {
    background: #1f7f44;
    border-color: #2ea85b;
  }

  &__action--sell,
  &__bulk-sell {
    background: #9c2e2e;
    border-color: #c24a4a;
    color: #fff;
  }

  &__switch-button--active,
  &__tab--active {
    background: rgba(18, 80, 44, 0.55);
  }
}
</style>
