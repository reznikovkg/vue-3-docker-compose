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
          <span v-if="item.type === 'groundbait'" class="shop__card-uses">
            ({{ item.uses }} шт.)
          </span>
          <span v-if="item.type === 'net'" class="shop__card-uses">
            (до {{ item.maxWeight }}г)
          </span>
        </div>
        <button
          class="shop__button"
          @click="() => buyItem(item)"
          :disabled="money < item.price"
        >
          Купить
        </button>
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
      'money'
    ]),
    shopItems() {
      return items
    }
  },
  methods: {
    ...mapActions('inventory', [
      'buyItem'
    ]),
    back() {
      this.$router.go(-1)
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
    &-info {
      font-size: 16px;
    }
    &-uses {
      font-size: 12px;
      color: #666;
    }
  }
  &__button {
    padding: 10px;
    border: 1px solid #999;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    font-size: 16px;
    &:hover:not(:disabled) {
      background: #f0f0f0;
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}
</style>