<template>
  <div class="inventory">
    <button class="inventory__back" @click.stop="() => back()">Назад</button>
    <h1 class="inventory__title">Инвентарь</h1>
    <div class="inventory__money">
      Деньги: {{ money }} монет
    </div>
    <div class="inventory__section">
      <h2 class="inventory__section-title">Удочки</h2>
      <div v-if="!rods.length" class="inventory__empty">
        Нет удочек
      </div>
      <div v-else v-for="rod in rods" :key="rod.id" class="inventory__item">
        <div>
          <span :style="{ fontWeight: rod.id === activeRod ? 'bold' : 'normal' }">
            {{ rod.name }}
          </span>
          <span class="inventory__item-price"> ({{ rod.price }} монет)</span>
          <span class="inventory__item-count"> x{{ rod.quantity }}</span>
        </div>
        <div class="inventory__item-actions">
          <button 
            class="inventory__button"
            @click="() => setActiveRod(rod.id)"
            :disabled="rod.id === activeRod"
          >
            {{ rod.id === activeRod ? 'Выбрано' : 'Выбрать' }}
          </button>
          <button 
            class="inventory__button"
            @click="() => sellItem(rod.id)"
            :disabled="rod.id === activeRod"
          >
            Продать
          </button>
        </div>
      </div>
    </div>
    <div class="inventory__section">
      <h2 class="inventory__section-title">Наживки</h2>
      <div v-if="!baits.length" class="inventory__empty">
        Нет наживок
      </div>
      <div v-else v-for="bait in baits" :key="bait.id" class="inventory__item">
        <div>
          <span :style="{ fontWeight: bait.id === activeBait ? 'bold' : 'normal' }">
            {{ bait.name }}
          </span>
          <span class="inventory__item-price"> ({{ bait.price }} монет)</span>
          <span class="inventory__item-count"> x{{ bait.quantity }}</span>
        </div>
        <div class="inventory__item-actions">
          <button 
            class="inventory__button"
            @click="() => setActiveBait(bait.id)"
            :disabled="bait.id === activeBait"
          >
            {{ bait.id === activeBait ? 'Выбрано' : 'Выбрать' }}
          </button>
          <button 
            class="inventory__button"
            @click="() => sellItem(bait.id)"
          >
            Продать
          </button>
        </div>
      </div>
    </div>
    <div class="inventory__section">
      <h2 class="inventory__section-title">Сачки</h2>
      <div v-if="!nets.length" class="inventory__empty">
        Нет сачков
      </div>
      <div v-else v-for="net in nets" :key="net.id" class="inventory__item">
        <div>
          <span :style="{ fontWeight: net.id === activeNet ? 'bold' : 'normal' }">
            {{ net.name }} (до {{ net.maxWeight }}г)
          </span>
          <span class="inventory__item-price"> ({{ net.price }} монет)</span>
          <span class="inventory__item-count"> x{{ net.quantity }}</span>
        </div>
        <div class="inventory__item-actions">
          <button 
            class="inventory__button"
            @click="() => setActiveNet(net.id)"
            :disabled="net.id === activeNet"
          >
            {{ net.id === activeNet ? 'Выбрано' : 'Выбрать' }}
          </button>
          <button 
            class="inventory__button"
            @click="() => sellItem(net.id)"
            :disabled="net.id === activeNet"
          >
            Продать
          </button>
        </div>
      </div>
    </div>
    <div class="inventory__section">
      <h2 class="inventory__section-title">Прикормки</h2>
      <div v-if="!groundbaits.length" class="inventory__empty">
        Нет прикормок
      </div>
      <div v-else v-for="groundbait in groundbaits" :key="groundbait.id" class="inventory__item">
        <div>
          <span :style="{ fontWeight: groundbait.id === activeGroundbait ? 'bold' : 'normal' }">
            {{ groundbait.name }}
          </span>
          <span class="inventory__item-price"> ({{ groundbait.price }} монет)</span>
          <span class="inventory__item-count"> x{{ groundbait.usesLeft }}</span>
        </div>
        <div class="inventory__item-actions">
          <button 
            class="inventory__button"
            @click="() => setActiveGroundbait(groundbait.id)"
            :disabled="groundbait.id === activeGroundbait"
          >
            {{ groundbait.id === activeGroundbait ? 'Выбрано' : 'Выбрать' }}
          </button>
          <button 
            class="inventory__button"
            @click="() => sellItem(groundbait.id)"
            :disabled="groundbait.id === activeGroundbait"
          >
            Продать
          </button>
        </div>
      </div>
    </div>
    <div class="inventory__section">
      <h2 class="inventory__section-title">Рыба</h2>
      <div v-if="!fish.length" class="inventory__empty">
        Нет рыбы
      </div>
      <div v-else v-for="(fishItem, i) in fish" :key="i" class="inventory__item">
        <div>
          {{ fishItem.name }} {{ fishItem.size }}г - 
          {{ Math.round(fishItem.price * (fishItem.size / 1000)) }}
        </div>
        <button 
          class="inventory__button"
          @click="() => sellFish(i)"
        >
          Продать
        </button>
      </div>
      <button 
        v-if="fish.length" 
        class="inventory__button inventory__button--full"
        @click="() => sellAllFish()"
      >
        Продать всё ({{ totalFishPrice }})
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'InventoryPage',
  computed: {
    ...mapGetters('inventory', [
      'rods', 
      'baits', 
      'activeRod', 
      'activeBait', 
      'fish', 
      'money',
      'nets',
      'activeNet',
      'groundbaits',
      'activeGroundbait'
    ]),
    totalFishPrice() {
      return this.fish.reduce((sum, fishItem) => {
        return sum + Math.round(fishItem.price * (fishItem.size / 1000))
      }, 0)
    }
  },
  methods: {
    ...mapActions('inventory', [
      'setActiveRod',
      'setActiveBait',
      'sellItem',
      'sellFish',
      'sellAllFish',
      'setActiveNet',
      'setActiveGroundbait'
    ]),
    back() { 
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped lang="scss">
.inventory {
  grid-column: 1 / -1;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 30px;
  &__back {
    position: absolute;
    top: 20px;
    left: 20px;
    font-size: 20px;
    padding: 10px 20px;
    border-radius: 12px;
    background: rgba(0,0,0,0.5);
    color: white;
    cursor: pointer;
    font-weight: bold;
    border: none;
    &:hover {
      background: rgba(0,0,0,0.7);
    }
  }
  &__title {
    text-align: center;
    font-size: 28px;
    font-weight: bold;
  }
  &__money {
    text-align: center;
    font-size: 24px;
    font-weight: bold;
  }
  &__section {
    border: 1px solid #ccc;
    border-radius: 12px;
    padding: 20px;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    &-title {
      font-size: 20px;
      margin: 0 0 16px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid #ccc;
    }
  }
  &__empty {
    text-align: center;
    padding: 20px;
    color: #999;
  }
  &__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
    &:last-child {
      border-bottom: none;
    }
    &-price {
      color: #666;
      font-size: 14px;
    }
    &-count {
      color: #4ecdc4;
      font-size: 12px;
      margin-left: 5px;
      font-weight: bold;
    }
    &-actions {
      display: flex;
      gap: 8px;
    }
  }
  &__button {
    padding: 4px 8px;
    border: 1px solid #999;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    font-size: 14px;
    &:hover:not(:disabled) {
      background: #f0f0f0;
    }
    &:disabled {
      opacity: 0.5;
      cursor: default;
    }
    &--full {
      width: 100%;
      margin-top: 12px;
      padding: 8px;
    }
  }
}
</style>
