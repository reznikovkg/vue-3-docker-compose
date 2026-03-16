<template>
  <div class="economy-panel">
    <div class="economy-panel__content">
      <div class="workers-section">
        <h3>Рабочие ({{ workers.free }}/{{ workers.total }})</h3>
        <div class="workers-group">
          <h4>Добыча ресурсов</h4>
          <div class="workers-list">
            <div v-for="(count, elementId) in workers.assigned" :key="elementId" class="worker-item">
              <span>{{ elements[elementId]?.icon }} {{ elements[elementId]?.name }}: {{ count }}</span>
              <div class="worker-controls">
                <button @click="unassignWorker(Number(elementId))" :disabled="count === 0">−</button>
                <span class="worker-count">{{ count }}</span>
                <button @click="assignWorker(Number(elementId))" :disabled="workers.free === 0">+</button>
              </div>
            </div>
            <div v-if="Object.keys(workers.assigned).length === 0" class="no-workers">
              Нет рабочих на добыче
            </div>
          </div>
        </div>
        <div class="workers-group" v-if="craftingQueue.length">
          <h4>Крафт в слотах</h4>
          <div class="workers-list">
            <div v-for="(craft, index) in craftingQueue" :key="index" class="worker-item">
              <span>{{ elements[craft.resultId]?.icon }} {{ elements[craft.resultId]?.name }}</span>
              <div class="worker-controls">
                <button @click="() =>unassignWorkerFromSlot(craft.slotIndex)" :disabled="!craft.workers">−</button>
                <span class="worker-count">{{ craft.workers || 0 }}</span>
                <button @click="() =>assignWorkerToSlot(craft.slotIndex)" :disabled="workers.free === 0">+</button>
              </div>
            </div>
          </div>
        </div>
        <div class="workers-group" v-if="tableCrafting">
          <h4>Крафт на столе</h4>
          <div class="worker-item">
            <span>{{ elements[tableCrafting.resultId]?.icon }} {{ elements[tableCrafting.resultId]?.name }}</span>
            <div class="worker-controls">
              <button @click="() =>unassignWorkerFromTable()" :disabled="!tableCrafting.workers">−</button>
              <span class="worker-count">{{ tableCrafting.workers }}</span>
              <button @click="() =>assignWorkerToTable()" :disabled="workers.free === 0">+</button>
            </div>
          </div>
        </div>
      </div>
      <div class="progress-section">
        <div v-if="Object.keys(miningJobs).length" class="progress-group">
          <h3>Добыча</h3>
          <div v-for="(job, elementId) in miningJobs" :key="elementId" class="progress-item">
            <div class="job-info">
              <span>{{ elements[elementId]?.icon }} {{ elements[elementId]?.name }}</span>
              <span>👷 {{ job.workers }}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: job.progress + '%' }"></div>
            </div>
            <div class="time-remaining">{{ formatTime(getRemainingTime(job)) }}</div>
          </div>
        </div>
        <div v-if="craftingQueue.length" class="progress-group">
          <h3>Крафт в слотах</h3>
          <div v-for="(craft, index) in craftingQueue" :key="index" class="progress-item">
            <div class="job-info">
              <span>{{ elements[craft.resultId]?.icon }} {{ elements[craft.resultId]?.name }}</span>
              <span>👷 {{ craft.workers || 0 }}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: craft.progress + '%' }"></div>
            </div>
            <div class="time-remaining">{{ formatTime(getRemainingTime(craft)) }}</div>
          </div>
        </div>
        <div v-if="tableCrafting" class="progress-group">
          <h3>Крафт на столе</h3>
          <div class="progress-item">
            <div class="job-info">
              <span>{{ elements[tableCrafting.resultId]?.icon }} {{ elements[tableCrafting.resultId]?.name }}</span>
              <span>👷 {{ tableCrafting.workers }}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: tableCrafting.progress + '%' }"></div>
            </div>
            <div class="time-remaining">{{ formatTime(getRemainingTime(tableCrafting)) }}</div>
          </div>
        </div>
      </div>
      <div class="inventory">
        <h3>Инвентарь</h3>
        <div class="inventory-grid">
          <div v-for="(count, id) in inventory" :key="id" class="inventory-item">
            <span class="item-icon">{{ elements[id]?.icon }}</span>
            <span class="item-name">{{ elements[id]?.name }}</span>
            <span class="item-count">x{{ count }}</span>
            <button 
              v-if="id <= 4"
              class="mine-btn" 
              @click="() =>assignWorker(Number(id))"
              :disabled="workers.free === 0"
              :title="getMiningTime(Number(id))"
            >
              ⛏️
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { ELEMENTS } from '../../config/elements'

