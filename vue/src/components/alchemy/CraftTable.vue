<template>
  <div class="table-wrapper">
    <transition name="craft">
      <div v-if="craftVisible" class="craft-container">
        <div class="craft-container__wrapper">
          <SlotCraft />
        </div>
      </div>
    </transition>

    <div class="table">
      <div class="table__items">
        <div
          v-for="(count, id) in table"
          :key="id"
          class="table__item"
        >
          <button
            class="table__remove"
            @click.stop="() => removeAll(id)"
          >
            ✕
          </button>

          <span class="table__icon">{{elements[id].icon}}</span>
          <span class="table__name">{{elements[id].name}}</span>
          <span class="table__count">x{{ count }}</span>

          <div class="table__controls">
            <button @click="() => decrease(id)">−</button>
            <button @click="() => add(id)">+</button>
          </div>
        </div>
      </div>

      <div class="table__buttons">
        <button 
          class="craft-toggle" 
          :class="{ active: craftVisible }"
          @click="() => toggleCraft()"
        >
          <span class="craft-toggle__icon">⚗️</span>
          <span class="craft-toggle__text">{{ craftVisible ? 'Скрыть' : 'Крафт' }}</span>
        </button>
        
        <button class="reset" @click="() => clear()">Сброс</button>
        <button class="mix" @click="() => mix()">Смешать</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { ELEMENTS } from '../../config/elements'
import SlotCraft from './SlotCraft.vue'

export default {
  name: 'CraftTable',

  components: {
    SlotCraft
  },

  data() {
    return {
      craftVisible: false
    }
  },

  computed: {
    ...mapGetters(['tableElements']),
    table() { return this.tableElements },
    elements(){
      return ELEMENTS
    }
  },
  
  methods: {
    ...mapActions([
      'addToTable',
      'decreaseFromTable',
      'removeElementCompletely',
      'clearTable',
      'mix'
    ]),

    add(id){
      this.addToTable(id)
    },

    decrease(id){
      this.decreaseFromTable(id)
    },

    removeAll(id){
      this.removeElementCompletely(id)
    },

    clear(){
      this.clearTable()
    },

    toggleCraft(){
      this.craftVisible=!this.craftVisible
    }

  }
}
</script>

<style scoped lang="scss">
.table-wrapper {
  flex: 3;
  display: flex;
  gap: 10px;
  padding: 10px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  position: relative;
  align-items: stretch;
  background: transparent;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    overflow: auto;
  }
}

.table {
  flex: 1;
  display: flex;
  gap: 10px;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
  background: transparent;
  border-radius: 16px;
  align-self: stretch;
  height: 100%;

  &__items {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    background: linear-gradient(135deg, #fafafa, #e6e6e6);
    border-radius: 16px;
    padding: 10px;
    box-shadow:
      inset 0 0 8px rgba(0,0,0,0.05),
      0 3px 10px rgba(0,0,0,0.15);
    overflow-y: auto;
    box-sizing: border-box;
    align-content: flex-start;
    height: 100%;
    max-height: 100%;

    @media (max-width: 600px) {
      max-height: 250px;
      width: 100%;
      height: 250px;
    }
  }

  &__item {
    position: relative;
    flex: 0 1 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #fff;
    border-radius: 12px;
    padding: 10px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.15);
    text-align: center;
    transition: 0.2s;
    overflow: visible;

    &:hover {
      transform: translateY(-3px);
    }

    @media (max-width: 600px) {
      flex: 0 1 60px;
      font-size: 14px;
      padding: 8px;
    }
  }

  &__remove {
    position: absolute;
    top: 6px;
    right: 6px;
    border: none;
    background: #ff6b6b;
    color: white;
    font-size: 12px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    cursor: pointer;
    transition: 0.2s;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    line-height: 1;

    &:hover {
      transform: scale(1.1);
    }
  }

  &__icon {
    font-size: 28px;
    margin-bottom: 4px;
  }

  &__name {
    font-weight: bold;
    font-size: 14px;
  }

  &__count {
    font-size: 12px;
    color: #555;
    margin-top: 2px;
  }

  &__controls {
    display: flex;
    gap: 5px;
    margin-top: 6px;

    button {
      border: none;
      width: 24px;
      height: 24px;
     
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
      transition: 0.2s;

      &:hover {
        background: #e0e0e0;
      }
    }
  }

  &__buttons {
    width: 150px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex-shrink: 0;
  }

  .reset,
  .mix {
    flex: 1;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    cursor: pointer;
    transition: 0.2s;
    font-weight: bold;

    &:hover {
      transform: scale(1.02);
      filter: brightness(1.1);
    }
  }

  .reset {
    background: #ff6b6b;
    color: white;
  }

  .mix {
    background: #4ecdc4;
    color: white;
  }

  @media (max-width: 600px) {
      flex-direction: row;
      width: 100%;
      min-height: 60px;
  }
}

.craft-toggle {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    background: linear-gradient(135deg, #9b59b6, #8e44ad);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 10px;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: bold;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(142, 68, 173, 0.4);
    }

    &.active {
      background: linear-gradient(135deg, #8e44ad, #7d3c98);
      box-shadow: inset 0 2px 5px rgba(0,0,0,0.2);
    }

    &__icon {
      font-size: 24px;
    }

    &__text {
      font-size: 14px;
    }

    @media (max-width: 600px) {
      flex-direction: row;
      padding: 8px;

      &__icon {
        font-size: 20px;
      }

      &__text {
        font-size: 12px;
      }
    }
  }
  
.craft-container {
  width: 300px;
  background: white;
  border-radius: 16px;
  padding: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 0;
  z-index: 100;
  position: relative;
  overflow: visible;
  display: flex;
  flex-direction: column;
  min-height: 200px;

  &_wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  @media (max-width: 600px) {
    width: 100%;
    margin: 0 0 10px 0;
    align-self: stretch;
    padding: 10px;
  }
}

.craft-animate {
  &-enter-active,
  &-leave-active {
    transition: all 0.3s ease;
  }

  &-enter-from {
    opacity: 0;
    transform: translateX(-20px);
    width: 0;
    padding-left: 0;
    padding-right: 0;
    margin-right: 0;
  }

  &-leave-to {
    opacity: 0;
    transform: translateX(-20px);
    width: 0;
    padding-left: 0;
    padding-right: 0;
    margin-right: 0;
  }
}
</style>
