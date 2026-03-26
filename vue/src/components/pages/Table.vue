<template>
  <div class="table-block">
    <div class="table-block__list">
      <div class="table-block__item" v-for="item in tableElements" :key="item.id">
        <span class="table-block__name">{{ getElementName(item.id) }}</span>
        <div class="table-block__counter">
          <button class="table-block__button" @click="() => decreaseFromTable(item.id)">−</button>
          <span class="table-block__count">{{ item.count }}</span>
          <button class="table-block__button" @click="() => addToTable(item.id)">+</button>
        </div>
      </div>
    </div>

    <div class="table-block__actions">
      <button class="table-block__action-button" @click="() => mix()">Смешать</button>
      <button class="table-block__action-button" @click="() => clearTable()">Сбросить</button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'AlchemistTable',

  computed: {
    ...mapGetters(['tableElements', 'getElementById']),

    getElementName() {
      return id => this.getElementById(id).name
    }
  },

  methods: {
    ...mapActions(['addToTable', 'decreaseFromTable', 'clearTable', 'mix'])
  }
}
</script>

<style scoped lang="scss">
.table-block {
  flex: 2;
  display: flex;
  border-top: 3px solid #770059;

  &__list {
    flex: 3;
    padding: 10px;
    min-width: 200px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__name {
    font-weight: 500;
  }

  &__counter {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__count {
    min-width: 20px;
    text-align: center;
    font-weight: bold;
  }

  &__button {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    border: 2px solid #b543b9;
    background: white;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  &__actions {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 10px;
    padding: 10px;
    margin-left: 40px;
    border-left: 3px solid #770059;
    padding-left: 30px;
  }

  &__action-button {
    border-radius: 12px;
    padding: 10px;
    font-size: 16px;
    border: 2px solid rgb(181, 67, 185);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: #b543b9;
      color: white;
      transform: scale(1.05);
    }
  }
}
</style>