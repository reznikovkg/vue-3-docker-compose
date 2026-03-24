<template>
  <div class="workers-group">
    <h4 class="workers-group__title">{{ title }}</h4>
    <div class="workers-group__list">
      <div v-for="item in items" :key="item.id" class="worker-item">
        <span class="worker-item__info">
          {{ item.icon }} {{ item.name }}: {{ item.count }}
        </span>
        <div class="worker-item__controls">
          <button @click="() => $emit('decrement', item.id)" :disabled="item.count === 0">−</button>
          <span class="worker-item__count">{{ item.count }}</span>
          <button @click="() => $emit('increment', item.id)" :disabled="workersFree === 0">+</button>
        </div>
      </div>
      <div v-if="showEmpty && !items.length" class="workers-group__empty">
        {{ emptyText }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WorkersGroup',
  props: {
    title: String,
    items: Array,
    showEmpty: Boolean,
    emptyText: String,
    workersFree: Number
  }
}
</script>

<style scoped lang="scss">
.workers-group {
  margin-bottom: 15px;
  background: rgba(0,0,0,0.2);
  border-radius: 8px;
  padding: 10px;

  &__title {
    margin: 0 0 8px;
    font-size: 14px;
    color: #bdc3c7;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__empty {
    color: #95a5a6;
    font-style: italic;
    padding: 5px;
    text-align: center;
  }
}

.worker-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: rgba(255,255,255,0.1);
  border-radius: 6px;
  font-size: 13px;

  &__info {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 8px;
  }

  &__controls {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-shrink: 0;

    button {
      width: 24px;
      height: 24px;
      border: none;
      border-radius: 4px;
      background: #3498db;
      color: white;
      cursor: pointer;
      font-weight: bold;

      &:disabled {
        opacity: 0.3; 
        cursor: not-allowed; 
      }

      &:hover:not(:disabled) {
        background: #2980b9; 
      }
    }
  }

  &__count {
    min-width: 24px;
    text-align: center;
    font-weight: bold;
  }
}
</style>