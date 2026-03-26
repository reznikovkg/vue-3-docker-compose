<template>
  <div class="workers">
    <div class="workers__info">
      Рабочие {{ freeWorkers.length }}/{{ workers.length }}
    </div>
    <div class="workers__tasks-wrapper">
      <div class="workers__tasks">
        <div
          v-for="worker in busyWorkers"
          :key="worker.id"
          class="workers__task"
        >
          <div class="workers__task-content">
            <div class="workers__label">
              {{ getTaskName(worker) }}
            </div>

            <div class="workers__details">
              <span class="workers__level" v-if="getElementLevel(worker)">
                Ур. {{ getElementLevel(worker) }}
              </span>
              <span class="workers__time">
                {{ getRemainingTime(worker) }}с
              </span>
            </div>

            <div class="workers__progress">
              <div
                class="workers__progress-bar"
                :style="{ width: worker.progress + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  computed: {
    ...mapState(['workers']),
    ...mapGetters(['freeWorkers', 'getElementById']),

    busyWorkers() {
      return this.workers.filter(w => w.job)
    }
  },

  methods: {
    getTaskName(worker) {
      if (!worker.job) return ''
      const element = this.getElementById(worker.job.elementId)
      if (worker.job.type === 'mining') {
        return `Добыча: ${element.name}`
      }
      if (worker.job.type === 'craft') {
        return `Крафт: ${element.name}`
      }
      if (worker.job.type === 'mix') {
        return `Микс: ${element.name}`
      }
      return ''
    },

    getElementLevel(worker) {
      if (!worker.job) return null
      const element = this.getElementById(worker.job.elementId)
      return element?.level || null
    },

    getRemainingTime(worker) {
      if (!worker.job || !worker.progress) return '?'
      const element = this.getElementById(worker.job.elementId)
      const totalTime = 5 * Math.pow(3, (element?.level || 1) - 1)
      const remainingProgress = 100 - worker.progress
      const remainingSeconds = (remainingProgress / 100) * totalTime
      return remainingSeconds.toFixed(1)
    }
  }
}
</script>

<style scoped lang="scss">
.workers {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  overflow: hidden;

  &__info {
    font-weight: bold;
    font-size: 14px;
    flex-shrink: 0;
  }

  &__tasks-wrapper {
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
    
    &::-webkit-scrollbar {
      height: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #b543b9;
      border-radius: 3px;
    }
  }

  &__tasks {
    display: flex;
    flex-direction: row;
    gap: 12px;
    min-width: min-content;
  }

  &__task {
    flex: 0 0 auto;
    width: 150px;
    background: rgba(255, 255, 255, 0.041);
    border-radius: 8px;
    padding: 8px 10px;
    border: 1px solid rgba(181, 67, 185, 0.3);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  &__task-content {
    width: 100%;
  }

  &__label {
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 6px;
    white-space: nowrap;
  }

  &__details {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    margin-bottom: 6px;
    color: #666;
  }

  &__level {
    background: #b543b9;
    color: rgb(0, 0, 0);
    padding: 0 6px;
    border-radius: 4px;
    font-size: 10px;
  }

  &__progress {
    width: 100%;
    height: 6px;
    background: #e0e0e0;
    border-radius: 3px;
    overflow: hidden;
  }

  &__progress-bar {
    height: 100%;
    background: #b543b9;
    transition: width 0.1s linear;
  }
}
</style>