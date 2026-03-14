<template>
  <button class="shop__back" @click.stop="() => back()">Назад</button>
  <div class="shop">
    <h1 class="shop__title">Магазин</h1>
    
    <div class="shop__money">
      Деньги: {{ money }}
    </div>
    
    <div class="shop__grid">
      <div
        v-for="item in shopItems"
        :key="item.id"
        class="shop__card"
      >
        <div class="shop__card-info">
          {{ item.name }} - {{ item.price }}
        </div>
        
        <button
          v-if="!hasItem(item)"
          class="shop__button"
          @click="() => buy(item)"
        >
          Купить
        </button>
        
        <span v-else class="shop__bought">
          Куплено
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { items } from '@/config/items'

export default {
  name: 'ShopPage',

  computed: {
    ...mapGetters('inventory', [
      'money',
      'items'
    ]),

    shopItems() {
      return items
    },

    inventoryItems() {
      return this.items
    }
  },

  methods: {
    ...mapActions('inventory', [
      'buyItem'
    ]),

    hasItem(item) {
      return this.inventoryItems.some(i => i.id === item.id)
    },

    buy(item) {
      this.buyItem(item)
    },
    
    back() {
      this.$router.push({ name: this.$routes.INDEX })
    }
  }
}
</script>

<style scoped lang="scss">
.shop {
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

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
    justify-items: center;
    width: 100%;
  }

  &__card {
    width: 100%;
    max-width: 400px;
    border: 1px solid #ccc;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  &__button {
    padding: 10px;
    border: 1px solid #999;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    font-size: 16px;

    &:hover {
      background: #f0f0f0;
    }
  }

  &__bought {
    padding: 10px;
    text-align: center;
    border: 1px solid #999;
    border-radius: 8px;
    background: #f5f5f5;
    color: #666;
  }
}
</style>