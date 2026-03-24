<template>
  <div class="alchemy">
    <EconomyPanel />
    <div class="alchemy-main">
      <ElementsField />
      <CraftTable />
    </div>
  </div>
</template>

<script>
import ElementsField from '../alchemy/ElementsField.vue'
import CraftTable from '../alchemy/CraftTable.vue'
import EconomyPanel from '../alchemy/EconomyPanel.vue';

export default {
  name: 'AlchemyPage',
  components: { ElementsField, CraftTable, EconomyPanel }
}
</script>

<style scoped>
.alchemy {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 0;
  padding: 20px;
  background: linear-gradient(135deg, #f0f4f8, #c3cfe2);
  box-sizing: border-box;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.alchemy-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
  overflow: hidden;
}

@media (max-width: 600px) {
  .alchemy {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
    padding: 10px;
    position: static;
    overflow: auto;
  }

  .alchemy-main {
    flex-direction: column;
    width: 100%;
    height: auto;
    min-height: auto;
  }
}
</style>