<template>
  <div class="game">
    <Message
      :message="message" 
      @close="() => clearMessage()"
    >
    </Message>

    <AlchemyGrid>
    </AlchemyGrid>

    <AlchemyTable>
    </AlchemyTable>
  </div>
</template>

<script setup>
import Message from '../Message.vue'
import AlchemyGrid from '../AlchemyGrid.vue'
import AlchemyTable from '../AlchemyTable.vue'
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const message = computed(() => store.getters['alchemy/message'])

const clearMessage = () => {
  store.dispatch('alchemy/clearMessage')
}
</script>

<style scoped lang="scss">
.game {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: #1e293b;
  color: white;
  font-family: Arial, sans-serif;
  padding: 10px;
  gap: 10px;
}
</style>