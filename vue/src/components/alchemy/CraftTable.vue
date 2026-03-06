<template>
  <div class="table-wrapper">
    <transition name="craft">
      <div v-if="craftVisible" class="craft-container">
        <div class="craft-slot-wrapper">
          <SlotCraft />
        </div>
      </div>
    </transition>

    <div class="table">
      <div class="table__items">
        <div
          v-for="(count, name) in table"
          :key="name"
          class="table__item"
        >
          <button
            class="table__remove"
            @click.stop="() => removeAll(name)"
          >
            ✕
          </button>

          <span class="table__icon">{{ icons[name] || '✨' }}</span>
          <span class="table__name">{{ name }}</span>
          <span class="table__count">x{{ count }}</span>

          <div class="table__controls">
            <button @click="() => decrease(name)">−</button>
            <button @click="() => add(name)">+</button>
          </div>
        </div>
      </div>

      <div class="table__buttons">
        <button 
          class="craft-toggle" 
          :class="{ active: craftVisible }"
          @click="() => toggleCraft()"
        >
          <span class="craft-icon">⚗️</span>
          <span class="craft-text">{{ craftVisible ? 'Скрыть' : 'Крафт' }}</span>
        </button>
        
        <button class="reset" @click="() => clear()">Сброс</button>
        <button class="mix" @click="() => mix()">Смешать</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
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
    icons() {
      return {
        fire: '🔥',
        water: '💧',
        earth: '🌍',
        air: '🌪',
        steam: '☁️',
        mud: '🟫',
        lava: '🌋',
        dust: '🌫',
        metal: '⚙️',
        plant: '🌿',
        energy: '⚡',
        ice: '❄️',
        cloud: '☁️',
        sand: '🏜',
        crystal: '💎',
        metallic_lava: '🌋⚙️',
        snow: '❄️☁️'
      }
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

    add(name) { this.addToTable(name) },
    decrease(name) { this.decreaseFromTable(name) },
    removeAll(name) { this.removeElementCompletely(name) },
    clear() { this.clearTable() },
    toggleCraft() { this.craftVisible = !this.craftVisible}
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

    .craft-icon {
      font-size: 24px;
    }

    .craft-text {
      font-size: 14px;
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

  .craft-slot-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }
}

.craft-enter-active,
.craft-leave-active {
  transition: all 0.3s ease;
}

.craft-enter-from {
  opacity: 0;
  transform: translateX(-20px);
  width: 0;
  padding-left: 0;
  padding-right: 0;
  margin-right: 0;
}

.craft-leave-to {
  opacity: 0;
  transform: translateX(-20px);
  width: 0;
  padding-left: 0;
  padding-right: 0;
  margin-right: 0;
}

@media (max-width: 600px) {
  .table-wrapper {
    flex-direction: column;
    align-items: stretch;
    overflow: auto;
  }

  .table {
    flex-direction: column;
    width: 100%;
    height: auto;
    min-height: 300px;

    &__items {
      max-height: 250px;
      width: 100%;
      height: 250px;
    }

    &__buttons {
      flex-direction: row;
      width: 100%;
      min-height: 60px;
    }

    .craft-toggle {
      flex-direction: row;
      padding: 8px;
      
      .craft-icon {
        font-size: 20px;
      }
      
      .craft-text {
        font-size: 12px;
      }
    }

    &__item {
      flex: 0 1 60px;
      font-size: 14px;
      padding: 8px;
    }
  }

  .craft-container {
    width: 100%;
    margin: 0 0 10px 0;
    align-self: stretch;
    padding: 10px;
  }

  .craft-enter-from,
  .craft-leave-to {
    transform: translateY(-20px);
    width: 100%;
    height: 0;
    padding-top: 0;
    padding-bottom: 0;
    margin-bottom: 0;
  }
}
</style>
