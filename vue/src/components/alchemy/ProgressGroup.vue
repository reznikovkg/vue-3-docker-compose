<template>
  <div class="progress-group">
    <h3 class="progress-group__title">{{ title }}</h3>
    <div v-for="item in items" :key="item.id" class="progress-item">
      <div class="progress-item__info">
        <span>{{ item.icon }} {{ item.name }}</span>
        <span>👷 {{ item.workers }}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-bar__fill" :style="{ width: item.progress + '%' }"></div>
      </div>
      <div class="progress-item__time">{{ formatTime(getRemainingTime(item)) }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProgressGroup',
  props: {
    title: String,
    items: Array
  },
  methods: {
    getRemainingTime(job) {
      if (!job) return 0
      const remaining = (100 - job.progress) / 100 * job.totalTime / (job.workers || 1)
      return Math.ceil(remaining)
    },
    formatTime(s) {
      return s < 60 ? `${s}с` : `${Math.floor(s / 60)}м ${s % 60}с`
    }
  }
}
</script>

<style scoped lang="scss">
.progress-group {
  margin-bottom: 20px;

  &__title {
    margin: 0 0 10px;
    font-size: 16px;
    border-bottom: 1px solid rgba(255,255,255,0.2);
    padding-bottom: 5px;
  }
}

.progress-item {
  margin-bottom: 10px;
  background: rgba(0,0,0,0.2);
  border-radius: 8px;
  padding: 10px;

  &__info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 12px;
  }

  &__time {
    font-size: 11px;
    color: #bdc3c7;
    margin-top: 5px;
    text-align: right;
  }
}

.progress-bar {
  height: 8px;
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
  overflow: hidden;
  
  &__fill {
    height: 100%;
    background: linear-gradient(90deg, #3498db, #9b59b6);
    transition: width 0.3s;
  }
}
</style>