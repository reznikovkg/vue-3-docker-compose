import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGameStore = defineStore('game', () => {
  // State
  const boat = ref({ x: 0, y: 0, direction: 1, rowing: false })
  const inventory = ref({ common: 0, rare: 0, legendary: 0 })
  const isFishing = ref(false)
  const zones = ref([])

  // Persist
  const saved = localStorage.getItem('refactored_game_state')
  if (saved) {
    const parsed = JSON.parse(saved)
    boat.value = parsed.boat || boat.value
    inventory.value = parsed.inventory || inventory.value
    isFishing.value = parsed.isFishing || false
    zones.value = parsed.zones || []
  }

  const save = () => {
    localStorage.setItem('refactored_game_state', JSON.stringify({
      boat: boat.value,
      inventory: inventory.value,
      isFishing: isFishing.value,
      zones: zones.value
    }))
  }

  // Getters
  const getBoat = computed(() => boat.value)
  const getInventory = computed(() => inventory.value)
  const getIsFishing = computed(() => isFishing.value)
  const getZones = computed(() => zones.value)
  const getCurrentZone = computed(() => {
    const b = boat.value
    for (const zone of zones.value) {
      if (zone.type === 'high' && Math.abs(b.x - zone.x) < 10 && Math.abs(b.y - zone.y) < 10) return 'Высокий'
    }
    for (const zone of zones.value) {
      if (zone.type === 'medium' && Math.abs(b.x - zone.x) < 25 && Math.abs(b.y - zone.y) < 25) return 'Средний'
    }
    return 'Обычный'
  })

  // Actions
  const moveBoat = (dx, dy) => {
    boat.value.x += dx
    boat.value.y += dy
    save()
  }

  const setDirection = (dir) => {
    boat.value.direction = dir
    save()
  }

  const toggleFishing = () => {
    isFishing.value = !isFishing.value
    save()
  }

  const addFish = (type) => {
    if (inventory.value[type] !== undefined) inventory.value[type]++
    save()
  }

  const setRowing = (val) => {
    boat.value.rowing = val
    save()
  }

  const generateZones = () => {
    const newZones = []
    const bx = boat.value.x, by = boat.value.y
    for (let i = 0; i < 500; i++) {
      newZones.push({ type: 'medium', x: Math.floor(Math.random() * 2500 - 1250) + bx, y: Math.floor(Math.random() * 2500 - 1250) + by })
    }
    for (let i = 0; i < 100; i++) {
      newZones.push({ type: 'high', x: Math.floor(Math.random() * 2500 - 1250) + bx, y: Math.floor(Math.random() * 2500 - 1250) + by })
    }
    zones.value = newZones
    save()
  }

  const removeCurrentZone = () => {
    const b = boat.value
    zones.value = zones.value.filter(z => !(Math.abs(z.x - b.x) <= 25 && Math.abs(z.y - b.y) <= 25))
    save()
  }

  return {
    boat, inventory, isFishing, zones,
    getBoat, getInventory, getIsFishing, getZones, getCurrentZone,
    moveBoat, setDirection, toggleFishing, addFish, setRowing, generateZones, removeCurrentZone
  }
})

