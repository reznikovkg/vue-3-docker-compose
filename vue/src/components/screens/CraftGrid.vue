<template>
  <div class="craft">
    <div class="craft__head">
      <span class="craft__title">Крафт 3×3</span>
      <button class="craft__toggle" @click="showBook = !showBook">
        {{ showBook ? "Скрыть" : `Рецепты (${recipeCount})` }}
      </button>
    </div>

    <p class="craft__hint">Выберите материал на столе и кликайте по слотам</p>

    <div class="craft__grid">
      <div
        v-for="(key, index) in slots"
        :key="index"
        class="craft__slot"
        :class="{ 'craft__slot--filled': !!key }"
        :title="key ? getElement(key).name : 'Пустой слот'"
        @click="placeInSlot(index)"
      >
        {{ key ? getElement(key).icon : "" }}
      </div>
    </div>

    <div class="craft__actions">
      <button
        class="craft__button craft__button--clear"
        :disabled="isEmpty"
        @click="clearSlots"
      >
        Очистить
      </button>
      <button
        class="craft__button craft__button--craft"
        :disabled="isEmpty"
        @click="craft"
      >
        Скрафтить
      </button>
    </div>

    <div v-if="showBook" class="craft__book">
      <div v-for="recipe in craftRecipes" :key="recipe.result" class="craft__recipe">
        <div class="craft__mini">
          <div
            v-for="(key, index) in recipe.pattern"
            :key="index"
            class="craft__mini-cell"
            :class="{ 'craft__mini-cell--filled': !!key }"
          >
            {{ key ? getElement(key).icon : "" }}
          </div>
        </div>
        <span class="craft__arrow">→</span>
        <span class="craft__result">
          {{ getElement(recipe.result).icon }} {{ getElement(recipe.result).name }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { useStore } from "vuex"

const store = useStore()
const slots = computed(() => store.getters.craftSlots)
const getElement = computed(() => store.getters.getElement)
const craftRecipes = computed(() => store.getters.craftRecipes)

const showBook = ref(false)

const isEmpty = computed(() => slots.value.every((s) => !s))
const recipeCount = computed(() => craftRecipes.value.length)

const placeInSlot = (index) => store.dispatch("placeInSlot", index)
const clearSlots = () => store.dispatch("clearSlots")
const craft = () => store.dispatch("craft")
</script>

<style scoped lang="less">
.craft {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background: #f8faf3;
  border: 1px solid #cdd6bd;
  border-radius: 14px;
  overflow-y: auto;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    font-weight: bold;
    color: #38422c;
  }

  &__toggle {
    border: none;
    background: #dde6cc;
    color: #38422c;
    border-radius: 8px;
    padding: 4px 10px;
    cursor: pointer;
    font-size: 13px;
    transition: background 0.2s ease;

    &:hover {
      background: #cfdcb9;
    }
  }

  &__hint {
    margin: 0;
    font-size: 12px;
    color: #7b8768;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 56px);
    grid-template-rows: repeat(3, 56px);
    gap: 6px;
    justify-content: center;
  }

  &__slot {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #eef2e6;
    border: 2px dashed #a8b596;
    border-radius: 10px;
    font-size: 28px;
    cursor: pointer;
    transition: border-color 0.15s ease, transform 0.15s ease, background 0.15s ease;

    &:hover {
      border-color: #5c7a48;
      transform: translateY(-1px);
    }

    &--filled {
      border-style: solid;
      background: #e4ebd6;
    }
  }

  &__actions {
    display: flex;
    gap: 8px;
  }

  &__button {
    flex: 1;
    border: none;
    border-radius: 12px;
    padding: 8px;
    color: #fff;
    font-weight: bold;
    cursor: pointer;
    transition: opacity 0.15s ease, transform 0.15s ease;

    &:not(:disabled):hover {
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    &--clear {
      background: #b95a4d;
    }

    &--craft {
      background: #5c7a48;
    }
  }

  &__book {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 4px;
    border-top: 1px solid #cdd6bd;
  }

  &__recipe {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__mini {
    display: grid;
    grid-template-columns: repeat(3, 16px);
    grid-template-rows: repeat(3, 16px);
    gap: 2px;
  }

  &__mini-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #eef2e6;
    border-radius: 3px;
    font-size: 11px;

    &--filled {
      background: #dde6cc;
    }
  }

  &__arrow {
    color: #7b8768;
  }

  &__result {
    font-size: 14px;
    font-weight: bold;
    color: #38422c;
  }
}
</style>