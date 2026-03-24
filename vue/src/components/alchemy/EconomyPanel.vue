<template>
  <div class="economy-panel">
    <div class="economy-panel__content">
      <WorkersSection />
      <ProgressSection />
      <InventorySection />
    </div>
  </div>
</template>

<script>
import WorkersSection from './WorkersSection.vue'
import ProgressSection from './ProgressSection.vue'
import InventorySection from './InventorySection.vue'

export default {
  name: 'EconomyPanel',
  components: {
    WorkersSection,
    ProgressSection,
    InventorySection
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
    align-items: stretch;
    min-height: 200px;

    @media (max-width: 600px) {
      flex-direction: column;
    }
  }
}
</style>