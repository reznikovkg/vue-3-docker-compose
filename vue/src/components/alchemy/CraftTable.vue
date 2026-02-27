<template>
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
      <button class="reset" @click="() => clear()">Сброс</button>
      <button class="mix" @click="() => mix()">Смешать</button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'CraftTable',
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
        lava: '🌋'
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
    clear() { this.clearTable() }
  }
}
</script>

<style scoped>
.table {
  flex: 2;
  display: flex;
  gap: 10px;
  padding: 10px;
  box-sizing: border-box;
  overflow: hidden;
  width: 100%;
}

.table__items {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  background: linear-gradient(135deg, #fafafa, #e6e6e6);
  border-radius: 16px;
  padding: 10px;
  box-shadow: inset 0 0 8px rgba(0,0,0,0.05), 0 3px 10px rgba(0,0,0,0.15);
  overflow-y: auto;
  box-sizing: border-box;
  align-content: flex-start;
}

.table__item {
  position: relative;
  flex: 0 1 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 12px;
  padding: 10px;
  cursor: default;
  box-shadow: 0 2px 5px rgba(0,0,0,0.15);
  text-align: center;
  transition: 0.2s;
}

.table__item:hover {
  transform: translateY(-3px);
}

.table__remove {
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
}

.table__remove:hover {
  transform: scale(1.1);
}

.table__icon {
  font-size: 28px;
  margin-bottom: 4px;
}

.table__name {
  font-weight: bold;
  font-size: 14px;
}

.table__count {
  font-size: 12px;
  color: #555;
  margin-top: 2px;
}

.table__controls {
  display: flex;
  gap: 5px;
  margin-top: 6px;
}

.table__controls button {
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.2s;
}

.table__controls button:hover {
  background: #e0e0e0;
}

.table__buttons {
  width: 150px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
}

.table__buttons button {
  flex: 1;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  cursor: pointer;
  transition: 0.2s;
  font-weight: bold;
}

.reset { background: #ff6b6b; color: white; }
.mix { background: #4ecdc4; color: white; }

.table__buttons button:hover { 
  transform: scale(1.02);
  filter: brightness(1.1);
}

@media (max-width: 600px) {
  .table { flex-direction: column; }
  .table__buttons { flex-direction: row; width: 100%; min-height: 60px; }
  .table__item { flex: 0 1 60px; font-size: 14px; padding: 8px; }
}
</style>
