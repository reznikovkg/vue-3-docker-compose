<template>
  <div class="economy-panel">
    <div class="economy-panel__workers">
      <h3>Рабочие</h3>
      <div class="economy-panel__stats">
        <span>Всего: {{ totalWorkers }}</span>
        <span>Свободно: {{ freeWorkers }}</span>
      </div>
      
      <div v-if="Object.keys(assignedWorkers).length" class="economy-panel__assigned">
        <h4>Заняты:</h4>
        <div v-for="(count, resourceId) in assignedWorkers" :key="resourceId">
          {{ getResourceName(resourceId) }}: {{ count }}
        </div>
      </div>
    </div>
    
    <div v-if="miningProcesses.length" class="economy-panel__processes">
      <h3>Добыча</h3>
      <div v-for="process in miningProcesses" :key="process.id" class="economy-panel__process">
        <div>{{ getResourceName(process.resourceId) }} (ур. {{ getResourceLevel(process.resourceId) }})</div>
        <div>Рабочих: {{ process.workers }}</div>
        <div class="economy-panel__progress">
          <div class="economy-panel__progress-bar" :style="{ width: process.progress + '%' }"></div>
          <span>{{ Math.floor(process.progress) }}%</span>
        </div>
        <div>Осталось: {{ Math.floor(Math.max(0, (process.totalTime * 1000 - process.progressScore)/process.lastProgressAdd)/10) + 1 }}с</div>
        <div 
          class="economy-panel__cancel-button"
          @click="() => cancelMining(process.id)"
        >Отмена</div>
      </div>
    </div>
    
    <div v-if="craftingProcesses.length" class="economy-panel__processes">
      <h3>Крафт</h3>
      <div v-for="process in craftingProcesses" :key="process.id" class="economy-panel__process">
        <div>Создание (ур. {{ process.outputLevel }})</div>
        <div> {{ process.output.name }} </div>
        <div>Рабочих: {{ process.workers }}</div>
        <div class="economy-panel__progress">
          <div class="economy-panel__progress-bar" :style="{ width: process.progress + '%' }"></div>
          <span>{{ Math.floor(process.progress) }}%</span>
        </div>
        <div>Осталось: {{ Math.floor(Math.max(0, (process.totalTime * 1000 - process.progressScore)/process.lastProgressAdd)/10) + 1 }}с</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { getElementById } from '../data/alchemyData'

const store = useStore()

const totalWorkers = computed(() => store.getters['alchemy/totalWorkers'])
const freeWorkers = computed(() => store.getters['alchemy/freeWorkers'])
const assignedWorkers = computed(() => store.getters['alchemy/assignedWorkers'])
const miningProcesses = computed(() => store.getters['alchemy/miningProcesses'])
const craftingProcesses = computed(() => store.getters['alchemy/craftingProcesses'])

const getResourceName = (id) => {
  if (id === 'crafting') return 'Крафт'
  if (id === 'craft3x3') return 'Сложный крафт'
  const element = getElementById(id)
  return element ? element.name : id
}

const getResourceLevel = (id) => {
  const element = getElementById(id)
  return element ? element.level : 1
}

const cancelMining = (id) => {
  store.dispatch('alchemy/cancelMining', id)
}
</script>

<style scoped lang="scss">
.economy-panel {
  background: #1e293b;
  border: 1px solid #4a5568;
  padding: 10px;
  margin-bottom: 10px;
  width: 250px;
  height: 400px;
  max-height: 400px;
  overflow-y: auto;
  
  h3 {
    color: #fbbf24;
    font-size: 16px;
  }
  
  h4 {
    color: #94a3b8;
    font-size: 14px;
  }
  
  &__stats {
    display: flex;
    gap: 20px;
    margin-bottom: 10px;
  }
  
  &__assigned {
    margin-bottom: 10px;
  }
  
  &__processes {
    margin-top: 15px;
  }
  
  &__process {
    background: #2d3748;
    border: 1px solid #4a5568;
    padding: 8px;
    margin-bottom: 8px;
    font-size: 12px;
  }
  
  &__progress {
    height: 20px;
    background: #1e293b;
    border: 1px solid #4a5568;
    margin: 5px 0;
    position: relative;
    
    &-bar {
      height: 100%;
      background: #10b981;
      transition: width 0.1s;
    }
    
    span {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      color: white;
      font-size: 11px;
      line-height: 20px;
    }
  }

  &__cancel-button {
    width: 100%;
    padding: 6px 0;
    background: #fbbf24;
    text-align: center;
    font-size: 11px;
    font-weight: bold;
    cursor: pointer;
    color: #1e293b;
    
    &:hover {
      background: #f59e0b;
    }
  }
}
</style>