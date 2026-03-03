<template>
  <div class="alchemist">
    <ElementsGrid/>
    <AlchemistTable/>
  </div>
</template>

<script>
import ElementsGrid from "@/components/pages/Elements.vue"
import AlchemistTable from "@/components/pages/Table.vue"


export default {
  name: 'AlchemistGame',
  components: {
    ElementsGrid,
    AlchemistTable
  }
}
</script>

<style lang="scss">
.alchemist {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>