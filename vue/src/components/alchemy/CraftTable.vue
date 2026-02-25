<template>
  <div class="table">
    <div class="table__items">
      <div
        v-for="(count, name) in table"
        :key="name"
        class="table__item"
        @click="() => add(name)"
      >
        <span class="table__name">{{ name }}</span>
        <span class="table__count">x{{ count }}</span>
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
    table() { return this.tableElements }
  },
  methods: {
    ...mapActions(['addToTable', 'clearTable', 'mix']),
    add(name) { this.addToTable(name) },
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
}

.table__items {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  background: #f0f0f0;
  border-radius: 12px;
  padding: 10px;
  overflow-y: auto;
}

.table__item {
  flex: 0 1 80px;
  background: #fff;
  border-radius: 12px;
  padding: 10px;
  cursor: pointer;
  text-align: center;
}

.table__buttons {
  width: 150px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reset { background: #ff6b6b; color: white; }
.mix { background: #4ecdc4; color: white; }
</style>