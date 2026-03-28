<template>
  <div class="alchemist">
    <div class="alchemist__top">
      <ResourcesPanel/>
      <WorkersPanel/>
    </div>
    <ElementsGrid/>
    <div class="alchemist__tables">
      <CraftTable/>
      <AlchemistTable/>
    </div>
  </div>
</template>

<script>
import ElementsGrid from "@/components/pages/Elements.vue"
import AlchemistTable from "@/components/pages/Table.vue"
import CraftTable from "@/components/pages/CraftTable.vue"
import WorkersPanel from "@/components/pages/WorkersPanel.vue"
import ResourcesPanel from "@/components/pages/ResourcesPanel.vue"

export default {
  name: 'AlchemistGame',
  components: {
    ElementsGrid,
    AlchemistTable,
    CraftTable,
    WorkersPanel,
    ResourcesPanel
  }
}
</script>

<style lang="scss">
.alchemist {
  height: 100vh;
  width: 50vw; 
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;
  
  &__top {
    display: grid;
    grid-template-columns: 2fr 1fr; 
    gap: 40px;
    border-bottom: 3px solid #770059;
    padding-bottom: 20px;
    flex-shrink: 0;
    min-height: 0;
  }

  &__tables{
    display:flex;
    gap:40px;
    justify-content:center;
    flex: 1; 
    min-height: 0; 
  }
}
</style>