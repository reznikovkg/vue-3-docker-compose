<template>
  <div class="bottom">
    <div class="table">
      <div class="table-item" v-for="item in tableElem" :key="item.id">
        <span>{{ getElementName(item.id) }}</span>

        <div class="counter">
          <button @click="change(item.id, -1)">−</button>
          <span class="count">{{ item.count }}</span>
          <button @click="change(item.id, 1)">+</button>
        </div>
      </div>
    </div>

    <div class="buttons">
      <button @click="mix">Смешать</button>
      <button @click="reset">Сбросить</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AlchemistTable',

  props: {
    tableElem: {
      type: Array,
      required: true
    },
    getElementName: {
      type: Function,
      required: true
    }
  },

  emits: ['change', 'mix', 'reset'],

  methods: {
    change(id, value) {
      this.$emit('change', id, value)
    },
    mix() {
      this.$emit('mix')
    },
    reset() {
      this.$emit('reset')
    }
  }
}
</script>

<style scoped lang="scss">
.bottom {
  flex: 2;
  display: flex;
  border-top: 1px solid #770059;
}

.table {
  flex: 3;
  padding: 10px;
}

.buttons {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  padding: 10px;
}

.table-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.counter {
  display: flex;
  align-items: center;
  gap: 8px;
}

.counter button {
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

.count {
  min-width: 20px;
  text-align: center;
  font-weight: bold;
}

button {
  border-radius: 12px;
  padding: 10px;
  font-size: 16px;
  border: 2px solid rgb(181, 67, 185);
  cursor: pointer;
}

.buttons button {
  transition: all 0.2s ease;
}

.buttons button:hover {
  background-color: #b543b9;
  color: white;
  transform: scale(1.05);
}
</style>