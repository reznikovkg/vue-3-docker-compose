<template>
  <div class="alchemy">
    <ElementsField />
    <CraftTable />
  </div>
</template>

<script>
import ElementsField from '../Alchemy/ElementsField.vue'
import CraftTable from '../Alchemy/CraftTable.vue'

export default {
  name: 'AlchemyPage',
  components: { ElementsField, CraftTable }
}
</script>

<style scoped>
.alchemy {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #f0f4f8, #c3cfe2);
  overflow: hidden;
}
</style>