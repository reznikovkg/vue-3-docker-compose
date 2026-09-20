<template>
  <div class="game">
    <header class="game__header">
      <h1>Алхимик</h1>
      <div class="game__tabs">
        <button :class="{ active: mode === 'table' }" @click="setMode('table')">Стол</button>
        <button :class="{ active: mode === 'slots' }" @click="setMode('slots')">Слоты 3×3</button>
      </div>
    </header>

    <p
      v-if="message"
      class="game__message"
      :class="{ 'game__message--error': message.success === false }"
    >
      {{ message.success ? `Открыт новый элемент: ${message.name}!` : 'Такой формулы не существует' }}
    </p>

    <div class="game__field">
      <OpenElementsGrid :elements="openElements" @pick="onPick" />
    </div>

    <CraftTable
      v-if="mode === 'table'"
      :items="tableItems"
      @remove="onRemoveFromTable"
      @reset="onResetTable"
      @mix="onMix"
    />

    <SlotCraft
      v-else
      :slots="slots"
      @slot-click="onSlotClick"
      @reset="onResetSlots"
      @craft="onCraft"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import OpenElementsGrid from '@/components/game/OpenElementsGrid.vue'
import CraftTable from '@/components/game/CraftTable.vue'
import SlotCraft from '@/components/game/SlotCraft.vue'

const store = useStore()
const mode = ref('table')
const pendingElementId = ref(null)

const openElements = computed(() => store.getters['alchemy/openElements'])
const tableItems = computed(() => store.getters['alchemy/tableItems'])
const slots = computed(() => store.getters['alchemy/slots'])
const message = computed(() => store.getters['alchemy/lastResult'])

function setMode (value) {
  mode.value = value
  pendingElementId.value = null
}

function onPick (elementId) {
  if (mode.value === 'table') {
    store.dispatch('alchemy/addToTable', elementId)
  } else {
    pendingElementId.value = elementId
  }
}

function onRemoveFromTable (elementId) {
  store.dispatch('alchemy/removeFromTable', elementId)
}

function onResetTable () {
  store.dispatch('alchemy/resetTable')
}

function onMix () {
  store.dispatch('alchemy/mixTable')
}

function onSlotClick (index) {
  const currentSlot = slots.value[index]
  if (currentSlot) {
    store.dispatch('alchemy/clearSlot', index)
    return
  }
  if (pendingElementId.value) {
    store.dispatch('alchemy/placeInSlot', { index, elementId: pendingElementId.value })
    pendingElementId.value = null
  }
}

function onResetSlots () {
  store.dispatch('alchemy/clearSlots')
}

function onCraft () {
  store.dispatch('alchemy/craftSlots')
}
</script>

<style scoped lang="scss">
.game {
  display: flex;
  flex-direction: column;
  width: 790px;
  height: 790px;
  background: #12121a;
  color: #eee;
  font-family: sans-serif;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 0 0 1px #2a2a36;

  &__header {
    height: 48px;
    padding: 0 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #2a2a36;
    flex-shrink: 0;

    h1 {
      font-size: 1.3rem;
      margin: 0;
    }
  }

  &__tabs {
    display: flex;
    gap: 6px;

    button {
      background: #23232e;
      border: 1px solid #3a3a4a;
      color: #aaa;
      border-radius: 8px;
      padding: 5px 10px;
      font-size: 0.7rem;
      cursor: pointer;

      &.active {
        background: #5b7fff;
        color: #fff;
        border-color: #5b7fff;
      }
    }
  }

  &__message {
    height: 28px;
    text-align: center;
    padding: 0;
    margin: 0;
    line-height: 28px;
    font-size: 0.9rem;
    color: #7cfc9a;
    flex-shrink: 0;

    &--error {
      color: #ff8080;
    }
  }

  &__field {
    height: 484px;
    flex-shrink: 0;
    overflow: hidden;
  }
}
</style>