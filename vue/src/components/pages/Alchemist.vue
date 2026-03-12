<template>
  <div class="alchemist">
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

export default {
  name: 'AlchemistGame',
  components: {
    ElementsGrid,
    AlchemistTable,
    CraftTable
  }
}
</script>

<style lang="scss">
.alchemist {
  height: 100vh;
  display: flex;
  flex-direction: column;
  
  &__tables{
    display:flex;
    gap:40px;
    justify-content:center;
    padding:20px;
  }
}

</style>