<template>
  <div class="progress-section">
    <ProgressGroup
      v-if="miningJobs && Object.keys(miningJobs).length"
      title="Добыча"
      :items="miningJobsItems"
    />
    <ProgressGroup
      v-if="craftingQueue && craftingQueue.length"
      title="Крафт в слотах"
      :items="craftingItems"
    />
    <ProgressGroup
      v-if="tableCrafting"
      title="Крафт на столе"
      :items="tableCraftingItem"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ProgressGroup from './ProgressGroup.vue'
import { ELEMENTS } from '../../config/elements'

export default {
  name: 'ProgressSection',
  components: { ProgressGroup },
  computed: {
    ...mapGetters(['miningJobs', 'craftingQueue', 'tableCrafting']),
    miningJobsItems() {
      if (!this.miningJobs) return []
      return Object.entries(this.miningJobs).map(([id, job]) => ({
        id: Number(id),
        ...job,
        name: ELEMENTS[id]?.name,
        icon: ELEMENTS[id]?.icon
      }))
    },
    craftingItems() {
      if (!this.craftingQueue) return []
      return this.craftingQueue.map(craft => ({
        id: craft.slotIndex,
        ...craft,
        name: ELEMENTS[craft.resultId]?.name,
        icon: ELEMENTS[craft.resultId]?.icon
      }))
    },
    tableCraftingItem() {
      if (!this.tableCrafting) return null
      return [{
        id: 'table',
        ...this.tableCrafting,
        name: ELEMENTS[this.tableCrafting.resultId]?.name,
        icon: ELEMENTS[this.tableCrafting.resultId]?.icon
      }]
    }
  }
}
</script>

<style scoped lang="scss">
.progress-section {
  flex: 2;
  min-width: 280px;
  background: rgba(0,0,0,0.1);
  border-radius: 8px;
  padding: 10px;

  @media (max-width: 600px) {
    width: 100%;
    min-width: auto;
  }
}
</style>