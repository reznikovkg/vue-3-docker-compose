<template>
  <div class="alchemy">
    <ElementsField />
    <CraftTable />
  </div>
</template>

<script>
import ElementsField from '../alchemy/ElementsField.vue'
import CraftTable from '../alchemy/CraftTable.vue'

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
  box-sizing: border-box;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>