<template>
  <div>
    <div class="bite-indicator__catch" v-if="lastCatch">
      Поймано: {{ lastCatch }}
    </div>

    <div class="bite-indicator__history" v-if="catchHistory.length > 0">
      <div class="bite-indicator__history-title">История улова:</div>
      <div class="bite-indicator__history-list">
        <div v-for="(item, idx) in catchHistory" :key="idx" class="bite-indicator__history-item">
          {{ item }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BiteIndicator',
  props: {
    lastCatch: {
      type: String,
      default: ''
    },
    catchHistory: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>
.bite-indicator__catch {
  border: 1px solid black;
  padding: 5px;
  text-align: center;
  background: #e0e0e0;
  margin-bottom: 10px;
}

.bite-indicator__history {
  border: 1px solid black;
  padding: 10px;
  background: #f9f9f9;
}

.bite-indicator__history-title {
  font-weight: bold;
  margin-bottom: 5px;
  font-size: 14px;
}

.bite-indicator__history-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.bite-indicator__history-item {
  font-size: 12px;
  padding: 2px 0;
  border-bottom: 1px dotted #ccc;
}

.bite-indicator__history-item:last-child {
  border-bottom: none;
}
</style>