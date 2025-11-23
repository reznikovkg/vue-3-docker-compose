<template>
  <div class="crafting">
    <div class="crafting-container">
      <div class="crafting-header">
        <h2>Crafting</h2>
        <button class="crafting-header--closeButton" @click="() => closeCrafting()"> × </button>
      </div>
      <div class="crafting-content">
        <div class="crafting-section">
          <Inventory :onItemClick="handleInventoryItemClick" />
        </div>
        <div class="crafting-section">
          <div class="slots">
            <div
              v-for="(slot, index) in recipeSlots"
              :key="index"
              class="slots-recipe"
              :class="{ 'recipe-slot--filled': slot.id }"
              @click="() => removeFromRecipe(index)"
            >
              <img
                v-if="slot.id"
                class="slots-recipe--icon"
                :src="`/src/assets/items/${slot.id}.png`"
                :alt="slot.id"
              />
              <span v-if="slot.count > 1" class="slots-recipe--count">{{ slot.count }}</span>
            </div>
          </div>
        </div>
        <div class="crafting-section">
          <h3>Result</h3>
          <div
            class="slots-result"
            :class="{ 'result-slot--ready': canCraft }"
            @click="() => craftItem()"
          >
            <img
              v-if="craftResult"
              class="slots-result--icon"
              :src="`/src/assets/items/${craftResult.id}.png`"
              :alt="craftResult.id"
            />
            <span v-if="craftResult && craftResult.count > 1" class="slots-result--count">
              {{ craftResult.count }}
            </span>
            <div v-if="!craftResult" class="slots-result--placeholder"> ? </div>
          </div>
          <button v-if="canCraft" class="crafting-button" @click="() => craftItem()">Add</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import Inventory from '@/components/Inventory.vue'

const props = defineProps({
  onClose: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['close'])
const store = useStore()
const recipeSlots = ref(Array.from({ length: 6 }, () => ({ id: '', count: 0 })))
const craftResult = ref(null)
const recipes = [
  {
    ingredients: [
      { id: 'gold', count: 1 },
      { id: 'stick', count: 1 }
    ],
    result: { id: 'key', count: 1 }
  }
]

const handleInventoryItemClick = (item, index) => {
  if (!item || !item.id || item.id.length === 0) return
  const emptySlotIndex = recipeSlots.value.findIndex(slot => slot.id === '')
  if (emptySlotIndex !== -1) {
    const slot = recipeSlots.value[emptySlotIndex]
    slot.id = item.id
    slot.count = 1
    store.dispatch('inventory/selectInventoryItem', index)
    store.dispatch('inventory/useSelectedItem')
    checkRecipe()
  }
}

const canCraft = computed(() => { return !!craftResult.value})

const getRequiredItems = () => {
  const items = []
  recipeSlots.value.forEach(slot => {
    if (slot.id && slot.count > 0) {
      const existing = items.find(item => item.id === slot.id)
      if (existing) {
        existing.count += slot.count
      } else {
        items.push({ id: slot.id, count: slot.count })
      }
    }
  })
  return items
}

const findMatchingRecipe = () => {
  const requiredItems = getRequiredItems()
  for (const recipe of recipes) {
    if (recipe.ingredients.length !== requiredItems.length) continue
    const recipeItems = [...recipe.ingredients].sort((a, b) => a.id.localeCompare(b.id))
    const requiredItemsSorted = [...requiredItems].sort((a, b) => a.id.localeCompare(b.id))
    let match = true
    for (let i = 0; i < recipeItems.length; i++) {
      if (recipeItems[i].id !== requiredItemsSorted[i].id ||
          recipeItems[i].count !== requiredItemsSorted[i].count) {
        match = false
        break
      }
    }
    if (match) {
      return recipe
    }
  }
  return null
}

const checkRecipe = () => {
  const recipe = findMatchingRecipe()
  if (recipe) {
    craftResult.value = { ...recipe.result }
  } else {
    craftResult.value = null
  }
}

const removeFromRecipe = (slotIndex) => {
  if (slotIndex < 0 || slotIndex >= recipeSlots.value.length) return
  const slot = recipeSlots.value[slotIndex]
  if (slot.id && slot.count > 0) {
    store.dispatch('inventory/addToInventory', { 
      id: slot.id, 
      count: slot.count 
    })
    slot.id = ''
    slot.count = 0
  }
  checkRecipe()
}

const craftItem = () => {
  if (!canCraft.value || !craftResult.value) return
  store.dispatch('inventory/addToInventory', craftResult.value)
  recipeSlots.value = Array.from({ length: 9 }, () => ({ id: '', count: 0 }))
  craftResult.value = null
}

const closeCrafting = () => {
  emit('close')
  if (props.onClose) {
    props.onClose()
  }
}
</script>

<style scoped lang="less">
.crafting {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  margin-bottom: 20px;
  &-container {
    background: #2c3e50;
    border-radius: 12px;
    padding: 2rem;
    color: white;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
  }
  &-content {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 2rem;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
  &-button {
    width: 100%;
    padding: 0.75rem 1.5rem;
    background-color: #2ecc71;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background-color: #27ae60;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(46, 204, 113, 0.3);
      cursor: url('/cursors/pointer-cursor.png'), pointer;
    }
    
    &:active {
      transform: translateY(0);
    }
    
    &:disabled {
      background-color: #7f8c8d;
      cursor: not-allowed;
      transform: none;
    }
  }
  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    border-bottom: 2px solid #34495e;
    padding-bottom: 1rem;
    
    &--closeButton {
      background: transparent;
      border: none;
      color: white;
      font-size: 2rem;
      cursor: pointer;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        cursor: url('/cursors/pointer-cursor.png'), pointer;
      }
    }
  }
}
.slots {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 1rem;
  cursor: url('/cursors/pointer-cursor.png'), pointer;
  &-recipe {
    position: relative;
    width: 60px;
    height: 60px;
    background-color: rgba(52, 73, 94, 0.5);
    border: 2px dashed #7f8c8d;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background-color: rgba(52, 73, 94, 0.8);
      border-color: #f1c40f;
      cursor: url('/cursors/pointer-cursor.png'), pointer;
    }
    &--filled {
      border: 2px solid #2ecc71;
      background-color: rgba(46, 204, 113, 0.2);
    }
    &--icon {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 5px;
    }
    &--count {
      position: absolute;
      top: 2px;
      right: 2px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      font-size: 12px;
      padding: 2px 6px;
      border-radius: 10px;
      font-weight: bold;
    }
  }
  &-result {
    position: relative;
    width: 80px;
    height: 80px;
    background-color: rgba(52, 73, 94, 0.5);
    border: 2px solid #7f8c8d;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background-color: rgba(52, 73, 94, 0.8);
      cursor: url('/cursors/pointer-cursor.png'), pointer;
    }
    &--ready {
      border: 2px solid #2ecc71;
      background-color: rgba(46, 204, 113, 0.3);
      box-shadow: 0 0 20px rgba(46, 204, 113, 0.5);
    }
    &--icon {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 10px;
    }
    &--count {
      position: absolute;
      top: 5px;
      right: 5px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      font-size: 14px;
      padding: 3px 8px;
      border-radius: 12px;
      font-weight: bold;
    }
    &--placeholder {
      font-size: 2rem;
      color: #7f8c8d;
    }
  }
}
</style>
