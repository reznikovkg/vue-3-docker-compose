<template>
  <div class="bite-indicator">
    <div v-if="lastCatch" class="bite-indicator__catch">
      Поймано: {{ lastCatch }}
    </div>

    <div v-if="catchHistory.length > 0" class="bite-indicator__history">
      <div class="bite-indicator__title">История улова:</div>

      <div class="bite-indicator__list">
        <div
          v-for="(item, index) in catchHistory"
          :key="index"
          class="bite-indicator__item"
        >
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
      default() {
        return []
      }
    }
  }
}
</script>

<style scoped>
.bite-indicator__catch {
  margin-bottom: 10px;
  padding: 8px;
  border: 1px solid #000000;
  background: #e8e8e8;
  text-align: center;
}

.bite-indicator__history {
  padding: 10px;
  border: 1px solid #000000;
  background: #f8f8f8;
}

.bite-indicator__title {
  margin-bottom: 6px;
  font-weight: bold;
}

.bite-indicator__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bite-indicator__item {
  padding-bottom: 4px;
  border-bottom: 1px dotted #bbbbbb;
  font-size: 14px;
}

.bite-indicator__item:last-child {
  border-bottom: none;
}
</style>