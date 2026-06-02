<template>
  <div class="table">
    <div class="table__items">
      <p v-if="isEmpty" class="table__hint">
        Нажимайте на стихии сверху, чтобы перенести их на стол
      </p>

      <div
        v-for="(count, key) in tableElements"
        :key="key"
        class="table__item"
        :class="{ 'table__item--selected': key === selectedElement }"
        @click="selectElement(key)"
      >
        <button class="table__remove" @click.stop="removeFromTable(key)">✕</button>
        <span class="table__icon">{{ getElement(key).icon }}</span>
        <span class="table__name">{{ getElement(key).name }}</span>

        <div class="table__counter">
          <button @click.stop="decreaseFromTable(key)">−</button>
          <span class="table__count">{{ count }}</span>
          <button @click.stop="addToTable(key)">+</button>
        </div>
      </div>
    </div>

    <div class="table__actions">
      <button class="table__button table__button--reset" @click="clearTable">Сбросить</button>
      <button class="table__button table__button--mix" @click="mix">Смешать</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useStore } from "vuex"

const store = useStore()
const tableElements = computed(() => store.getters.tableElements)
const getElement = computed(() => store.getters.getElement)
const selectedElement = computed(() => store.getters.selectedElement)
const isEmpty = computed(() => Object.keys(tableElements.value).length === 0)

const addToTable = (key) => store.dispatch("addToTable", key)
const decreaseFromTable = (key) => store.dispatch("decreaseFromTable", key)
const removeFromTable = (key) => store.dispatch("removeFromTable", key)
const clearTable = () => store.dispatch("clearTable")
const mix = () => store.dispatch("mix")
const selectElement = (key) => store.dispatch("selectElement", key)
</script>

<style scoped lang="less">
.table {
  flex: 1;
  display: flex;
  gap: 10px;
  padding: 10px;

  &__items {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: 10px;
    padding: 10px;
    background: #fffdf7;
    border: 1px solid #e6dcc6;
    border-radius: 14px;
    overflow-y: auto;
  }

  &__hint {
    margin: auto;
    color: #9b8a72;
    font-size: 15px;
  }

  &__item {
    position: relative;
    width: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
    background: #fff;
    border: 1px solid #ece3d2;
    border-radius: 12px;
    cursor: pointer;

    &--selected {
      border-color: #6b8e5a;
      box-shadow: 0 0 0 2px #6b8e5a;
    }
  }

  &__remove {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 20px;
    height: 20px;
    border: none;
    border-radius: 50%;
    background: #c25b4a;
    color: #fff;
    font-size: 12px;
    cursor: pointer;
  }

  &__icon {
    font-size: 28px;
  }

  &__name {
    font-size: 14px;
    font-weight: bold;
    color: #5a4632;
  }

  &__counter {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 6px;

    button {
      width: 24px;
      height: 24px;
      border: none;
      border-radius: 6px;
      background: #e6dcc6;
      cursor: pointer;
      font-weight: bold;
    }
  }

  &__count {
    min-width: 18px;
    text-align: center;
    font-weight: bold;
  }

  &__actions {
    width: 140px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__button {
    flex: 1;
    border: none;
    border-radius: 12px;
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;

    &--reset {
      background: #c25b4a;
    }

    &--mix {
      background: #6b8e5a;
    }
  }
}

@media (max-width: 600px) {
  .table {
    flex-direction: column;

    &__actions {
      flex-direction: row;
      width: 100%;
    }

    &__item {
      width: 80px;
    }
  }
}
</style>