export default {
  name: 'EconomyPanel',
  computed: {
    ...mapGetters([
      'inventory', 
      'workers', 
      'miningJobs', 
      'craftingQueue', 
      'tableCrafting'
    ]),
    elements: () => ELEMENTS
  },
  methods: {
    ...mapActions([
      'assignWorker', 
      'unassignWorker',
      'assignWorkerToTable', 
      'unassignWorkerFromTable',
      'assignWorkerToSlot', 
      'unassignWorkerFromSlot'
    ]),

    getMiningTime:(id) => {
      const el = ELEMENTS[id]
      return el ? `Время добычи: ${el.baseTime * Math.pow(3, el.level - 1)} сек` : ''
    },

    getRemainingTime:(job) => {
      return job ? Math.ceil((100 - job.progress) / 100 * job.totalTime / (job.workers || 1)) : 0
    },

    formatTime:(s) => {
      return s < 60 ? `${s}с` : `${Math.floor(s / 60)}м ${s % 60}с`
    }
  }
}
</script>

<style scoped lang="scss">
.economy-panel {
  width: 100%;
  background: linear-gradient(135deg, #2c3e50, #34495e);
  color: white;
  border-radius: 12px;
  overflow: hidden;
  
  &__content {
    display: flex;
    gap: 20px;
    padding: 15px;
    overflow-x: auto;
    min-height: 200px;

    @media (max-width: 600px) {
      flex-direction: column;
    }
  }

  h3 {
    margin: 0 0 10px;
    font-size: 16px;
    border-bottom: 1px solid rgba(255,255,255,0.2);
    padding-bottom: 5px;
  }

  h4 {
    margin: 0 0 8px;
    font-size: 14px;
    color: #bdc3c7;
  }

  .workers-section, .progress-section, .inventory {
    min-width: 280px;
    background: rgba(0,0,0,0.1);
    border-radius: 8px;
    padding: 10px;

    @media (max-width: 600px) {
      width: 100%;
      min-width: auto;
    }
  }

  .progress-section {
    flex: 2;
  }

  .inventory {
    flex: 1;
    min-width: 400px;

    @media (max-width: 600px) {
      min-width: auto;
    }
  }

  .workers-group {
    margin-bottom: 15px;
    background: rgba(0,0,0,0.2);
    border-radius: 8px;
    padding: 10px;
  }

  .workers-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .worker-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    background: rgba(255,255,255,0.1);
    border-radius: 6px;
    font-size: 13px;

    .worker-controls {
      display: flex;
      gap: 8px;
      align-items: center;
      
      button {
        width: 24px;
        height: 24px;
        border: none;
        border-radius: 4px;
        background: #3498db;
        color: white;
        cursor: pointer;
        font-weight: bold;
        
        &:disabled { opacity: 0.3; cursor: not-allowed; }
        &:hover:not(:disabled) { background: #2980b9; }
      }
      
      .worker-count { min-width: 24px; text-align: center; font-weight: bold; }
    }
  }

  .progress-group {
    margin-bottom: 20px;
  }

  .progress-item {
    margin-bottom: 10px;
    background: rgba(0,0,0,0.2);
    border-radius: 8px;
    padding: 10px;

    .job-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 12px;
    }
  }

  .progress-bar {
    height: 8px;
    background: rgba(255,255,255,0.2);
    border-radius: 4px;
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3498db, #9b59b6);
      transition: width 0.3s;
    }
  }

  .time-remaining {
    font-size: 11px;
    color: #bdc3c7;
    margin-top: 5px;
    text-align: right;
  }

  .inventory-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
    max-height: 300px;
    overflow-y: auto;
    padding: 5px;

    @media (max-width: 600px) {
      max-height: none;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    }
  }

  .inventory-item {
    position: relative;
    background: rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    min-width: 80px;
    transition: transform 0.2s;

    &:hover {
      transform: translateY(-2px);
      background: rgba(255,255,255,0.15);
    }

    .item-icon {
      font-size: 24px;
      margin-bottom: 4px;
    }

    .item-name {
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 2px;
    }

    .item-count {
      font-size: 11px;
      color: #bdc3c7;
    }

    .mine-btn {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 22px;
      height: 22px;
      border: none;
      border-radius: 4px;
      background: #f39c12;
      color: white;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      
      &:disabled { 
        opacity: 0.3; 
        cursor: not-allowed;
        &:hover { transform: none; }
      }
      
      &:hover:not(:disabled) { 
        background: #e67e22;
        transform: scale(1.1);
      }
    }
  }

  .no-workers {
    color: #95a5a6;
    font-style: italic;
    padding: 5px;
    text-align: center;
  }
}
</style>