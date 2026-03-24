<template>
  <div class="workers-section">
    <h3 class="workers-section__title">Рабочие ({{ workers.free }}/{{ workers.total }})</h3>
    <WorkersGroup
      title="Добыча ресурсов"
      :items="workersAssigned"
      :show-empty="true"
      empty-text="Нет рабочих на добыче"
      :workers-free="workers.free"
      @decrement="(id) => unassignWorker(id)"
      @increment="(id) => assignWorker(id)"
    />
    <WorkersGroup
      v-if="craftingQueue && craftingQueue.length"
      title="Крафт в слотах"
      :items="craftingItems"
      :workers-free="workers.free"
      @decrement="(slotIndex) => unassignWorkerFromSlot(slotIndex)"
      @increment="(slotIndex) => assignWorkerToSlot(slotIndex)"
    />
    <WorkersGroup
      v-if="tableCrafting"
      title="Крафт на столе"
      :items="tableCraftingItem"
      :workers-free="workers.free"
      @decrement="() => unassignWorkerFromTable()"
      @increment="() => assignWorkerToTable()"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import WorkersGroup from './WorkersGroup.vue'
import { ELEMENTS } from '../../config/elements'

export default {
  name: 'WorkersSection',
  components: { WorkersGroup },
  computed: {
    ...mapGetters(['workers', 'craftingQueue', 'tableCrafting']),
    workersAssigned() {
      if (!this.workers.assigned) {
        return []
      }
      return Object.entries(this.workers.assigned).map(([id, count]) => ({
        id: Number(id),
        count,
        name: ELEMENTS[id]?.name,
        icon: ELEMENTS[id]?.icon
      }))
    },
    craftingItems() {
      if (!this.craftingQueue) {
        return []
      }
      return this.craftingQueue.map(craft => ({
        id: craft.slotIndex,
        count: craft.workers || 0,
        name: ELEMENTS[craft.resultId]?.name,
        icon: ELEMENTS[craft.resultId]?.icon
      }))
    },
    tableCraftingItem() {
      if (!this.tableCrafting) {
        return null
      }
      return [{
        id: 'table',
        count: this.tableCrafting.workers,
        name: ELEMENTS[this.tableCrafting.resultId]?.name,
        icon: ELEMENTS[this.tableCrafting.resultId]?.icon
      }]
    }
  },
  methods: {
    ...mapActions([
      'assignWorker', 
      'unassignWorker',
      'assignWorkerToTable', 
      'unassignWorkerFromTable',
      'assignWorkerToSlot', 
      'unassignWorkerFromSlot'
    ])
  }
}
</script>

<style scoped lang="scss">
.workers-section {
  min-width: 280px;
  background: rgba(0,0,0,0.1);
  border-radius: 8px;
  padding: 10px;

  @media (max-width: 600px) {
    width: 100%;
    min-width: auto;
  }

  &__title {
    margin: 0 0 10px;
    font-size: 16px;
    border-bottom: 1px solid rgba(255,255,255,0.2);
    padding-bottom: 5px;
  }
}
</style>