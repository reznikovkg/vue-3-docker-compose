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
            'inventory-overlay__switch-button--active': modeOption.id === mode,
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
            'inventory-overlay__tab--active': tabOption.id === activeTab,
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
  { id: 'groundbait', label: 'Groundbait' },
]

const STORE_TABS = INVENTORY_TABS.filter((tab) => tab.id !== 'fish')

const MODE_OPTIONS = [
  { id: 'inventory', label: 'Inventory' },
  { id: 'store', label: 'Store' },
]

export default {
  name: 'InventoryStoreOverlay',
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      default: 'inventory',
    },
    activeTab: {
      type: String,
      default: 'fish',
    },
    money: {
      type: Number,
      default: 0,
    },
    inventoryFish: {
      type: Array,
      default: () => [],
    },
    inventoryGearItems: {
      type: Object,
      default: () => ({
        rods: [],
        lines: [],
        bait: [],
        landingNets: [],
        groundbait: [],
      }),
    },
    storeGearItems: {
      type: Object,
      default: () => ({
        rods: [],
        lines: [],
        bait: [],
        landingNets: [],
        groundbait: [],
      }),
    },
  },
  emits: [
    'close',
    'mode-change',
    'tab-change',
    'sell-item',
    'sell-all-fish',
    'buy-item',
    'equip-item',
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
        imageSrc: `/images/fish/${fish.fishId}.webp`,
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
    },
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
    },
  },
}
</script>

<style scoped lang="scss">
@use '@/styles/mixins' as mixins;
@use '@/styles/tokens' as tokens;

.inventory-overlay {
  align-items: center;
  background: rgba(4, 10, 17, 0.72);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 16px;
  position: fixed;
  z-index: 40;

  &__panel {
    @include mixins.glass-panel(
      rgba(6, 13, 22, 0.94),
      rgba(217, 228, 240, 0.24),
      16px,
      0 24px 44px rgba(0, 0, 0, 0.34),
      16px
    );
    display: grid;
    grid-template-rows: auto auto auto minmax(0, 1fr) auto;
    gap: 12px;
    height: min(92dvh, 980px);
    max-width: 1240px;
    overflow: hidden;
    width: min(96vw, 1240px);
  }

  &__header {
    align-items: center;
    display: flex;
    justify-content: space-between;
  }

  &__title-wrap {
    display: grid;
    gap: 4px;
  }

  &__title {
    color: tokens.$fishing-panel-text;
    font-size: clamp(18px, 2.3vw, 28px);
    margin: 0;
    text-transform: uppercase;
  }

  &__money {
    color: #9de5a5;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
    margin: 0;
    text-transform: uppercase;
  }

  &__close {
    align-items: center;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid tokens.$fishing-panel-border;
    border-radius: 8px;
    color: tokens.$fishing-panel-text;
    cursor: pointer;
    display: inline-flex;
    font-size: 14px;
    font-weight: 700;
    height: 30px;
    justify-content: center;
    line-height: 1;
    text-transform: uppercase;
    width: 30px;
  }

  &__mode-switch {
    display: flex;
    gap: 8px;
  }

  &__switch-button {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid tokens.$fishing-panel-border;
    border-radius: 10px;
    color: tokens.$fishing-panel-text;
    cursor: pointer;
    font-size: 13px;
    font-weight: 700;
    min-width: 124px;
    padding: 9px 12px;
    text-transform: uppercase;

    &--active {
      background: rgba(18, 80, 44, 0.55);
      border-color: #2daa66;
    }
  }

  &__tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__tab {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid tokens.$fishing-panel-border;
    border-radius: 999px;
    color: tokens.$fishing-panel-text;
    cursor: pointer;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    padding: 8px 12px;
    text-transform: uppercase;

    &--active {
      background: rgba(31, 143, 78, 0.58);
      border-color: #3ac780;
    }
  }

  &__items {
    align-content: start;
    display: grid;
    gap: 10px;
    grid-auto-rows: max-content;
    min-height: 0;
    overflow: auto;
    padding-right: 2px;
  }

  &__item {
    align-items: stretch;
    background: rgba(13, 27, 40, 0.82);
    border: 1px solid rgba(203, 219, 236, 0.2);
    border-radius: 12px;
    display: grid;
    gap: 12px;
    grid-template-columns: 96px max-content auto;
    justify-content: start;
    padding: 12px;
  }

  &__item-media {
    border-radius: 8px;
    height: 100%;
    min-height: 100%;
    overflow: hidden;
    width: 100%;
  }

  &__item-image {
    display: block;
    height: 100%;
    object-fit: cover;
    user-select: none;
    -webkit-user-drag: none;
    width: 100%;
  }

  &__item-title {
    color: #f3f8fd;
    font-size: 16px;
    margin: 0 0 6px;
  }

  &__item-info {
    align-self: center;
    max-width: 100%;
    width: max-content;
  }

  &__item-meta {
    color: tokens.$fishing-panel-muted;
    font-size: 13px;
    margin: 0;
  }

  &__item-actions {
    align-self: stretch;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 116px;
  }

  &__action {
    border: 1px solid transparent;
    border-radius: 10px;
    color: #fff;
    cursor: pointer;
    font-size: 13px;
    font-weight: 700;
    min-height: 36px;
    padding: 8px 12px;
    text-transform: uppercase;

    &--sell {
      background: #8e3434;
      border-color: #c65e5e;
    }

    &--buy {
      background: #206d47;
      border-color: #2ea36a;
    }

    &--equip {
      background: #2b4f8f;
      border-color: #4b78c5;
    }

    &:disabled {
      cursor: default;
      opacity: 0.6;
    }
  }

  &__footer {
    align-items: center;
    display: flex;
    justify-content: flex-end;
    min-height: 42px;
  }

  &__bulk-sell {
    background: #a23f3f;
    border: 1px solid #d37272;
    border-radius: 10px;
    color: #fff;
    cursor: pointer;
    font-size: 13px;
    font-weight: 700;
    min-height: 38px;
    padding: 8px 14px;
    text-transform: uppercase;
  }

  &__close:focus-visible,
  &__switch-button:focus-visible,
  &__tab:focus-visible,
  &__action:focus-visible,
  &__bulk-sell:focus-visible {
    @include mixins.focus-ring(tokens.$button-focus-ring);
  }
}

@media (max-width: tokens.$fishing-breakpoint-tablet) {
  .inventory-overlay {
    padding: 12px;

    &__panel {
      gap: 10px;
      height: calc(100dvh - 24px);
      width: calc(100vw - 24px);
    }

    &__item {
      grid-template-columns: 84px max-content auto;
    }

    &__item-media {
      width: 100%;
    }

    &__item-actions {
      min-width: 88px;
    }
  }
}
</style>
